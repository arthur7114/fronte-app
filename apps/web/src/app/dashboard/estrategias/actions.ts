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

function normalizePostTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
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

function parseKeywordLines(input: string, limit = 50) {
  const seen = new Set<string>()
  const keywords: string[] = []

  for (const line of input.split(/\r?\n/)) {
    const keyword = line.replace(/\s+/g, " ").trim()
    const key = keyword.toLowerCase()

    if (!keyword || seen.has(key)) {
      continue
    }

    seen.add(key)
    keywords.push(keyword)

    if (keywords.length >= limit) {
      break
    }
  }

  return keywords
}

type ManualTopicInput = {
  title: string
  primaryKeyword: string
  keywordId?: string | null
  funnelStage: "awareness" | "consideration" | "decision"
  priority: "high" | "medium" | "low"
  note?: string
}

const TOPIC_PRIORITY_SCORE: Record<ManualTopicInput["priority"], number> = {
  high: 90,
  medium: 60,
  low: 30,
}

export async function addManualKeywords(strategyId: string, rawKeywords: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()
  const keywords = parseKeywordLines(rawKeywords)

  if (keywords.length === 0) {
    return { error: "Informe ao menos uma palavra-chave." }
  }

  const { data: existing, error: existingError } = await (db as any)
    .from("keyword_candidates")
    .select("keyword")
    .eq("tenant_id", tenant.id)
    .eq("strategy_id", strategyId)

  if (existingError) return { error: existingError.message }

  const existingSet = new Set((existing ?? []).map((item: any) => item.keyword.toLowerCase()))
  const rows = keywords
    .filter((keyword) => !existingSet.has(keyword.toLowerCase()))
    .map((keyword) => ({
      tenant_id: tenant.id,
      strategy_id: strategyId,
      keyword,
      status: "suggested",
      source: "manual",
    }))

  if (rows.length === 0) {
    return { success: "Todas as palavras-chave informadas ja existiam.", inserted: 0 }
  }

  const { error } = await (db as any).from("keyword_candidates").insert(rows)
  if (error) return { error: error.message }

  revalidateStrategies()
  return { success: `${rows.length} palavra(s)-chave adicionada(s) como sugestao.`, inserted: rows.length }
}

export async function addManualTopic(strategyId: string, input: ManualTopicInput) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()
  const title = input.title.trim().replace(/\s+/g, " ")
  const primaryKeyword = input.primaryKeyword.trim().replace(/\s+/g, " ")
  const note = input.note?.trim().replace(/\s+/g, " ") || null

  if (!title) return { error: "Informe o titulo do topico." }
  if (!primaryKeyword) return { error: "Informe a palavra-chave principal." }

  const row: TablesInsert<"topic_candidates"> = {
    tenant_id: tenant.id,
    strategy_id: strategyId,
    topic: title,
    source: primaryKeyword,
    keyword_id: input.keywordId || null,
    journey_stage: input.funnelStage,
    score: TOPIC_PRIORITY_SCORE[input.priority],
    justification: note,
    status: "suggested",
  }

  const { error } = await (db as any).from("topic_candidates").insert(row)
  if (error) return { error: error.message }

  revalidateStrategies()
  return { success: "Topico adicionado como sugestao." }
}

export async function massApproveTopics(topicIds: string[]) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { data: topics, error: fetchErr } = await (db as any)
    .from("topic_candidates")
    .select("id")
    .in("id", topicIds)
    .eq("tenant_id", tenant.id)

  if (fetchErr || !topics || topics.length === 0) {
    return { error: "Nenhum topico encontrado para aprovar." }
  }

  const { error: updateErr } = await (db as any)
    .from("topic_candidates")
    .update({ status: "approved" })
    .in("id", topics.map((t: any) => t.id))
    .eq("tenant_id", tenant.id)

  if (updateErr) return { error: `Falha ao aprovar topicos: ${updateErr.message}` }

  revalidateStrategies()

  return { success: `${topics.length} topico(s) aprovado(s) com sucesso.` }
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

export async function massDeleteTopics(topicIds: string[]) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { error } = await (db as any)
    .from("topic_candidates")
    .delete()
    .in("id", topicIds)
    .eq("tenant_id", tenant.id)

  if (error) return { error: `Falha ao excluir topicos: ${error.message}` }
  revalidateStrategies()
  return { success: `${topicIds.length} topico(s) excluido(s) com sucesso.` }
}

export async function sendTopicsToProduction(topicIds: string[]) {
  const { tenant, site } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  if (!site) return { error: "Nenhum site configurado." }
  const db = await getDb()
  const uniqueIds = [...new Set(topicIds.filter(Boolean))]

  if (uniqueIds.length === 0) {
    return { error: "Selecione ao menos um topico aprovado." }
  }

  const { data: topics, error } = await (db as any)
    .from("topic_candidates")
    .select("*")
    .in("id", uniqueIds)
    .eq("tenant_id", tenant.id)

  if (error) return { error: `Falha ao buscar topicos: ${error.message}` }

  const foundTopics = topics ?? []
  const [postsResult, briefsResult, jobsResult] = await Promise.all([
    (db as any)
      .from("posts")
      .select("id, title, status, strategy_id")
      .eq("tenant_id", tenant.id)
      .eq("site_id", site.id),
    (db as any)
      .from("content_briefs")
      .select("id, topic, status, strategy_id")
      .eq("tenant_id", tenant.id),
    (db as any)
      .from("automation_jobs")
      .select("id, type, status, payload_json")
      .eq("tenant_id", tenant.id)
      .in("type", ["generate_brief", "generate_post"])
      .in("status", ["pending", "running"]),
  ])

  if (postsResult.error) return { error: `Falha ao verificar posts existentes: ${postsResult.error.message}` }
  if (briefsResult.error) return { error: `Falha ao verificar briefings existentes: ${briefsResult.error.message}` }
  if (jobsResult.error) return { error: `Falha ao verificar fila ativa: ${jobsResult.error.message}` }

  const existingPosts = postsResult.data ?? []
  const existingBriefs = briefsResult.data ?? []
  const activeJobs = jobsResult.data ?? []
  const activeTopicJobs = new Set(
    activeJobs
      .map((job: any) => job.payload_json?.topic_candidate_id)
      .filter((id: unknown): id is string => typeof id === "string"),
  )
  const activeBriefJobs = new Set(
    activeJobs
      .map((job: any) => job.payload_json?.content_brief_id)
      .filter((id: unknown): id is string => typeof id === "string"),
  )

  const queued: Array<{ topicId: string; jobId: string }> = []
  const skipped: Array<{ topicId: string; reason: string }> = []
  const failed: Array<{ topicId: string; reason: string }> = []

  for (const topicId of uniqueIds) {
    const topic = foundTopics.find((item: any) => item.id === topicId)

    if (!topic) {
      failed.push({ topicId, reason: "Topico nao encontrado." })
      continue
    }

    if (topic.status !== "approved") {
      failed.push({ topicId, reason: "Topico precisa estar aprovado antes da producao." })
      continue
    }

    const normalizedTopic = normalizePostTitle(topic.topic)
    const sameStrategy = (item: any) => (item.strategy_id ?? null) === (topic.strategy_id ?? null)
    const existingPost = existingPosts.find(
      (post: any) =>
        post.status !== "failed" &&
        sameStrategy(post) &&
        normalizePostTitle(post.title) === normalizedTopic,
    )

    if (existingPost) {
      skipped.push({ topicId, reason: "Ja existe um artigo para este topico." })
      continue
    }

    if (activeTopicJobs.has(topicId)) {
      skipped.push({ topicId, reason: "Este topico ja esta na fila." })
      continue
    }

    const existingBrief = existingBriefs.find(
      (brief: any) =>
        brief.status !== "failed" &&
        sameStrategy(brief) &&
        normalizePostTitle(brief.topic) === normalizedTopic,
    )

    if (existingBrief && activeBriefJobs.has(existingBrief.id)) {
      skipped.push({ topicId, reason: "Este topico ja esta gerando rascunho." })
      continue
    }

    const insertResult = await (db as any)
      .from("automation_jobs")
      .insert({
        tenant_id: tenant.id,
        site_id: site.id,
        type: existingBrief ? "generate_post" : "generate_brief",
        status: "pending",
        max_attempts: 3,
        priority: 20,
        payload_json: {
          tenant_id: tenant.id,
          site_id: site.id,
          ...(existingBrief ? { content_brief_id: existingBrief.id } : { topic_candidate_id: topicId }),
          strategy_id: topic.strategy_id ?? null,
        },
      })
      .select("id")
      .single()

    if (insertResult.error || !insertResult.data) {
      failed.push({
        topicId,
        reason: insertResult.error?.message ?? "Falha ao enfileirar artigo.",
      })
      continue
    }

    queued.push({ topicId, jobId: insertResult.data.id })
  }

  revalidateStrategies()
  revalidatePath("/app/artigos")
  revalidatePath("/app/calendario")
  revalidatePath("/dashboard/artigos")
  revalidatePath("/dashboard/calendario")

  return {
    success:
      queued.length > 0
        ? `${queued.length} artigo(s) enviado(s) para producao.`
        : "Nenhum novo artigo foi enviado para producao.",
    summary: {
      enfileirados: queued.length,
      ignorados: skipped.length,
      falhas: failed.length,
    },
    details: { queued, skipped, failed },
  }
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

type TopicResearchScope = "all_approved" | "selected_keywords" | "without_approved_topics"

export async function triggerTopicResearch(
  strategyId: string,
  options: {
    topicCount?: number
    keywordIds?: string[]
    scope?: TopicResearchScope
  } = {},
) {
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
      topic_count: options.topicCount,
      keyword_ids: options.keywordIds,
      scope: options.scope,
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
