"use server"

import { revalidatePath } from "next/cache"
import { getAuthContext } from "@/lib/auth-context"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"

async function getDb() {
  return getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient())
}

export type OnboardingAnswers = {
  segment?: string
  services?: string
  location?: string
  audience?: string
  differentiator?: string
  goal?: string
}

/**
 * Persiste as respostas do briefing de onboarding no banco de dados.
 * Insere ou atualiza `business_briefings` e `ai_preferences` para o tenant autenticado.
 */
export async function saveBriefingAnswers(answers: OnboardingAnswers) {
  const { tenant, site } = await getAuthContext()
  if (!tenant) return { error: "Não autenticado." }

  const db = await getDb()
  const now = new Date().toISOString()

  // --- 1. Upsert business_briefings ---
  const briefingPayload = {
    tenant_id: tenant.id,
    site_id: site?.id ?? null,
    business_name: tenant.name,
    segment: answers.segment || "Não informado",
    offerings: answers.services || "Não informado",
    customer_profile: answers.audience || "Não informado",
    location: answers.location || null,
    notes: answers.differentiator || null,
    status: "completed",
    updated_at: now,
  }

  // Try update first, if no rows affected, insert
  const { data: existing } = await (db as any)
    .from("business_briefings")
    .select("id")
    .eq("tenant_id", tenant.id)
    .maybeSingle()

  if (existing) {
    const { error } = await (db as any)
      .from("business_briefings")
      .update(briefingPayload)
      .eq("tenant_id", tenant.id)
    if (error) return { error: `Erro ao atualizar briefing: ${error.message}` }
  } else {
    const { error } = await (db as any)
      .from("business_briefings")
      .insert(briefingPayload)
    if (error) return { error: `Erro ao salvar briefing: ${error.message}` }
  }

  // --- 2. Upsert ai_preferences ---
  // Inferir tom de voz a partir do objetivo
  let toneOfVoice = "Profissional e educativo"
  if (answers.goal?.toLowerCase().includes("autoridade")) {
    toneOfVoice = "Autoritativo e didático"
  } else if (answers.goal?.toLowerCase().includes("leads") || answers.goal?.toLowerCase().includes("contatos")) {
    toneOfVoice = "Persuasivo e acolhedor"
  } else if (answers.goal?.toLowerCase().includes("vender")) {
    toneOfVoice = "Direto e orientado a conversão"
  }

  const prefsPayload = {
    tenant_id: tenant.id,
    tone_of_voice: toneOfVoice,
    writing_style: "Claro e acessível",
    expertise_level: "professional",
    updated_at: now,
  }

  const { data: existingPrefs } = await (db as any)
    .from("ai_preferences")
    .select("id")
    .eq("tenant_id", tenant.id)
    .maybeSingle()

  if (existingPrefs) {
    const { error } = await (db as any)
      .from("ai_preferences")
      .update(prefsPayload)
      .eq("tenant_id", tenant.id)
    if (error) return { error: `Erro ao atualizar preferências: ${error.message}` }
  } else {
    const { error } = await (db as any)
      .from("ai_preferences")
      .insert(prefsPayload)
    if (error) return { error: `Erro ao salvar preferências: ${error.message}` }
  }

  revalidatePath("/app/dashboard")
  revalidatePath("/dashboard")
  revalidatePath("/onboarding")

  return { success: true }
}
