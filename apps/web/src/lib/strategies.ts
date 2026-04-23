import type { Tables } from "@super/db"

export type StrategyStatus = "ativa" | "pausada" | "rascunho"
export type StrategyType = "seo" | "local" | "blog" | "conversao"
export type OperationMode = "manual" | "assisted" | "automatic"

export type KeywordItem = {
  id: string
  strategyId: string
  keyword: string
  difficulty: number | "baixa" | "média" | "alta" // Support both score and label
  traffic?: string
  search_volume?: string
  search_volume_int?: number | null
  cpc?: number | null
  competition_level?: string | null
  search_intent?: string | null
  source?: string
  estimated_potential?: string
  stage: "Consciência" | "Consideração" | "Decisão" | string
  type: "Long tail" | "Short tail" | string
  status: "approved" | "pending" | "rejected"
}

export type TopicItem = {
  id: string
  strategyId: string
  title: string
  keywords: string[]
  stage: "Consciência" | "Consideração" | "Decisão"
  priority: "alta" | "média" | "baixa"
  estimatedTraffic: string
  status: "approved" | "pending"
}

export type CalendarEvent = {
  id: string
  strategyId: string
  date: number
  title: string
  status: "published" | "scheduled" | "draft"
}

export type ArticleStatus =
  | "queued"
  | "generating"
  | "draft"
  | "review"
  | "scheduled"
  | "published"

export type ArticleItem = {
  id: string
  strategyId: string
  topicId?: string
  title: string
  excerpt: string
  status: ArticleStatus
  createdAt: string
  scheduledFor?: string // formatted date string for UI
  scheduledAt?: string // ISO date string for calendar
  views?: string
  keywords: string[]
  progress?: number
}

export type Strategy = {
  id: string
  name: string
  description: string
  type: StrategyType
  status: StrategyStatus
  tone: string
  audience: string
  goal: string
  cadence: number
  operation_mode: OperationMode
  lastUpdated: string
  color: string
}

// ============================================
// Pure adapters (no server dependency)
// ============================================

export function adaptStrategy(db: Tables<"strategies">): Strategy {
  const statusMap: Record<string, StrategyStatus> = {
    configuring: "rascunho",
    active: "ativa",
    paused: "pausada",
    archived: "pausada",
  }

  return {
    id: db.id,
    name: db.name,
    description: db.description || "Sem descrição definida.",
    type: (db.strategy_type as StrategyType) || "seo",
    status: statusMap[db.status] || "rascunho",
    tone: db.tone || "Tom não definido",
    audience: db.audience || "Público não definido",
    goal: db.goal || "Sem objetivo definido",
    cadence: db.cadence || 8,
    operation_mode: (db.operation_mode as OperationMode) || "manual",
    lastUpdated: db.updated_at,
    color: db.color || "#3b82f6",
  }
}

const postStatusMap: Record<string, ArticleStatus> = {
  draft: "draft",
  in_review: "review",
  approved: "draft",
  scheduled: "scheduled",
  published: "published",
  rejected: "draft",
}

export function adaptPost(db: Tables<"posts">): ArticleItem {
  const created = new Date(db.created_at)
  const relative = formatRelativeDate(created)

  return {
    id: db.id,
    strategyId: db.strategy_id ?? "",
    title: db.title,
    excerpt: db.content ? db.content.slice(0, 140).replace(/[#*_]/g, "").trim() + "…" : "Sem conteúdo ainda.",
    status: postStatusMap[db.status] ?? "draft",
    createdAt: relative,
    scheduledFor: db.scheduled_for ? formatShortDate(new Date(db.scheduled_for)) : undefined,
    scheduledAt: db.scheduled_for ?? undefined,
    keywords: [],
    progress: undefined,
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Agora"
  if (diffMin < 60) return `${diffMin}min atrás`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h atrás`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d atrás`
  return formatShortDate(date)
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}


// ============================================
// TEMPORARY MOCKS FOR RETROCOMPATIBILITY
// ============================================

export const STRATEGIES: Strategy[] = [
  {
    id: "s1",
    name: "Estratégia SEO Blog",
    description:
      "Conteúdo educativo focado em ranquear no Google para termos informacionais do segmento.",
    type: "seo",
    status: "ativa",
    tone: "Profissional e educativo",
    audience: "Adultos 25-55 interessados em saúde bucal",
    goal: "Aumentar tráfego orgânico qualificado em 3x",
    cadence: 8,
    operation_mode: "assisted",
    lastUpdated: "2025-11-08",
    color: "#3b82f6",
  },
  {
    id: "s2",
    name: "Estratégia Local",
    description:
      "Artigos otimizados para SEO local e Google Maps, focados em clientes na região.",
    type: "local",
    status: "ativa",
    tone: "Acolhedor e próximo",
    audience: "Moradores da zona sul de São Paulo",
    goal: "Dominar buscas locais e aumentar agendamentos",
    cadence: 4,
    operation_mode: "automatic",
    lastUpdated: "2025-11-06",
    color: "#10b981",
  },
  {
    id: "s3",
    name: "Estratégia de Conversão",
    description:
      "Conteúdo persuasivo com CTAs diretos para gerar leads e agendamentos qualificados.",
    type: "conversao",
    status: "pausada",
    tone: "Persuasivo e direto",
    audience: "Pessoas com intenção alta (fundo de funil)",
    goal: "Converter leitores em leads qualificados",
    cadence: 4,
    operation_mode: "manual",
    lastUpdated: "2025-10-28",
    color: "#f97316",
  },
]

export const KEYWORDS: KeywordItem[] = [
  { id: "k1", strategyId: "s1", keyword: "clareamento dental preço", difficulty: "média", traffic: "2.8K", stage: "Consideração", type: "Long tail", status: "approved" },
  { id: "k2", strategyId: "s1", keyword: "implante dentário", difficulty: "alta", traffic: "8.1K", stage: "Consciência", type: "Short tail", status: "pending" },
  { id: "k3", strategyId: "s1", keyword: "quanto custa um canal", difficulty: "baixa", traffic: "1.5K", stage: "Consideração", type: "Long tail", status: "approved" },
]

export const TOPICS: TopicItem[] = [
  { id: "t1", strategyId: "s1", title: "10 Dicas para Manter os Dentes Brancos", keywords: ["clareamento dental"], stage: "Consciência", priority: "alta", estimatedTraffic: "850", status: "approved" },
  { id: "t2", strategyId: "s1", title: "Quanto Custa um Implante Dentário", keywords: ["implante"], stage: "Consideração", priority: "alta", estimatedTraffic: "1.2K", status: "approved" },
]

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "c1", strategyId: "s1", date: 8, title: "10 Dicas para Dentes Brancos", status: "published" },
]

export const ARTICLES: ArticleItem[] = [
  { id: "ap1", strategyId: "s1", topicId: "t3", title: "Clareamento Dental", excerpt: "Artigo.", status: "generating", createdAt: "Agora", keywords: ["clareamento dental"], progress: 62 },
]

export const PRODUCTION_STATUSES: ArticleStatus[] = ["queued", "generating"]

export function listStrategies(): Strategy[] {
  return STRATEGIES
}

export function getStrategy(id: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.id === id)
}

export function getStrategyStats(id: string) {
  const articles = ARTICLES.filter((a) => a.strategyId === id)
  return {
    keywords: KEYWORDS.filter((k) => k.strategyId === id).length,
    topics: TOPICS.filter((t) => t.strategyId === id).length,
    articles: articles.length,
    inProduction: articles.filter((a) => PRODUCTION_STATUSES.includes(a.status)).length,
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
    scheduled: articles.filter((a) => a.status === "scheduled").length,
  }
}

export function getKeywordsByStrategy(id: string) {
  return KEYWORDS.filter((k) => k.strategyId === id)
}

export function getTopicsByStrategy(id: string) {
  return TOPICS.filter((t) => t.strategyId === id)
}

export function getCalendarByStrategy(id: string) {
  return CALENDAR_EVENTS.filter((c) => c.strategyId === id)
}

export function getArticlesByStrategy(id: string) {
  return ARTICLES.filter((a) => a.strategyId === id)
}

export function getAllArticles() {
  return ARTICLES
}

export function getAllCalendarEvents() {
  return CALENDAR_EVENTS
}

export function getArticlesInProduction(strategyId?: string) {
  return ARTICLES.filter(
    (a) =>
      PRODUCTION_STATUSES.includes(a.status) &&
      (strategyId ? a.strategyId === strategyId : true),
  )
}

export function getScheduledArticles() {
  return ARTICLES.filter((a) => a.status === "scheduled")
}

export function getUnscheduledArticles() {
  return ARTICLES.filter(
    (a) => a.status === "draft" || a.status === "review",
  )
}
