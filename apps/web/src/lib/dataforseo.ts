const BASE_URL = "https://api.dataforseo.com/v3"

// Brazil defaults — target audience is pt-BR
const DEFAULT_LOCATION = 2076 // Brazil
const DEFAULT_LANGUAGE = "pt"

function authHeaders(): HeadersInit {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD not configured")
  }
  const token = Buffer.from(`${login}:${password}`).toString("base64")
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`DataForSEO ${path} — ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KeywordMetrics {
  keyword: string
  search_volume: number
  competition_level: "LOW" | "MEDIUM" | "HIGH"
  competition_index: number
  cpc: number
  monthly_searches: { year: number; month: number; search_volume: number }[]
}

export interface KeywordSuggestion {
  keyword: string
  search_volume: number
  keyword_difficulty: number
  cpc: number
  competition_level: "LOW" | "MEDIUM" | "HIGH"
  search_intent: "informational" | "navigational" | "commercial" | "transactional"
}

export interface KeywordDifficulty {
  keyword: string
  difficulty: number
}

// ─── Keywords Data API ────────────────────────────────────────────────────────

/**
 * Returns real search volume + CPC for up to 1,000 keywords (Google Ads data).
 * Costs 1 task + $0.0001/keyword.
 */
export async function getKeywordMetrics(
  keywords: string[],
  locationCode = DEFAULT_LOCATION,
  languageCode = DEFAULT_LANGUAGE
): Promise<KeywordMetrics[]> {
  if (!keywords.length) return []

  const json: any = await post("/keywords_data/google_ads/search_volume/live", [
    { keywords, location_code: locationCode, language_code: languageCode },
  ])

  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? []
  return items.map((item) => ({
    keyword: item.keyword,
    search_volume: item.search_volume ?? 0,
    competition_level: item.competition ?? "LOW",
    competition_index: item.competition_index ?? 0,
    cpc: item.cpc ?? 0,
    monthly_searches: item.monthly_searches ?? [],
  }))
}

// ─── DataForSEO Labs API ──────────────────────────────────────────────────────

/**
 * Returns keyword suggestions for a seed keyword with volume + difficulty + intent.
 * Costs $0.01/task + $0.0001/item.
 */
export async function getKeywordSuggestions(
  keyword: string,
  limit = 20,
  locationCode = DEFAULT_LOCATION,
  languageCode = DEFAULT_LANGUAGE
): Promise<KeywordSuggestion[]> {
  const json: any = await post("/dataforseo_labs/google/keyword_suggestions/live", [
    {
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      include_seed_keyword: true,
      order_by: ["keyword_info.search_volume,desc"],
    },
  ])

  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? []
  return items.map((item) => ({
    keyword: item.keyword,
    search_volume: item.keyword_info?.search_volume ?? 0,
    keyword_difficulty: item.keyword_properties?.keyword_difficulty ?? 0,
    cpc: item.keyword_info?.cpc ?? 0,
    competition_level: item.keyword_info?.competition_level ?? "LOW",
    search_intent: item.search_intent_info?.main_intent ?? "informational",
  }))
}

/**
 * Returns keyword difficulty (0-100) for up to 1,000 keywords.
 * 0 = easy, 100 = very hard. Logarithmic scale.
 * Costs $0.01/task + $0.0001/item.
 */
export async function getBulkKeywordDifficulty(
  keywords: string[],
  locationCode = DEFAULT_LOCATION,
  languageCode = DEFAULT_LANGUAGE
): Promise<KeywordDifficulty[]> {
  if (!keywords.length) return []

  const json: any = await post("/dataforseo_labs/google/bulk_keyword_difficulty/live", [
    { keywords, location_code: locationCode, language_code: languageCode },
  ])

  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? []
  return items.map((item) => ({
    keyword: item.keyword,
    difficulty: item.keyword_difficulty ?? 0,
  }))
}

/**
 * Returns keywords that a competitor domain ranks for in organic search.
 * Useful for gap analysis and Share of Voice.
 * Costs $0.01/task + $0.0001/item.
 */
export async function getCompetitorRankedKeywords(
  domain: string,
  limit = 50,
  locationCode = DEFAULT_LOCATION,
  languageCode = DEFAULT_LANGUAGE
): Promise<{ keyword: string; position: number; search_volume: number; url: string }[]> {
  const json: any = await post("/dataforseo_labs/google/ranked_keywords/live", [
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      order_by: ["keyword_data.keyword_info.search_volume,desc"],
    },
  ])

  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? []
  return items.map((item) => ({
    keyword: item.keyword_data?.keyword ?? "",
    position: item.ranked_serp_element?.serp_item?.rank_absolute ?? 0,
    search_volume: item.keyword_data?.keyword_info?.search_volume ?? 0,
    url: item.ranked_serp_element?.serp_item?.url ?? "",
  }))
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Checks whether DataForSEO credentials are configured.
 */
export function isDataForSeoConfigured(): boolean {
  return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD)
}

/**
 * Maps search volume to a human-readable tier for display in the UI.
 */
export function volumeTier(volume: number): "alto" | "médio" | "baixo" {
  if (volume >= 5000) return "alto"
  if (volume >= 500) return "médio"
  return "baixo"
}

/**
 * Maps keyword difficulty to a human-readable tier.
 */
export function difficultyTier(difficulty: number): "fácil" | "médio" | "difícil" {
  if (difficulty >= 60) return "difícil"
  if (difficulty >= 30) return "médio"
  return "fácil"
}
