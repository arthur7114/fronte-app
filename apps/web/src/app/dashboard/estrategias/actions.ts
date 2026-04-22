"use server"

import { revalidatePath } from "next/cache"
import type { TablesInsert } from "@super/db"
import { APP_DEFAULTS } from "@super/shared"
import { getAuthContext } from "@/lib/auth-context"
import {
  getStrategyForTenant,
  getAutomationConfigForTenant,
  getContentBriefForTenant,
  getTopicCandidateForTenant,
  listKeywordCandidatesForTenant,
} from "@/lib/automation-data"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"

function getDb() {
  return getOptionalAdminSupabaseClient() ?? getServerSupabaseClient()
}

function revalidateStrategies() {
  revalidatePath("/app/estrategias")
  revalidatePath("/app/dashboard")
  revalidatePath("/dashboard/estrategias")
  revalidatePath("/dashboard")
}

const STRATEGY_TYPES = new Set(["seo", "local", "blog", "conversao"])
const OPERATION_MODES = new Set(["manual", "assisted", "automatic"])
const CADENCES = new Set([4, 8, 12, 20])
const STATUSES = new Set(["configuring", "active", "paused", "archived"])

function asOptionalText(value: unknown) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function sanitizeStrategyPayload(data: any) {
  const payload: Record<string, unknown> = {}

  const name = asOptionalText(data.name)
  if (name) payload.name = name

  const description = asOptionalText(data.description)
  if (description !== undefined) payload.description = description

  const goal = asOptionalText(data.goal)
  if (goal !== undefined) {
    payload.goal = goal
    payload.focus = goal
  }

  const audience = asOptionalText(data.audience)
  if (audience !== undefined) payload.audience = audience

  const tone = asOptionalText(data.tone)
  if (tone !== undefined) payload.tone = tone

  if (STRATEGY_TYPES.has(data.type)) payload.strategy_type = data.type
  if (STRATEGY_TYPES.has(data.strategy_type)) payload.strategy_type = data.strategy_type
  if (OPERATION_MODES.has(data.operation_mode)) payload.operation_mode = data.operation_mode
  if (STATUSES.has(data.status)) payload.status = data.status
  if (CADENCES.has(Number(data.cadence))) payload.cadence = Number(data.cadence)

  const color = asOptionalText(data.color)
  if (color !== undefined) payload.color = color

  return payload
}

// === Mass Actions ===

export async function massApproveKeywords(keywordIds: string[]) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { error } = await (db as any)
    .from("keyword_candidates")
    .update({ status: "approved" })
    .in("id", keywordIds)
    .eq("tenant_id", tenant.id)

  if (error) return { error: `Falha ao aprovar: ${error.message}` }
  revalidateStrategies()
  return { success: `${keywordIds.length} palavra(s)-chave aprovada(s) com sucesso.` }
}

export async function massRejectKeywords(keywordIds: string[]) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { error } = await (db as any)
    .from("keyword_candidates")
    .update({ status: "rejected" })
    .in("id", keywordIds)
    .eq("tenant_id", tenant.id)

  if (error) return { error: `Falha ao rejeitar: ${error.message}` }
  revalidateStrategies()
  return { success: `${keywordIds.length} palavra(s)-chave rejeitada(s) com sucesso.` }
}

export async function massDeleteKeywords(keywordIds: string[]) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { error } = await (db as any)
    .from("keyword_candidates")
    .delete()
    .in("id", keywordIds)
    .eq("tenant_id", tenant.id)

  if (error) return { error: `Falha ao excluir: ${error.message}` }
  revalidateStrategies()
  return { success: `${keywordIds.length} palavra(s)-chave excluida(s).` }
}

export async function massApproveTopics(topicIds: string[]) {
  const { tenant, site } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  if (!site) return { error: "Nenhum site configurado." }
  const db = await getDb()
  const now = new Date().toISOString()

  // 1. Fetch the topics
  const { data: topics, error: fetchErr } = await (db as any)
    .from("topic_candidates")
    .select("*")
    .in("id", topicIds)
    .eq("tenant_id", tenant.id)
    .neq("status", "approved") // only non-approved

  if (fetchErr || !topics || topics.length === 0) {
    return { error: "Nenhum topico pendente/rejeitado encontrado para aprovar." }
  }

  // 2. Mark topics as approved
  const { error: updateErr } = await (db as any)
    .from("topic_candidates")
    .update({ status: "approved" })
    .in("id", topics.map((t: any) => t.id))
    .eq("tenant_id", tenant.id)

  if (updateErr) return { error: `Falha ao aprovar topicos: ${updateErr.message}` }

  // 3. Create draft posts
  const postsToInsert = topics.map((topic: any) => {
    const slug = topic.topic
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80)

    return {
      tenant_id: tenant.id,
      site_id: site.id,
      title: topic.topic,
      slug,
      content: topic.justification || "",
      status: "draft",
      strategy_id: topic.strategy_id || null,
      scheduled_for: topic.scheduled_date || null,
      created_at: now,
      updated_at: now,
    }
  })

  if (postsToInsert.length > 0) {
    const { error: insertErr } = await (db as any).from("posts").insert(postsToInsert)
    if (insertErr) return { error: `Topicos aprovados, mas erro ao criar rascunhos: ${insertErr.message}` }
  }

  revalidateStrategies()
  revalidatePath("/app/artigos")
  revalidatePath("/app/calendario")
  revalidatePath("/dashboard/artigos")
  revalidatePath("/dashboard/calendario")

  return { success: `${topics.length} topico(s) aprovado(s) e rascunhos criados!` }
}

export async function massRejectTopics(topicIds: string[]) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { error } = await (db as any)
    .from("topic_candidates")
    .update({ status: "rejected" })
    .in("id", topicIds)
    .eq("tenant_id", tenant.id)

  if (error) return { error: `Falha ao rejeitar topicos: ${error.message}` }
  revalidateStrategies()
  return { success: `${topicIds.length} topico(s) rejeitado(s) com sucesso.` }
}

export async function triggerKeywordStrategy(strategyId: string, keywordCount: number = 10) {
  const { tenant, site } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  if (!site) return { error: "Nenhum site configurado." }
  const db = await getDb()

  const { error } = await (db as any).from("automation_jobs").insert({
    tenant_id: tenant.id,
    site_id: site.id,
    type: "generate_keyword_strategy",
    status: "pending",
    max_attempts: 3,
    priority: 5,
    payload_json: {
      tenant_id: tenant.id,
      site_id: site.id,
      strategy_id: strategyId,
      keyword_count: keywordCount,
    },
  })
  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: `Job de ${keywordCount} palavras-chave agendado com sucesso.` }
}

export async function approveTopicCandidate(topicId: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { error } = await (db as any)
    .from("topic_candidates")
    .update({ status: "approved" })
    .eq("id", topicId)
    .eq("tenant_id", tenant.id)

  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: "Topico aprovado com sucesso." }
}

export async function triggerTopicResearch(strategyId: string) {
  const { tenant, site } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  if (!site) return { error: "Nenhum site configurado." }
  const db = await getDb()

  const { error } = await (db as any).from("automation_jobs").insert({
    tenant_id: tenant.id,
    site_id: site.id,
    type: "research_topics",
    status: "pending",
    max_attempts: 3,
    priority: 10,
    payload_json: {
      tenant_id: tenant.id,
      site_id: site.id,
      strategy_id: strategyId,
    },
  })
  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: "Job de topicos agendado com sucesso." }
}

export async function triggerBriefAndPostGeneration(topicId: string) {
  const { tenant, site } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  if (!site) return { error: "Nenhum site configurado." }
  const db = await getDb()

  const { data } = await (db as any).from("topic_candidates").select("strategy_id").eq("id", topicId).single()

  const { error } = await (db as any).from("automation_jobs").insert({
    tenant_id: tenant.id,
    site_id: site.id,
    type: "generate_brief",
    status: "pending",
    max_attempts: 3,
    priority: 20,
    payload_json: {
      tenant_id: tenant.id,
      site_id: site.id,
      topic_candidate_id: topicId,
      strategy_id: data?.strategy_id || null,
    },
  })
  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: "Job de artigo agendado com sucesso." }
}

export async function getActiveStrategyJobs(strategyId: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { data, error, count } = await (db as any)
    .from("automation_jobs")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenant.id)
    .filter("payload_json->>strategy_id", "eq", strategyId)
    .in("status", ["pending", "running"])
    .order("created_at", { ascending: false })

  if (error) return { error: error.message, count: 0 }
  return { count: count ?? data?.length ?? 0 }
}

export async function createStrategy(data: any) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()
  const payload = sanitizeStrategyPayload(data)

  if (!payload.name) {
    return { error: "Nome da estrategia e obrigatorio." }
  }

  const { data: strat, error } = await (db as any)
    .from("strategies")
    .insert({ tenant_id: tenant.id, ...payload })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: "Estrategia criada.", data: strat }
}

export async function duplicateStrategy(id: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Não autenticado.")
  const db = await getDb()

  const { data: strat } = await (db as any).from("strategies").select("*").eq("id", id).single()
  if (!strat) return { error: "Estratégia não encontrada." }

  delete strat.id
  strat.name = strat.name + " (Cópia)"

  const { data: newStrat, error } = await (db as any).from("strategies").insert(strat).select().single()
  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: "Estratégia duplicada.", strategyId: newStrat?.id }
}
}

export async function archiveStrategy(id: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { error } = await (db as any).from("strategies").update({ status: "archived" }).eq("id", id).eq("tenant_id", tenant.id)
  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: "Estrategia arquivada." }
}

export async function updateStrategy(id: string, data: any) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()
  const payload = sanitizeStrategyPayload(data)

  const { error } = await (db as any).from("strategies").update(payload).eq("id", id).eq("tenant_id", tenant.id)
  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: "Estrategia atualizada." }
}
