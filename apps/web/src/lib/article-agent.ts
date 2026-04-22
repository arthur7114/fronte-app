import { callOpenAiJson } from "./ai"
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

export interface ResearchResult {
  queries: string[]
  key_findings: string[]
  competitor_outlines: any[]
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
    // 1. Figure out search query
    const queryToSearch = gen.primary_keyword || gen.topic

    // 2. Do real SERP research
    const serpData = await fetchSerpWithCache(queryToSearch, tenantId)

    // 3. Extract insights using AI
    const researchPrompt = `
      You are an expert SEO researcher.
      Topic: ${gen.topic}
      Primary Keyword: ${gen.primary_keyword || "N/A"}
      
      Below are the top Google search results for this keyword:
      ${
        serpData?.results
          ?.slice(0, 10)
          .map((r: any) => `- [Position ${r.position}] ${r.title}: ${r.snippet}`)
          .join("\n") || "No SERP data available."
      }

      Analyze the competitor content and identify what users are looking for.
      Provide key findings and a summary of what the competitor outlines likely look like.
    `

    const researchAiResult = await callOpenAiJson<ResearchResult>({
      messages: [{ role: "user", content: researchPrompt }],
      schemaHint: `{
        "queries": ["string"],
        "key_findings": ["string"],
        "competitor_outlines": ["string"]
      }`,
    })

    // Save
    await (db as any)
      .from("article_generations")
      .update({ research_result: researchAiResult })
      .eq("id", generationId)

    return researchAiResult
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
