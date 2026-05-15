"use server"

import { revalidatePath } from "next/cache"
import { getAuthContext } from "@/lib/auth-context"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"

type OperationMode = "manual" | "assisted" | "automatic"

type StrategyAiConfigPatch = {
  operation_mode: OperationMode
  quality_threshold: number
  ai_model_override: string | null
  tone_override: string | null
  audience_override: string | null
}

export async function saveStrategyAiConfig(
  strategyId: string,
  patch: StrategyAiConfigPatch,
): Promise<{ success: true } | { error: string }> {
  const { tenant } = await getAuthContext()
  if (!tenant) return { error: "Não autenticado." }

  if (!["manual", "assisted", "automatic"].includes(patch.operation_mode)) {
    return { error: "Modo de operação inválido." }
  }

  if (patch.quality_threshold < 0 || patch.quality_threshold > 100) {
    return { error: "Threshold de qualidade deve estar entre 0 e 100." }
  }

  const db = (getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient())) as any

  const { error } = await db
    .from("strategies")
    .update({
      operation_mode: patch.operation_mode,
      quality_threshold: patch.quality_threshold,
      ai_model_override: patch.ai_model_override,
      tone_override: patch.tone_override,
      audience_override: patch.audience_override,
      updated_at: new Date().toISOString(),
    })
    .eq("id", strategyId)
    .eq("tenant_id", tenant.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/estrategias/${strategyId}`)
  return { success: true }
}
