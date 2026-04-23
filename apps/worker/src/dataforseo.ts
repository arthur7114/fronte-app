/**
 * DataForSEO API client — worker-side copy.
 * Mirrors apps/web/src/lib/dataforseo.ts for the subset of endpoints
 * used in background enrichment jobs.
 */

const BASE_URL = "https://api.dataforseo.com/v3";

// Brazil defaults — target audience is pt-BR
const DEFAULT_LOCATION = 2076; // Brazil
const DEFAULT_LANGUAGE = "pt";

function authHeaders(): Record<string, string> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD not configured");
  }
  const token = Buffer.from(`${login}:${password}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`DataForSEO ${path} — ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  competition_level: "LOW" | "MEDIUM" | "HIGH";
  competition_index: number;
  cpc: number;
}

export interface KeywordDifficulty {
  keyword: string;
  difficulty: number;
}

// ─── Checks ──────────────────────────────────────────────────────────────────

export function isDataForSeoConfigured(): boolean {
  return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}

// ─── Keywords Data API ───────────────────────────────────────────────────────

/**
 * Returns real search volume + CPC for up to 1,000 keywords (Google Ads data).
 */
export async function getKeywordMetrics(
  keywords: string[],
  locationCode = DEFAULT_LOCATION,
  languageCode = DEFAULT_LANGUAGE,
): Promise<KeywordMetrics[]> {
  if (!keywords.length) return [];

  const json: any = await post("/keywords_data/google_ads/search_volume/live", [
    { keywords, location_code: locationCode, language_code: languageCode },
  ]);

  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? [];
  return items.map((item) => ({
    keyword: item.keyword,
    search_volume: item.search_volume ?? 0,
    competition_level: item.competition ?? "LOW",
    competition_index: item.competition_index ?? 0,
    cpc: item.cpc ?? 0,
  }));
}

// ─── DataForSEO Labs API ─────────────────────────────────────────────────────

/**
 * Returns keyword difficulty (0–100) for up to 1,000 keywords.
 * 0 = easy, 100 = very hard.
 */
export async function getBulkKeywordDifficulty(
  keywords: string[],
  locationCode = DEFAULT_LOCATION,
  languageCode = DEFAULT_LANGUAGE,
): Promise<KeywordDifficulty[]> {
  if (!keywords.length) return [];

  const json: any = await post("/dataforseo_labs/google/bulk_keyword_difficulty/live", [
    { keywords, location_code: locationCode, language_code: languageCode },
  ]);

  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? [];
  return items.map((item) => ({
    keyword: item.keyword,
    difficulty: item.keyword_difficulty ?? 0,
  }));
}
