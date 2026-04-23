import { NextResponse } from "next/server"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import {
  getKeywordMetrics,
  getKeywordSuggestions,
  getBulkKeywordDifficulty,
  isDataForSeoConfigured,
  volumeTier,
  difficultyTier,
} from "@/lib/dataforseo"

// POST /api/dataforseo/keywords
// Body: { keyword: string; strategy_id?: string; save?: boolean }
//
// Returns keyword metrics + suggestions for the strategy keywords screen.
// When save=true, upserts results into keyword_candidates for the given strategy.

export async function POST(req: Request) {
  try {
    const supabase = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient())
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isDataForSeoConfigured()) {
      return NextResponse.json(
        { error: "DataForSEO credentials not configured" },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { keyword, strategy_id, save = false } = body

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 })
    }

    // Fetch metrics and suggestions in parallel
    const [metricsRaw, suggestions] = await Promise.all([
      getKeywordMetrics([keyword]),
      getKeywordSuggestions(keyword, 20),
    ])

    // Batch difficulty for suggestions
    const suggestionKeywords = suggestions.map((s) => s.keyword)
    const difficulties = suggestionKeywords.length
      ? await getBulkKeywordDifficulty(suggestionKeywords)
      : []
    const diffMap = new Map(difficulties.map((d) => [d.keyword, d.difficulty]))

    const primaryRaw = metricsRaw[0] ?? null
    const primary = primaryRaw
      ? {
          keyword: primaryRaw.keyword,
          search_volume: primaryRaw.search_volume,
          volume_tier: volumeTier(primaryRaw.search_volume),
          keyword_difficulty: diffMap.get(primaryRaw.keyword) ?? 0,
          difficulty_tier: difficultyTier(diffMap.get(primaryRaw.keyword) ?? 0),
          cpc: primaryRaw.cpc,
          competition_level: primaryRaw.competition_level,
          monthly_searches: primaryRaw.monthly_searches,
        }
      : null

    const enrichedSuggestions = suggestions.map((s) => ({
      keyword: s.keyword,
      search_volume: s.search_volume,
      volume_tier: volumeTier(s.search_volume),
      keyword_difficulty: diffMap.get(s.keyword) ?? s.keyword_difficulty,
      difficulty_tier: difficultyTier(diffMap.get(s.keyword) ?? s.keyword_difficulty),
      cpc: s.cpc,
      competition_level: s.competition_level,
      search_intent: s.search_intent,
    }))

    // Optionally persist to keyword_candidates
    if (save && strategy_id) {
      const allKeywords = [
        ...(primary ? [{ ...primary, search_intent: "informational" }] : []),
        ...enrichedSuggestions,
      ]

      const rows = allKeywords.map((k) => ({
        strategy_id,
        keyword: k.keyword,
        search_volume_int: k.search_volume,
        difficulty: k.keyword_difficulty,
        cpc: k.cpc ?? null,
        competition_level: k.competition_level ?? null,
        search_intent: k.search_intent ?? null,
        source: "dataforseo",
      }))

      if (rows.length) {
        await (supabase as any)
          .from("keyword_candidates")
          .upsert(rows, { onConflict: "strategy_id,keyword", ignoreDuplicates: false })
      }
    }

    return NextResponse.json({
      success: true,
      primary,
      suggestions: enrichedSuggestions,
    })
  } catch (error: any) {
    console.error("DataForSEO keywords error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
