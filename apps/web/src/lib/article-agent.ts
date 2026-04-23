import { callOpenAiJson } from "./ai"
import {
  getKeywordMetrics,
  getKeywordSuggestions,
  getBulkKeywordDifficulty,
  isDataForSeoConfigured,
  volumeTier,
  difficultyTier,
  type KeywordSuggestion,
} from "./dataforseo"
import { fetchSerpWithCache } from "./serper"
import { getOptionalAdminSupabaseClient } from "./supabase/admin"
import { getServerSupabaseClient } from "./supabase/server"

function getDb() {
  return getOptionalAdminSupabaseClient() ?? getServerSupabaseClient()
}

// ----------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------

export interface ArticleBriefing {
  topic: string
  primary_keyword?: string
  tone?: string
  target_length?: string
  additional_instructions?: string
}

export interface KeywordData {
  keyword: string
  search_volume: number
  volume_tier: "alto" | "médio" | "baixo"
  keyword_difficulty: number
  difficulty_tier: "fácil" | "médio" | "difícil"
  cpc: number
  competition_level: "LOW" | "MEDIUM" | "HIGH"
  search_intent: string
}

export interface ResearchResult {
  queries: string[]
  key_findings: string[]
  competitor_outlines: any[]
  keyword_data?: {
    primary: KeywordData | null
    suggestions: KeywordData[]
  }
}

export interface StructureResult {
  title: string
  meta_description: string
  headings: { level: number; text: string; intent: string }[]
}

export interface WriteResult {
  content: string
}

export interface ReviewResult {
  seo_score: number
  readability_score: number
  feedback: string[]
  approved: boolean
  final_content: string
}

// ----------------------------------------------------------------------
// Phase 0: Initialization
// ----------------------------------------------------------------------

export async function initializeArticleGeneration(
  tenantId: string,
  postId: string,
  strategyId: string | null,
  briefing: ArticleBriefing
) {
  const db = await getDb()

  const { data, error } = await (db as any)
    .from("article_generations")
    .insert({
      tenant_id: tenantId,
      post_id: postId,
      strategy_id: strategyId,
      topic: briefing.topic,
      primary_keyword: briefing.primary_keyword,
      tone: briefing.tone || "profissional e acessível",
      target_length: briefing.target_length || "médio (1000 palavras)",
      additional_instructions: briefing.additional_instructions,
      phase: "briefing",
    })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(`Failed to initialize article generation: ${error?.message}`)
  }

  // Link post to generation
  await (db as any)
    .from("posts")
    .update({ generation_id: data.id })
    .eq("id", postId)
    .eq("tenant_id", tenantId)

  return data.id
}

// ----------------------------------------------------------------------
// Phase 1: Research
// ----------------------------------------------------------------------

export async function runResearchPhase(generationId: string, tenantId: string) {
  const db = await getDb()

  const { data: gen, error: fetchErr } = await (db as any)
    .from("article_generations")
    .select("*")
    .eq("id", generationId)
    .eq("tenant_id", tenantId)
    .single()

  if (fetchErr || !gen) throw new Error("Generation not found.")

  // Update status to research
  await (db as any)
    .from("article_generations")
    .update({ phase: "research", started_at: new Date().toISOString() })
    .eq("id", generationId)

  try {
    const queryToSearch = gen.primary_keyword || gen.topic

    // 1. SERP snapshot (Serper.dev) — competitor titles + snippets
    const serpData = await fetchSerpWithCache(queryToSearch, tenantId)

    // 2. DataForSEO — keyword metrics, suggestions, difficulty (runs in parallel)
    let keywordData: ResearchResult["keyword_data"] | undefined
    if (isDataForSeoConfigured()) {
      const [metricsRaw, suggestions] = await Promise.all([
        getKeywordMetrics([queryToSearch]),
        getKeywordSuggestions(queryToSearch, 15),
      ])

      const primaryRaw = metricsRaw[0] ?? null
      const suggestionKeywords = suggestions.map((s) => s.keyword)

      // Enrich suggestions with difficulty scores in one batch call
      const difficulties = suggestionKeywords.length
        ? await getBulkKeywordDifficulty(suggestionKeywords)
        : []
      const difficultyMap = new Map(difficulties.map((d) => [d.keyword, d.difficulty]))

      const toKeywordData = (
        keyword: string,
        volume: number,
        difficulty: number,
        cpc: number,
        competition_level: KeywordSuggestion["competition_level"],
        search_intent: string
      ): KeywordData => ({
        keyword,
        search_volume: volume,
        volume_tier: volumeTier(volume),
        keyword_difficulty: difficulty,
        difficulty_tier: difficultyTier(difficulty),
        cpc,
        competition_level,
        search_intent,
      })

      keywordData = {
        primary: primaryRaw
          ? toKeywordData(
              primaryRaw.keyword,
              primaryRaw.search_volume,
              difficultyMap.get(primaryRaw.keyword) ?? 0,
              primaryRaw.cpc,
              primaryRaw.competition_level,
              "informational"
            )
          : null,
        suggestions: suggestions.map((s) =>
          toKeywordData(
            s.keyword,
            s.search_volume,
            difficultyMap.get(s.keyword) ?? s.keyword_difficulty,
            s.cpc,
            s.competition_level,
            s.search_intent
          )
        ),
      }
    }

    // 3. AI analysis — now enriched with real keyword data
    const keywordContext = keywordData?.primary
      ? `
Primary keyword metrics:
- Search volume: ${keywordData.primary.search_volume.toLocaleString("pt-BR")}/mês (${keywordData.primary.volume_tier})
- Keyword difficulty: ${keywordData.primary.keyword_difficulty}/100 (${keywordData.primary.difficulty_tier})
- CPC: R$ ${keywordData.primary.cpc.toFixed(2)}
- Search intent: ${keywordData.primary.search_intent}

Top related keywords by volume:
${
  keywordData.suggestions
    .slice(0, 8)
    .map(
      (s) =>
        `- "${s.keyword}": ${s.search_volume.toLocaleString("pt-BR")}/mês, dificuldade ${s.keyword_difficulty}/100, intenção: ${s.search_intent}`
    )
    .join("\n")
}`
      : ""

    const researchPrompt = `
      You are an expert SEO researcher writing in Brazilian Portuguese.
      Topic: ${gen.topic}
      Primary Keyword: ${gen.primary_keyword || "N/A"}
      ${keywordContext}

      Top Google search results for this keyword:
      ${
        serpData?.results
          ?.slice(0, 10)
          .map((r: any) => `- [Position ${r.position}] ${r.title}: ${r.snippet}`)
          .join("\n") || "No SERP data available."
      }

      Based on the keyword data and competitor SERP results:
      1. Identify what users are really looking for (search intent signals)
      2. Extract key content gaps not well covered by competitors
      3. Summarize the typical structure of top-ranking content
      4. Recommend the best angle for this article given difficulty and volume
    `

    const researchAiResult = await callOpenAiJson<Omit<ResearchResult, "keyword_data">>({
      messages: [{ role: "user", content: researchPrompt }],
      schemaHint: `{
        "queries": ["string"],
        "key_findings": ["string"],
        "competitor_outlines": ["string"]
      }`,
    })

    const fullResult: ResearchResult = { ...researchAiResult, keyword_data: keywordData }

    // Save
    await (db as any)
      .from("article_generations")
      .update({ research_result: fullResult })
      .eq("id", generationId)

    return fullResult
  } catch (error: any) {
    await markAsFailed(generationId, error.message)
    throw error
  }
}

// ----------------------------------------------------------------------
// Phase 2: Structure
// ----------------------------------------------------------------------

export async function runStructurePhase(generationId: string, tenantId: string) {
  const db = await getDb()

  const { data: gen, error: fetchErr } = await (db as any)
    .from("article_generations")
    .select("*")
    .eq("id", generationId)
    .eq("tenant_id", tenantId)
    .single()

  if (fetchErr || !gen) throw new Error("Generation not found.")

  // Update status
  await (db as any)
    .from("article_generations")
    .update({ phase: "structure" })
    .eq("id", generationId)

  try {
    const structurePrompt = `
      You are an expert SEO Content Strategist.
      Topic: ${gen.topic}
      Tone: ${gen.tone}
      Target Length: ${gen.target_length}
      Additional Instructions: ${gen.additional_instructions || "None"}
      
      Research Findings:
      ${JSON.stringify(gen.research_result)}

      Create a highly optimized, scannable outline for this article.
      Provide a catchy title, a meta description, and a structured list of headings (H2, H3).
      For each heading, briefly state the user intent or what should be covered.
    `

    const structureAiResult = await callOpenAiJson<StructureResult>({
      messages: [{ role: "user", content: structurePrompt }],
      schemaHint: `{
        "title": "string",
        "meta_description": "string",
        "headings": [{"level": 2, "text": "string", "intent": "string"}]
      }`,
    })

    // Save
    await (db as any)
      .from("article_generations")
      .update({ structure_result: structureAiResult })
      .eq("id", generationId)

    // Update Post
    await (db as any)
      .from("posts")
      .update({
        title: structureAiResult.title,
        meta_title: structureAiResult.title,
        meta_description: structureAiResult.meta_description,
      })
      .eq("id", gen.post_id)

    return structureAiResult
  } catch (error: any) {
    await markAsFailed(generationId, error.message)
    throw error
  }
}

// ----------------------------------------------------------------------
// Phase 3: Write
// ----------------------------------------------------------------------

export async function runWritePhase(generationId: string, tenantId: string) {
  const db = await getDb()

  const { data: gen, error: fetchErr } = await (db as any)
    .from("article_generations")
    .select("*")
    .eq("id", generationId)
    .eq("tenant_id", tenantId)
    .single()

  if (fetchErr || !gen) throw new Error("Generation not found.")

  // Update status
  await (db as any)
    .from("article_generations")
    .update({ phase: "write" })
    .eq("id", generationId)

  try {
    const writePrompt = `
      You are a Senior Content Writer.
      Write the full article based on the following structure and research.
      Use Markdown format. Use standard markdown headings (##, ###).
      
      Topic: ${gen.topic}
      Tone: ${gen.tone}
      Target Length: ${gen.target_length}
      
      Structure:
      ${JSON.stringify(gen.structure_result)}

      Important Guidelines:
      - Write in a natural, engaging tone (not robotic).
      - Ensure high readability with short paragraphs and bullet points where appropriate.
      - Naturally incorporate the primary keyword: ${gen.primary_keyword || "N/A"}
      - Output ONLY the markdown content.
    `

    // We can't use callOpenAiJson here because we want raw markdown string, 
    // but wrapping it in JSON ensures it doesn't break.
    const writeAiResult = await callOpenAiJson<WriteResult>({
      messages: [{ role: "user", content: writePrompt }],
      schemaHint: `{"content": "string (markdown)"}`,
    })

    // Save
    await (db as any)
      .from("article_generations")
      .update({ write_result: writeAiResult })
      .eq("id", generationId)

    // Update Post
    await (db as any)
      .from("posts")
      .update({
        content: writeAiResult.content,
      })
      .eq("id", gen.post_id)

    return writeAiResult
  } catch (error: any) {
    await markAsFailed(generationId, error.message)
    throw error
  }
}

// ----------------------------------------------------------------------
// Phase 4: Review
// ----------------------------------------------------------------------

export async function runReviewPhase(generationId: string, tenantId: string) {
  const db = await getDb()

  const { data: gen, error: fetchErr } = await (db as any)
    .from("article_generations")
    .select("*")
    .eq("id", generationId)
    .eq("tenant_id", tenantId)
    .single()

  if (fetchErr || !gen) throw new Error("Generation not found.")

  // Update status
  await (db as any)
    .from("article_generations")
    .update({ phase: "review" })
    .eq("id", generationId)

  try {
    const reviewPrompt = `
      You are a strict SEO Editor.
      Review the following article content.
      
      Topic: ${gen.topic}
      Primary Keyword: ${gen.primary_keyword || "N/A"}
      
      Content:
      ${(gen.write_result as any)?.content}

      Evaluate the article on:
      1. SEO Score (0-100) based on keyword usage and structure.
      2. Readability Score (0-100).
      
      If you see minor issues, you can fix them and return the \`final_content\`. If it's good, return the original content.
      Provide a list of feedback points.
    `

    const reviewAiResult = await callOpenAiJson<ReviewResult>({
      messages: [{ role: "user", content: reviewPrompt }],
      schemaHint: `{
        "seo_score": 0,
        "readability_score": 0,
        "feedback": ["string"],
        "approved": true,
        "final_content": "string (markdown)"
      }`,
    })

    // Save
    await (db as any)
      .from("article_generations")
      .update({ 
        review_result: reviewAiResult,
        phase: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", generationId)

    // Update Post with final content and SEO score
    await (db as any)
      .from("posts")
      .update({
        content: reviewAiResult.final_content,
        seo_score: reviewAiResult.seo_score,
      })
      .eq("id", gen.post_id)

    return reviewAiResult
  } catch (error: any) {
    await markAsFailed(generationId, error.message)
    throw error
  }
}

async function markAsFailed(generationId: string, errorMsg: string) {
  const db = await getDb()
  await (db as any)
    .from("article_generations")
    .update({ phase: "failed", error_message: errorMsg, completed_at: new Date().toISOString() })
    .eq("id", generationId)
}
