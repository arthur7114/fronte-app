import type { Tables } from "@super/db"
import { JOB_TYPE_LABELS } from "@/lib/automation"
import type { ArticleItem, ArticleStatus, Strategy, TopicItem } from "@/lib/strategies"

type AutomationJob = Tables<"automation_jobs">
type TopicCandidate = Tables<"topic_candidates">
type ContentBrief = Tables<"content_briefs">

type JsonRecord = Record<string, unknown>

export type ProductionQueueItem = Omit<ArticleItem, "status"> & {
  status: Extract<ArticleStatus, "queued" | "generating">
  source: "post" | "job"
  jobId?: string
  jobType?: string
  strategyName?: string
  strategyColor?: string
  statusDetail?: string
}

export type ProductionProgress = {
  total: number
  created: number
  running: number
  queued: number
  failed: number
}

export type JobNotificationEvent = "started" | "completed" | "failed"

export type JobNotificationItem = {
  id: string
  jobId: string
  event: JobNotificationEvent
  title: string
  description: string
  href?: string
  createdAt: string
}

const PRODUCTION_JOB_TYPES = new Set(["generate_brief", "generate_post"])
const ACTIVE_STATUSES = new Set(["pending", "running"])

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as JsonRecord
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Agora"
  if (diffMin < 60) return `${diffMin}min atras`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h atras`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d atras`
}

function strategyFor(strategies: Strategy[], strategyId: string | null) {
  if (!strategyId) return undefined
  return strategies.find((strategy) => strategy.id === strategyId)
}

function topicFor(topics: TopicCandidate[], topicId: string | null) {
  if (!topicId) return undefined
  return topics.find((topic) => topic.id === topicId)
}

function briefFor(briefs: ContentBrief[], briefId: string | null) {
  if (!briefId) return undefined
  return briefs.find((brief) => brief.id === briefId)
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
}

export function toProductionQueueItems(input: {
  articles: ArticleItem[]
  jobs: AutomationJob[]
  topics: TopicCandidate[]
  briefs: ContentBrief[]
  strategies: Strategy[]
}): ProductionQueueItem[] {
  const postItems: ProductionQueueItem[] = input.articles
    .filter(
      (article): article is ArticleItem & { status: Extract<ArticleStatus, "queued" | "generating"> } =>
        article.status === "queued" || article.status === "generating",
    )
    .map((article) => {
      const strategy = strategyFor(input.strategies, article.strategyId)
      return {
        ...article,
        source: "post",
        strategyName: strategy?.name,
        strategyColor: strategy?.color,
        statusDetail: article.status === "generating" ? "Escrevendo conteudo" : "Aguardando processamento",
      }
    })

  const activeJobItems = input.jobs
    .filter((job) => PRODUCTION_JOB_TYPES.has(job.type) && ACTIVE_STATUSES.has(job.status))
    .map((job): ProductionQueueItem | null => {
      const payload = asRecord(job.payload_json)
      const topic = topicFor(input.topics, asString(payload.topic_candidate_id))
      const brief = briefFor(input.briefs, asString(payload.content_brief_id))
      const strategyId = asString(payload.strategy_id) ?? topic?.strategy_id ?? brief?.strategy_id ?? ""
      const strategy = strategyFor(input.strategies, strategyId)
      const isRunning = job.status === "running"
      const title = topic?.topic ?? brief?.topic ?? JOB_TYPE_LABELS[job.type as keyof typeof JOB_TYPE_LABELS] ?? "Artigo em producao"
      const keyword = topic?.source ?? brief?.keywords?.[0] ?? null

      return {
        id: `job-${job.id}`,
        strategyId,
        title,
        excerpt: isRunning ? "A IA esta criando este artigo." : "Aguardando o worker iniciar.",
        status: isRunning ? "generating" : "queued",
        createdAt: formatRelativeDate(job.created_at),
        keywords: keyword ? [keyword] : [],
        progress: isRunning ? 55 : 0,
        source: "job",
        jobId: job.id,
        jobType: job.type,
        strategyName: strategy?.name,
        strategyColor: strategy?.color,
        statusDetail: job.type === "generate_brief" ? "Gerando briefing" : "Gerando rascunho",
      }
    })
    .filter((item): item is ProductionQueueItem => Boolean(item))

  const postTitles = new Set(postItems.map((item) => `${item.strategyId}:${normalizeText(item.title)}`))
  const jobItems = activeJobItems.filter((item) => !postTitles.has(`${item.strategyId}:${normalizeText(item.title)}`))

  return [...jobItems, ...postItems]
}

export function getProductionProgress(items: ProductionQueueItem[], jobs: AutomationJob[]): ProductionProgress {
  const productionJobs = jobs.filter((job) => PRODUCTION_JOB_TYPES.has(job.type))
  const recentCutoff = Date.now() - 2 * 60 * 60 * 1000
  const relevantJobs = productionJobs.filter(
    (job) => ACTIVE_STATUSES.has(job.status) || new Date(job.created_at).getTime() >= recentCutoff,
  )
  const createdFromJobs = relevantJobs.filter((job) => job.status === "completed" && job.type === "generate_post").length
  const createdFromPosts = items.filter((item) => item.source === "post" && item.status !== "queued").length
  const activeTotal = items.length

  return {
    total: Math.max(activeTotal + createdFromJobs, activeTotal),
    created: Math.max(createdFromJobs, createdFromPosts),
    running: items.filter((item) => item.status === "generating").length,
    queued: items.filter((item) => item.status === "queued").length,
    failed: relevantJobs.filter((job) => job.status === "failed").length,
  }
}

export function toTopicItems(topics: TopicCandidate[]): TopicItem[] {
  return topics.map((topic) => ({
    id: topic.id,
    strategyId: topic.strategy_id ?? "",
    title: topic.topic,
    keywords: topic.source ? [topic.source] : [],
    stage:
      topic.journey_stage === "consideration"
        ? "Consideração"
        : topic.journey_stage === "decision"
          ? "Decisão"
          : "Consciência",
    priority: topic.score == null ? "média" : topic.score >= 80 ? "alta" : topic.score >= 50 ? "média" : "baixa",
    estimatedTraffic: topic.score == null ? "-" : String(topic.score),
    status: topic.status === "approved" ? "approved" : topic.status === "rejected" ? "rejected" : "suggested",
  }))
}

export function toJobNotifications(jobs: AutomationJob[]): JobNotificationItem[] {
  return jobs.flatMap((job) => {
    const label = JOB_TYPE_LABELS[job.type as keyof typeof JOB_TYPE_LABELS] ?? job.type
    const payload = asRecord(job.payload_json)
    const strategyId = asString(payload.strategy_id)
    const href = strategyId ? `/dashboard/estrategias/${strategyId}` : "/dashboard/artigos"
    const events: JobNotificationItem[] = []

    events.push({
      id: `${job.id}:started`,
      jobId: job.id,
      event: "started",
      title: `${label} iniciado`,
      description: job.status === "pending" ? "O job entrou na fila de producao." : "O worker iniciou o processamento.",
      href,
      createdAt: job.started_at ?? job.created_at,
    })

    if (job.status === "completed" && job.finished_at) {
      events.push({
        id: `${job.id}:completed`,
        jobId: job.id,
        event: "completed",
        title: `${label} concluido`,
        description: "Os dados foram atualizados e ja podem aparecer na interface.",
        href,
        createdAt: job.finished_at,
      })
    }

    if (job.status === "failed" && job.finished_at) {
      events.push({
        id: `${job.id}:failed`,
        jobId: job.id,
        event: "failed",
        title: `${label} falhou`,
        description: job.error_message ?? "O job falhou durante o processamento.",
        href,
        createdAt: job.finished_at,
      })
    }

    return events
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
