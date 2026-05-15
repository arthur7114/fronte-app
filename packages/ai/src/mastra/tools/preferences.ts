import { supabaseDb } from "./supabase";

const FALLBACK_MODEL = process.env.MASTRA_DEFAULT_MODEL ?? "gpt-4o-mini";

/**
 * Resolve the OpenAI model id for a tenant. Reads from `ai_preferences.model`
 * (the column the admin panel writes via /app/configuracoes → saveAiSettings).
 * Falls back to MASTRA_DEFAULT_MODEL env var, then to gpt-4o-mini.
 *
 * Wrapped in try/catch so a missing row or DB hiccup never breaks the workflow.
 */
export async function getModelForTenant(tenantId: string | undefined): Promise<string> {
  if (!tenantId) return FALLBACK_MODEL;
  try {
    const prefs = await supabaseDb.getAiPreferences(tenantId);
    const model = prefs?.model?.trim();
    return model || FALLBACK_MODEL;
  } catch {
    return FALLBACK_MODEL;
  }
}
