import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const KeywordMetricSchema = z.object({
  keyword: z.string(),
  search_volume: z.number(),
  volume_tier: z.enum(["alto", "médio", "baixo"]),
  keyword_difficulty: z.number(),
  difficulty_tier: z.enum(["fácil", "médio", "difícil"]),
  cpc: z.number(),
  competition_level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  search_intent: z.string(),
});

export type KeywordMetric = z.infer<typeof KeywordMetricSchema>;

function classifyVolume(volume: number): "alto" | "médio" | "baixo" {
  if (volume >= 5000) return "alto";
  if (volume >= 500) return "médio";
  return "baixo";
}

function classifyDifficulty(diff: number): "fácil" | "médio" | "difícil" {
  if (diff <= 33) return "fácil";
  if (diff <= 66) return "médio";
  return "difícil";
}

/**
 * Stub tool for DataForSEO. The web app already has a richer wrapper at
 * apps/web/src/lib/dataforseo.ts; this tool calls the public endpoint directly
 * so the workflow runs from any context (worker, web, scheduler).
 */
export const keywordMetricsTool = createTool({
  id: "keyword-metrics",
  description: "Fetch search volume / difficulty / CPC for a keyword from DataForSEO.",
  inputSchema: z.object({
    keyword: z.string().min(2),
    locationCode: z.number().default(2076),
    languageCode: z.string().default("pt"),
  }),
  outputSchema: z.object({
    primary: KeywordMetricSchema.nullable(),
    suggestions: z.array(KeywordMetricSchema),
  }),
  execute: async ({ context }) => {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    if (!login || !password) {
      return { primary: null, suggestions: [] };
    }

    const auth = Buffer.from(`${login}:${password}`).toString("base64");
    const body = JSON.stringify([
      {
        keywords: [context.keyword],
        location_code: context.locationCode,
        language_code: context.languageCode,
      },
    ]);

    const response = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body,
      },
    );

    if (!response.ok) {
      return { primary: null, suggestions: [] };
    }

    const payload = (await response.json()) as {
      tasks?: Array<{ result?: Array<{ keyword?: string; search_volume?: number; cpc?: number; competition?: string }> }>;
    };
    const items = payload.tasks?.[0]?.result ?? [];

    const primary = items[0]
      ? {
          keyword: String(items[0].keyword ?? context.keyword),
          search_volume: items[0].search_volume ?? 0,
          volume_tier: classifyVolume(items[0].search_volume ?? 0),
          keyword_difficulty: 0,
          difficulty_tier: classifyDifficulty(0),
          cpc: items[0].cpc ?? 0,
          competition_level: (items[0].competition?.toUpperCase() as "LOW" | "MEDIUM" | "HIGH") ?? "MEDIUM",
          search_intent: "informational",
        }
      : null;

    return { primary, suggestions: [] };
  },
});
