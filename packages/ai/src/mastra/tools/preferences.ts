import { supabaseDb } from "./supabase";

const FALLBACK_MODEL = process.env.MASTRA_DEFAULT_MODEL ?? "gpt-4o-mini";
const FALLBACK_TONE = "profissional e acessível";
const FALLBACK_THRESHOLD = 70;

export type ResolvedAgentConfig = {
  model: string;
  tone: string;
  audience: string | null;
  qualityThreshold: number;
};

/**
 * Resolve agent configuration for a given (tenant, strategy) pair.
 *
 * Cascade (first non-empty wins):
 *   1. strategies.<override_field> (per-strategy override)
 *   2. ai_preferences.<field> (per-tenant default)
 *   3. environment variable (system default)
 *   4. hardcoded fallback
 *
 * Returns sensible defaults if anything fails — never throws.
 */
export async function resolveAgentConfig(
  tenantId: string | undefined,
  strategyId?: string,
): Promise<ResolvedAgentConfig> {
  if (!tenantId) {
    return { model: FALLBACK_MODEL, tone: FALLBACK_TONE, audience: null, qualityThreshold: FALLBACK_THRESHOLD };
  }

  try {
    const [prefs, strategy] = await Promise.all([
      supabaseDb.getAiPreferences(tenantId),
      strategyId ? supabaseDb.getStrategy(strategyId, tenantId) : Promise.resolve(null),
    ]);

    const strat = strategy as {
      ai_model_override?: string | null;
      tone_override?: string | null;
      audience_override?: string | null;
      audience?: string | null;
      tone?: string | null;
      quality_threshold?: number | null;
    } | null;

    const aiPrefs = prefs as { model?: string | null; tone_of_voice?: string | null } | null;

    return {
      model: strat?.ai_model_override?.trim() || aiPrefs?.model?.trim() || FALLBACK_MODEL,
      tone:
        strat?.tone_override?.trim() ||
        strat?.tone?.trim() ||
        aiPrefs?.tone_of_voice?.trim() ||
        FALLBACK_TONE,
      audience: strat?.audience_override?.trim() || strat?.audience?.trim() || null,
      qualityThreshold:
        typeof strat?.quality_threshold === "number" ? strat.quality_threshold : FALLBACK_THRESHOLD,
    };
  } catch {
    return { model: FALLBACK_MODEL, tone: FALLBACK_TONE, audience: null, qualityThreshold: FALLBACK_THRESHOLD };
  }
}

/**
 * Backward-compatible helper for places that only need the model id.
 * Reads tenantId from request context; strategyId optional.
 */
export async function getModelForTenant(tenantId: string | undefined, strategyId?: string): Promise<string> {
  const config = await resolveAgentConfig(tenantId, strategyId);
  return config.model;
}
