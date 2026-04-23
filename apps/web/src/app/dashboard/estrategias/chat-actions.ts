/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { revalidatePath } from "next/cache"
import { getAuthContext } from "@/lib/auth-context"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"

function getDb() {
  return getOptionalAdminSupabaseClient() ?? getServerSupabaseClient()
}

type OperationMode = "manual" | "assisted" | "automatic"

type AssistantToolName =
  | "strategy_get_context"
  | "strategy_update"
  | "strategy_queue_job"
  | "strategy_set_keyword_status"
  | "strategy_set_topic_status"
  | "strategy_set_brief_status"
  | "strategy_create_draft_posts"
  | "strategy_update_post"

const MUTATING_TOOLS = new Set<AssistantToolName>([
  "strategy_update",
  "strategy_queue_job",
  "strategy_set_keyword_status",
  "strategy_set_topic_status",
  "strategy_set_brief_status",
  "strategy_create_draft_posts",
  "strategy_update_post",
])

const PUBLISHING_JOB_TYPES = new Set(["publish_post"])
const PUBLISHING_POST_STATUSES = new Set(["scheduled", "publishing", "published"])

const ASSISTANT_TOOLS = [
  {
    type: "function",
    function: {
      name: "strategy_get_context",
      description: "Le o estado operacional da estrategia: modo do workspace, keywords, topicos, briefs, posts e jobs recentes.",
      parameters: {
        type: "object",
        properties: {
          recent_limit: { type: "number", minimum: 1, maximum: 25 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "strategy_update",
      description: "Atualiza campos editoriais da estrategia atual.",
      parameters: {
        type: "object",
        properties: {
          patch: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              goal: { type: "string" },
              focus: { type: "string" },
              audience: { type: "string" },
              tone: { type: "string" },
              strategy_type: { type: "string", enum: ["seo", "local", "blog", "conversao"] },
              status: { type: "string", enum: ["configuring", "active", "paused", "archived"] },
              cadence: { type: "number", enum: [4, 8, 12, 20] },
              color: { type: "string" },
            },
            additionalProperties: false,
          },
        },
        required: ["patch"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "strategy_queue_job",
      description: "Enfileira workflows existentes do worker para pesquisar keywords, gerar topicos, briefs, posts ou publicar.",
      parameters: {
        type: "object",
        properties: {
          job_type: {
            type: "string",
            enum: ["generate_keyword_strategy", "research_topics", "generate_brief", "generate_post", "publish_post"],
          },
          keyword_count: { type: "number", minimum: 1, maximum: 50 },
          topic_candidate_id: { type: "string" },
          content_brief_id: { type: "string" },
          post_id: { type: "string" },
          scheduled_for: { type: "string", description: "ISO datetime para publicacao agendada." },
        },
        required: ["job_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "strategy_set_keyword_status",
      description: "Aprova, rejeita ou volta uma keyword da estrategia para pendente.",
      parameters: {
        type: "object",
        properties: {
          keyword_id: { type: "string" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
        },
        required: ["keyword_id", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "strategy_set_topic_status",
      description: "Aprova ou rejeita um topico da estrategia. Ao aprovar, pode enfileirar o brief.",
      parameters: {
        type: "object",
        properties: {
          topic_id: { type: "string" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          queue_brief_job: { type: "boolean" },
        },
        required: ["topic_id", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "strategy_set_brief_status",
      description: "Aprova um brief da estrategia. Ao aprovar, pode enfileirar o post.",
      parameters: {
        type: "object",
        properties: {
          brief_id: { type: "string" },
          status: { type: "string", enum: ["pending", "approved"] },
          queue_post_job: { type: "boolean" },
        },
        required: ["brief_id", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "strategy_update_post",
      description: "Atualiza status, titulo, slug ou conteudo de um post da estrategia. Tambem agenda quando status=scheduled.",
      parameters: {
        type: "object",
        properties: {
          post_id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          status: { type: "string", enum: ["draft", "in_review", "approved", "scheduled", "published", "rejected"] },
          published_at: { type: "string", description: "ISO datetime para agendamento/publicacao." },
        },
        required: ["post_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "strategy_create_draft_posts",
      description:
        "Cria rascunhos reais de artigos na tabela posts para a estrategia atual. Use quando o usuario pedir para criar, produzir, escrever ou gerar posts/artigos/conteudos.",
      parameters: {
        type: "object",
        properties: {
          posts: {
            type: "array",
            minItems: 1,
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                slug: { type: "string" },
                content: { type: "string", description: "Conteudo completo do artigo em Markdown, sem placeholder." },
                status: { type: "string", enum: ["draft", "in_review"] },
              },
              required: ["title", "content"],
              additionalProperties: false,
            },
          },
          note: {
            type: "string",
            description: "Resumo curto da regra usada para escolher os artigos.",
          },
        },
        required: ["posts"],
      },
    },
  },
] as const

function parseOperationMode(value: unknown): OperationMode {
  return value === "manual" || value === "assisted" || value === "automatic" ? value : "assisted"
}

function normalizeToolArgs(raw: string | undefined) {
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function slugifyTitle(value: string) {
  return normalizeSearchText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function isPostCreationRequest(message: string) {
  const text = normalizeSearchText(message)
  const hasCreationVerb = /\b(crie|criar|gere|gerar|produza|produzir|escreva|escrever|prepare|preparar)\b/.test(text)
  const hasPostNoun = /\b(post|posts|artigo|artigos|conteudo|conteudos|texto|textos)\b/.test(text)
  return hasCreationVerb && hasPostNoun
}

function needsContextTool(message: string) {
  const text = normalizeSearchText(message)
  const hasStateQuestion = /\b(tem|tenho|ha|existe|existem|quantos|status|andamento|sendo criad|agendad|publicad)\b/.test(text)
  const hasOperationalNoun = /\b(post|posts|artigo|artigos|calendario|agenda|job|jobs|keyword|keywords|palavra|palavras|topico|topicos|brief|briefs)\b/.test(text)
  return hasStateQuestion && hasOperationalNoun
}

function getToolChoiceForMessage(message: string) {
  if (isPostCreationRequest(message)) {
    return { type: "function", function: { name: "strategy_create_draft_posts" } }
  }

  if (needsContextTool(message)) {
    return { type: "function", function: { name: "strategy_get_context" } }
  }

  return "auto"
}

function summarizeList<T>(items: T[], getLabel: (item: T) => unknown, fallback = "nenhum") {
  const labels = items
    .map(getLabel)
    .filter((label): label is string => typeof label === "string" && label.trim().length > 0)
    .map((label) => label.trim())
    .slice(0, 8)

  return labels.length ? labels.join("; ") : fallback
}

function revalidateStrategyWorkspace() {
  revalidatePath("/app/artigos")
  revalidatePath("/app/calendario")
  revalidatePath("/app/estrategias")
  revalidatePath("/dashboard/artigos")
  revalidatePath("/dashboard/calendario")
  revalidatePath("/dashboard/estrategias")
}

function operationPolicy(mode: OperationMode) {
  if (mode === "manual") {
    return "Modo manual: use tools de leitura, explique o plano e oriente o usuario a executar botoes/acoes. Nao execute alteracoes por chat."
  }
  if (mode === "assisted") {
    return "Modo assistido: pode executar pesquisa, geracao e aprovacao quando o usuario pedir. Nao publicar nem agendar posts de fato; peca aprovacao/acao manual para isso."
  }
  return "Modo automatico: pode executar o fluxo dentro das regras da estrategia e parar quando houver risco, ambiguidade ou excecao."
}

function fallbackChatTitle(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim()
  if (!normalized) return "Nova conversa"
  return normalized.length > 48 ? `${normalized.slice(0, 45).trim()}...` : normalized
}

function normalizeChatTitle(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback

  const title = value
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()

  if (title.length < 3) return fallback
  return title.length > 48 ? title.slice(0, 48).trim() : title
}

async function generateChatTitle(input: {
  apiKey: string
  strategyName: string
  strategyGoal?: string | null
  userMessage: string
  assistantResponse?: string | null
}) {
  const fallback = fallbackChatTitle(input.userMessage)

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Gere um titulo curto para uma conversa de chat. Retorne apenas JSON valido com a chave title. O titulo deve ter 3 a 6 palavras, sem aspas, sem ponto final, em Portugues do Brasil, descrevendo a intencao da conversa.",
          },
          {
            role: "user",
            content: JSON.stringify({
              strategyName: input.strategyName,
              strategyGoal: input.strategyGoal || null,
              userMessage: input.userMessage,
              assistantResponse: input.assistantResponse || null,
            }),
          },
        ],
      }),
    })

    if (!response.ok) return fallback

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content
    const parsed = JSON.parse(raw || "{}")
    return normalizeChatTitle(parsed.title, fallback)
  } catch {
    return fallback
  }
}

async function getStrategyContext(db: any, tenantId: string, strategyId: string, recentLimit = 10) {
  const limit = Math.max(1, Math.min(25, Number(recentLimit) || 10))

  const { data: strategy, error: strategyError } = await db
    .from("strategies")
    .select("*")
    .eq("id", strategyId)
    .eq("tenant_id", tenantId)
    .single()

  if (strategyError || !strategy) {
    throw new Error("Estrategia nao encontrada.")
  }

  const [
    automationConfig,
    site,
    keywords,
    topics,
    briefs,
    posts,
    jobs,
  ] = await Promise.all([
    db.from("automation_configs").select("*").eq("tenant_id", tenantId).maybeSingle(),
    db.from("sites").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: true }).limit(1).maybeSingle(),
    db.from("keyword_candidates").select("*").eq("tenant_id", tenantId).eq("strategy_id", strategyId).order("created_at", { ascending: false }).limit(limit),
    db.from("topic_candidates").select("*").eq("tenant_id", tenantId).eq("strategy_id", strategyId).order("created_at", { ascending: false }).limit(limit),
    db.from("content_briefs").select("*").eq("tenant_id", tenantId).eq("strategy_id", strategyId).order("created_at", { ascending: false }).limit(limit),
    db.from("posts").select("*").eq("tenant_id", tenantId).eq("strategy_id", strategyId).order("created_at", { ascending: false }).limit(limit),
    db.from("automation_jobs").select("*").eq("tenant_id", tenantId).filter("payload_json->>strategy_id", "eq", strategyId).order("created_at", { ascending: false }).limit(limit),
  ])

  for (const result of [automationConfig, site, keywords, topics, briefs, posts, jobs]) {
    if (result.error) throw new Error(result.error.message)
  }

  const operationMode = parseOperationMode(automationConfig.data?.operation_mode)

  return {
    strategy,
    workspace: {
      operation_mode: operationMode,
      policy: operationPolicy(operationMode),
      automation_config: automationConfig.data ?? null,
    },
    site: site.data ?? null,
    recent: {
      keywords: keywords.data ?? [],
      topics: topics.data ?? [],
      briefs: briefs.data ?? [],
      posts: posts.data ?? [],
      jobs: jobs.data ?? [],
    },
    counts: {
      scheduled_posts: (posts.data ?? []).filter((post: any) => post.status === "scheduled" || post.scheduled_for || (post.published_at && new Date(post.published_at).getTime() > Date.now())).length,
      pending_jobs: (jobs.data ?? []).filter((job: any) => job.status === "pending" || job.status === "running").length,
      pending_keywords: (keywords.data ?? []).filter((item: any) => item.status === "pending").length,
      approved_keywords: (keywords.data ?? []).filter((item: any) => item.status === "approved").length,
      pending_topics: (topics.data ?? []).filter((item: any) => item.status === "pending").length,
      approved_topics: (topics.data ?? []).filter((item: any) => item.status === "approved").length,
    },
  }
}

function enforceToolPolicy(toolName: AssistantToolName, args: any, mode: OperationMode) {
  if (!MUTATING_TOOLS.has(toolName)) return null

  if (mode === "manual") {
    return "Bloqueado pelo modo manual. Neste workspace o chat so pode consultar e orientar; o usuario deve executar alteracoes pelos botoes da interface."
  }

  if (mode === "assisted") {
    if (toolName === "strategy_queue_job" && PUBLISHING_JOB_TYPES.has(args.job_type)) {
      return "Bloqueado pelo modo assistido. O chat pode gerar rascunhos e pedir aprovacao, mas nao publica posts."
    }

    if (toolName === "strategy_update_post" && PUBLISHING_POST_STATUSES.has(args.status)) {
      return "Bloqueado pelo modo assistido. O chat pode preparar o post, mas agendamento/publicacao final precisa de acao do usuario."
    }
  }

  return null
}

async function cancelPublishJobsForPost(db: any, tenantId: string, siteId: string, postId: string, reason: string) {
  const { data: jobs, error } = await db
    .from("automation_jobs")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("site_id", siteId)
    .eq("type", "publish_post")
    .in("status", ["pending", "running"])
    .contains("payload_json", { post_id: postId })

  if (error) throw new Error(error.message)
  if (!jobs?.length) return

  const { error: updateError } = await db
    .from("automation_jobs")
    .update({
      status: "cancelled",
      finished_at: new Date().toISOString(),
      error_message: reason,
      result_json: null,
      updated_at: new Date().toISOString(),
    })
    .in("id", jobs.map((job: any) => job.id))
    .eq("tenant_id", tenantId)

  if (updateError) throw new Error(updateError.message)
}

async function enqueuePublishJob(db: any, tenantId: string, siteId: string, postId: string, scheduledFor: string) {
  const { error } = await db.from("automation_jobs").insert({
    tenant_id: tenantId,
    site_id: siteId,
    type: "publish_post",
    status: "pending",
    priority: 40,
    max_attempts: 3,
    scheduled_for: scheduledFor,
    payload_json: {
      tenant_id: tenantId,
      site_id: siteId,
      post_id: postId,
    },
  })

  if (error) throw new Error(error.message)
}

async function getUniquePostSlug(db: any, tenantId: string, siteId: string, preferredSlug: string, usedSlugs: Set<string>) {
  const baseSlug = preferredSlug || `artigo-${Date.now().toString(36)}`
  let candidate = baseSlug
  let index = 2

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${index}`
    index += 1
  }

  const { data, error } = await db
    .from("posts")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("site_id", siteId)
    .eq("slug", candidate)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) {
    usedSlugs.add(candidate)
    return candidate
  }

  return getUniquePostSlug(db, tenantId, siteId, `${baseSlug}-${index}`, usedSlugs)
}

async function executeAssistantTool(db: any, tenantId: string, strategyId: string, toolName: AssistantToolName, args: any) {
  const context = await getStrategyContext(db, tenantId, strategyId, 10)
  const blocked = enforceToolPolicy(toolName, args, context.workspace.operation_mode)
  if (blocked) {
    return { ok: false, blocked: true, reason: blocked, mode: context.workspace.operation_mode }
  }

  if (toolName === "strategy_get_context") {
    return { ok: true, context: await getStrategyContext(db, tenantId, strategyId, args.recent_limit ?? 10) }
  }

  if (toolName === "strategy_update") {
    const patch = args.patch ?? {}
    const payload: Record<string, unknown> = {}
    for (const key of ["name", "description", "goal", "focus", "audience", "tone", "strategy_type", "status", "cadence", "color"]) {
      if (patch[key] !== undefined) payload[key] = patch[key]
    }
    if (typeof payload.goal === "string") payload.focus = payload.goal

    const { data, error } = await db
      .from("strategies")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", strategyId)
      .eq("tenant_id", tenantId)
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return { ok: true, strategy: data }
  }

  if (toolName === "strategy_queue_job") {
    if (!context.site) throw new Error("Nenhum site configurado para executar jobs.")
    const jobType = args.job_type
    const payloadBase = { tenant_id: tenantId, site_id: context.site.id, strategy_id: strategyId }
    const job: Record<string, unknown> = {
      tenant_id: tenantId,
      site_id: context.site.id,
      type: jobType,
      status: "pending",
      max_attempts: 3,
      priority: 10,
      payload_json: payloadBase,
    }

    if (jobType === "generate_keyword_strategy") {
      job.priority = 5
      job.payload_json = { ...payloadBase, keyword_count: Math.max(1, Math.min(50, Number(args.keyword_count) || 10)) }
    } else if (jobType === "generate_brief") {
      if (!args.topic_candidate_id) throw new Error("topic_candidate_id e obrigatorio para gerar brief.")
      const { data: topic, error } = await db.from("topic_candidates").select("id, status, strategy_id").eq("id", args.topic_candidate_id).eq("tenant_id", tenantId).single()
      if (error || !topic || topic.strategy_id !== strategyId) throw new Error("Topico nao encontrado nesta estrategia.")
      if (topic.status !== "approved") throw new Error("Aprove o topico antes de gerar o brief.")
      job.priority = 20
      job.payload_json = { ...payloadBase, topic_candidate_id: args.topic_candidate_id }
    } else if (jobType === "generate_post") {
      if (!args.content_brief_id) throw new Error("content_brief_id e obrigatorio para gerar post.")
      const { data: brief, error } = await db.from("content_briefs").select("id, status, strategy_id").eq("id", args.content_brief_id).eq("tenant_id", tenantId).single()
      if (error || !brief || brief.strategy_id !== strategyId) throw new Error("Brief nao encontrado nesta estrategia.")
      if (brief.status !== "approved") throw new Error("Aprove o brief antes de gerar o post.")
      job.priority = 30
      job.payload_json = { ...payloadBase, content_brief_id: args.content_brief_id }
    } else if (jobType === "publish_post") {
      if (!args.post_id || !args.scheduled_for) throw new Error("post_id e scheduled_for sao obrigatorios para publicar.")
      job.priority = 40
      job.scheduled_for = args.scheduled_for
      job.payload_json = { tenant_id: tenantId, site_id: context.site.id, post_id: args.post_id }
    }

    const { data, error } = await db.from("automation_jobs").insert(job).select("*").single()
    if (error) throw new Error(error.message)
    revalidateStrategyWorkspace()
    return { ok: true, job: data }
  }

  if (toolName === "strategy_set_keyword_status") {
    const { data, error } = await db
      .from("keyword_candidates")
      .update({ status: args.status, updated_at: new Date().toISOString() })
      .eq("id", args.keyword_id)
      .eq("tenant_id", tenantId)
      .eq("strategy_id", strategyId)
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return { ok: true, keyword: data }
  }

  if (toolName === "strategy_set_topic_status") {
    const { data, error } = await db
      .from("topic_candidates")
      .update({ status: args.status })
      .eq("id", args.topic_id)
      .eq("tenant_id", tenantId)
      .eq("strategy_id", strategyId)
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    if (args.status === "approved" && args.queue_brief_job !== false) {
      await executeAssistantTool(db, tenantId, strategyId, "strategy_queue_job", { job_type: "generate_brief", topic_candidate_id: args.topic_id })
    }
    return { ok: true, topic: data }
  }

  if (toolName === "strategy_set_brief_status") {
    const { data, error } = await db
      .from("content_briefs")
      .update({ status: args.status })
      .eq("id", args.brief_id)
      .eq("tenant_id", tenantId)
      .eq("strategy_id", strategyId)
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    if (args.status === "approved" && args.queue_post_job !== false) {
      await executeAssistantTool(db, tenantId, strategyId, "strategy_queue_job", { job_type: "generate_post", content_brief_id: args.brief_id })
    }
    return { ok: true, brief: data }
  }

  if (toolName === "strategy_create_draft_posts") {
    if (!context.site) throw new Error("Nenhum site configurado para criar posts.")

    const requestedPosts = Array.isArray(args.posts) ? args.posts.slice(0, 5) : []
    const now = new Date().toISOString()
    const usedSlugs = new Set<string>()
    const postsToInsert = []

    for (const item of requestedPosts) {
      const title = typeof item?.title === "string" ? item.title.trim() : ""
      const content = typeof item?.content === "string" ? item.content.trim() : ""
      if (!title || !content) continue

      const preferredSlug = slugifyTitle(typeof item?.slug === "string" && item.slug.trim() ? item.slug : title)
      const slug = await getUniquePostSlug(db, tenantId, context.site.id, preferredSlug, usedSlugs)
      const status = item.status === "in_review" ? "in_review" : "draft"

      postsToInsert.push({
        tenant_id: tenantId,
        site_id: context.site.id,
        strategy_id: strategyId,
        title,
        slug,
        content,
        status,
        published_at: null,
        scheduled_for: null,
        created_at: now,
        updated_at: now,
      })
    }

    if (!postsToInsert.length) {
      throw new Error("Forneca pelo menos um artigo com titulo e conteudo para criar rascunhos.")
    }

    const { data, error } = await db.from("posts").insert(postsToInsert).select("*")
    if (error) throw new Error(error.message)

    const revisions = (data ?? [])
      .filter((post: any) => typeof post.content === "string")
      .map((post: any) => ({ post_id: post.id, content: post.content }))

    if (revisions.length) {
      const { error: revisionError } = await db.from("post_revisions").insert(revisions)
      if (revisionError) throw new Error(`Posts criados, mas revisoes nao registradas: ${revisionError.message}`)
    }

    revalidateStrategyWorkspace()

    return {
      ok: true,
      note: typeof args.note === "string" ? args.note : null,
      created_count: data?.length ?? 0,
      posts: data ?? [],
    }
  }

  if (toolName === "strategy_update_post") {
    if (!context.site) throw new Error("Nenhum site configurado para atualizar posts.")
    const { data: post, error: postError } = await db
      .from("posts")
      .select("*")
      .eq("id", args.post_id)
      .eq("tenant_id", tenantId)
      .eq("site_id", context.site.id)
      .eq("strategy_id", strategyId)
      .single()
    if (postError || !post) throw new Error("Post nao encontrado nesta estrategia.")

    const status = args.status ?? post.status
    let publishedAt = post.published_at
    let scheduledFor = post.scheduled_for

    if (args.status === "scheduled") {
      const scheduledDate = new Date(args.published_at)
      if (!args.published_at || Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        throw new Error("Use uma data futura valida para agendar o post.")
      }
      publishedAt = scheduledDate.toISOString()
      scheduledFor = scheduledDate.toISOString()
    } else if (args.status === "published") {
      publishedAt = new Date().toISOString()
      scheduledFor = null
    } else if (args.status === "draft" || args.status === "rejected") {
      publishedAt = null
      scheduledFor = null
    } else if (args.status === "in_review" || args.status === "approved") {
      scheduledFor = null
    }

    const { data, error } = await db
      .from("posts")
      .update({
        title: typeof args.title === "string" && args.title.trim() ? args.title.trim() : post.title,
        slug: typeof args.slug === "string" && args.slug.trim() ? args.slug.trim() : post.slug,
        content: typeof args.content === "string" ? args.content : post.content,
        status,
        published_at: publishedAt,
        scheduled_for: scheduledFor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", args.post_id)
      .eq("tenant_id", tenantId)
      .eq("site_id", context.site.id)
      .select("*")
      .single()
    if (error) throw new Error(error.message)

    if (typeof args.content === "string" && args.content !== post.content) {
      await db.from("post_revisions").insert({ post_id: data.id, content: args.content })
    }
    if (args.status === "scheduled" && publishedAt) {
      await cancelPublishJobsForPost(db, tenantId, context.site.id, data.id, "Reagendado pelo agente da estrategia.")
      await enqueuePublishJob(db, tenantId, context.site.id, data.id, publishedAt)
    } else if (args.status && args.status !== "scheduled") {
      await cancelPublishJobsForPost(db, tenantId, context.site.id, data.id, "Cancelado por alteracao do agente da estrategia.")
    }
    revalidateStrategyWorkspace()
    return { ok: true, post: data }
  }

  return { ok: false, error: "Tool desconhecida." }
}

export type ChatSummary = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export async function listChats(strategyId: string): Promise<{ data: ChatSummary[]; error?: string }> {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { data, error } = await (db as any)
    .from("strategy_chats")
    .select("id, title, created_at, updated_at")
    .eq("tenant_id", tenant.id)
    .eq("strategy_id", strategyId)
    .order("updated_at", { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data ?? [] }
}

export async function createChat(strategyId: string, title?: string): Promise<{ data?: ChatSummary; error?: string }> {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { data, error } = await (db as any)
    .from("strategy_chats")
    .insert({
      tenant_id: tenant.id,
      strategy_id: strategyId,
      title: title || "Nova conversa",
    })
    .select("id, title, created_at, updated_at")
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function loadChatMessages(chatId: string): Promise<{ data: ChatMessage[]; error?: string }> {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { data, error } = await (db as any)
    .from("strategy_chat_messages")
    .select("id, role, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data: data ?? [] }
}

export async function saveChatMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
): Promise<{ data?: ChatMessage; error?: string }> {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { data, error } = await (db as any)
    .from("strategy_chat_messages")
    .insert({ chat_id: chatId, role, content })
    .select("id, role, content, created_at")
    .single()

  if (error) return { error: error.message }

  // Update chat title if this is the first user message
  if (role === "user") {
    const { data: msgs } = await (db as any)
      .from("strategy_chat_messages")
      .select("id")
      .eq("chat_id", chatId)
      .eq("role", "user")

    if (msgs && msgs.length === 1) {
      const title = content.slice(0, 80) + (content.length > 80 ? "…" : "")
      await (db as any).from("strategy_chats").update({ title, updated_at: new Date().toISOString() }).eq("id", chatId)
    } else {
      await (db as any).from("strategy_chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId)
    }
  }

  return { data }
}

export async function deleteChat(chatId: string): Promise<{ error?: string }> {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const { error } = await (db as any)
    .from("strategy_chats")
    .delete()
    .eq("id", chatId)
    .eq("tenant_id", tenant.id)

  if (error) return { error: error.message }
  return {}
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function askAssistantLegacy(chatId: string, strategyId: string, message: string): Promise<{ content?: string; error?: string }> {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  // 1. Get strategy context
  const { data: strategy } = await (db as any).from("strategies").select("*").eq("id", strategyId).single()
  if (!strategy) return { error: "Estrategia nao encontrada." }

  // 2. Get previous messages for this chat
  const { data: history } = await (db as any)
    .from("strategy_chat_messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  // 3. Save user message
  await (db as any).from("strategy_chat_messages").insert({ chat_id: chatId, role: "user", content: message })

  // 4. Update chat title if first message
  await (db as any).from("strategy_chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId)

  // 5. Call OpenAI
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { error: "OpenAI API Key nao configurada." }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Você é o estrategista de IA do sistema Antigravity. Seu objetivo é ajudar o usuário a refinar a estratégia de conteúdo dele.
            
Contexto da Estratégia Atual:
- Nome: ${strategy.name}
- Objetivo: ${strategy.goal || "não definido"}
- Público: ${strategy.audience || "não definido"}
- Tom: ${strategy.tone || "não definido"}
- Descrição: ${strategy.description || "não definido"}
- Modo: ${strategy.operation_mode}

Diretrizes:
1. Seja consultivo, direto e estratégico.
2. Ajude a definir melhores keywords, temas de artigos e como atingir o público-alvo.
3. Se o usuário quiser mudar algo na estratégia (como o objetivo ou tom), confirme os detalhes e sugira que ele atualize nas "Configurações Mestres".
4. Responda em Português do Brasil com um tom profissional e amigável.`,
          },
          ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const aiData = await response.json()
    const content = aiData.choices?.[0]?.message?.content

    // 6. Save assistant response
    if (content) {
      await (db as any).from("strategy_chat_messages").insert({ chat_id: chatId, role: "assistant", content })
    }

    return { content }
  } catch (err: any) {
    console.error("Assistant Error:", err)
    return { error: "Erro ao gerar resposta da IA." }
  }
}

export async function askAssistant(chatId: string, strategyId: string, message: string): Promise<{ content?: string; error?: string }> {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Nao autenticado.")
  const db = await getDb()

  const chatResult = await (db as any)
    .from("strategy_chats")
    .select("id")
    .eq("id", chatId)
    .eq("tenant_id", tenant.id)
    .eq("strategy_id", strategyId)
    .maybeSingle()

  if (chatResult.error) return { error: chatResult.error.message }
  if (!chatResult.data) return { error: "Conversa nao encontrada." }

  let context
  try {
    context = await getStrategyContext(db, tenant.id, strategyId, 10)
  } catch (error: any) {
    return { error: error.message || "Estrategia nao encontrada." }
  }

  const { data: history } = await (db as any)
    .from("strategy_chat_messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(30)

  await (db as any).from("strategy_chat_messages").insert({ chat_id: chatId, role: "user", content: message })

  const isFirstUserMessage = !history || history.length === 0
  await (db as any).from("strategy_chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { error: "OpenAI API Key nao configurada." }

  try {
    const approvedKeywords = (context.recent.keywords ?? []).filter((item: any) => item.status === "approved")
    const approvedTopics = (context.recent.topics ?? []).filter((item: any) => item.status === "approved")
    const recentPosts = context.recent.posts ?? []

    const baseMessages = [
      {
        role: "system",
        content: `Voce e o agente operacional de estrategia editorial do Fronte.

Use tools sempre que o usuario perguntar sobre estado real da estrategia, posts, calendario, jobs, keywords, topicos, briefs ou quando pedir uma acao operacional.
Nunca diga que nao tem acesso ao painel: consulte strategy_get_context.

Modo do workspace: ${context.workspace.operation_mode}
Politica: ${context.workspace.policy}

Estrategia atual:
- ID: ${context.strategy.id}
- Nome: ${context.strategy.name}
- Objetivo: ${context.strategy.goal || context.strategy.focus || "nao definido"}
- Publico: ${context.strategy.audience || "nao definido"}
- Tom: ${context.strategy.tone || "nao definido"}
- Tipo: ${context.strategy.strategy_type || "seo"}
- Cadencia: ${context.strategy.cadence || 8} artigos/mes
- Keywords aprovadas recentes: ${summarizeList(approvedKeywords, (item: any) => item.keyword || item.term)}
- Topicos aprovados recentes: ${summarizeList(approvedTopics, (item: any) => item.topic || item.title)}
- Posts recentes: ${summarizeList(recentPosts, (item: any) => item.title)}

Regras:
1. Responda em Portugues do Brasil.
2. Seja direto e operacional.
3. No modo manual, nao execute mudancas por chat; oriente o proximo clique.
4. No modo assistido, execute geracao/pesquisa/aprovacoes quando pedido, mas nao agende nem publique.
5. No modo automatico, execute dentro das regras e reporte o que foi feito.
6. Se o usuario pedir para criar/produzir/escrever posts ou artigos, use strategy_create_draft_posts. Nao prometa criacao futura sem tool.
7. Ao criar posts, gere conteudo substancial em Markdown; nao grave placeholder nem apenas outline.
8. So diga "criei", "gerei", "enfileirei", "atualizei" ou "agendei" quando uma tool retornar ok=true.
9. Se faltar ID de item para uma acao, consulte contexto e peca uma escolha objetiva.`,
      },
      ...(history || []).slice(-20).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        tools: ASSISTANT_TOOLS,
        tool_choice: getToolChoiceForMessage(message),
        messages: baseMessages,
      }),
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const aiData = await response.json()
    const assistantMessage = aiData.choices?.[0]?.message
    const toolCalls = assistantMessage?.tool_calls || []
    let content = assistantMessage?.content

    if (toolCalls.length > 0) {
      const toolMessages = []

      for (const toolCall of toolCalls.slice(0, 5)) {
        const toolName = toolCall.function?.name as AssistantToolName
        const args = normalizeToolArgs(toolCall.function?.arguments)

        let result
        try {
          if (!ASSISTANT_TOOLS.some((tool) => tool.function.name === toolName)) {
            result = { ok: false, error: "Tool nao permitida." }
          } else {
            result = await executeAssistantTool(db, tenant.id, strategyId, toolName, args)
          }
        } catch (error: any) {
          result = { ok: false, error: error.message || "Falha ao executar tool." }
        }

        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        })
      }

      const finalResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          temperature: 0.2,
          messages: [
            ...baseMessages,
            assistantMessage,
            ...toolMessages,
            {
              role: "system",
              content:
                "Resposta final: relate apenas acoes confirmadas pelos resultados das tools. Se uma tool foi bloqueada ou falhou, explique isso claramente. Se posts foram criados, liste os titulos e diga que estao como rascunho/revisao, sem dizer que foram agendados/publicados.",
            },
          ],
        }),
      })

      if (!finalResponse.ok) {
        throw new Error(await finalResponse.text())
      }

      const finalData = await finalResponse.json()
      content = finalData.choices?.[0]?.message?.content
    }

    if (content) {
      await (db as any).from("strategy_chat_messages").insert({ chat_id: chatId, role: "assistant", content })
    }

    const finalContent = content || "Nao consegui gerar uma resposta para essa acao."

    if (isFirstUserMessage) {
      const title = await generateChatTitle({
        apiKey,
        strategyName: context.strategy.name,
        strategyGoal: context.strategy.goal || context.strategy.focus,
        userMessage: message,
        assistantResponse: finalContent,
      })

      await (db as any)
        .from("strategy_chats")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", chatId)
        .eq("tenant_id", tenant.id)
    }

    return { content: finalContent }
  } catch (err: any) {
    console.error("Assistant Error:", err)
    return { error: "Erro ao gerar resposta da IA." }
  }
}
