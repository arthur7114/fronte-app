export type StrategyStatus = "ativa" | "pausada" | "rascunho"
export type StrategyType = "seo" | "local" | "blog" | "conversao"

export type KeywordItem = {
  id: string
  strategyId: string
  keyword: string
  difficulty: "baixa" | "média" | "alta"
  traffic: string
  stage: "Consciência" | "Consideração" | "Decisão"
  type: "Long tail" | "Short tail"
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
  scheduledFor?: string
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
  lastUpdated: string
  color: string
}

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
    lastUpdated: "2025-10-28",
    color: "#f97316",
  },
]

export const KEYWORDS: KeywordItem[] = [
  // s1 — SEO Blog
  { id: "k1", strategyId: "s1", keyword: "clareamento dental preço", difficulty: "média", traffic: "2.8K", stage: "Consideração", type: "Long tail", status: "approved" },
  { id: "k2", strategyId: "s1", keyword: "implante dentário", difficulty: "alta", traffic: "8.1K", stage: "Consciência", type: "Short tail", status: "pending" },
  { id: "k3", strategyId: "s1", keyword: "quanto custa um canal", difficulty: "baixa", traffic: "1.5K", stage: "Consideração", type: "Long tail", status: "approved" },
  { id: "k4", strategyId: "s1", keyword: "dor de dente o que fazer", difficulty: "média", traffic: "4.2K", stage: "Consciência", type: "Long tail", status: "pending" },
  { id: "k5", strategyId: "s1", keyword: "aparelho ortodôntico invisível", difficulty: "alta", traffic: "3.6K", stage: "Consideração", type: "Long tail", status: "rejected" },
  { id: "k6", strategyId: "s1", keyword: "sensibilidade dental tratamento", difficulty: "baixa", traffic: "980", stage: "Consciência", type: "Long tail", status: "approved" },

  // s2 — Local
  { id: "k7", strategyId: "s2", keyword: "dentista são paulo zona sul", difficulty: "baixa", traffic: "1.2K", stage: "Decisão", type: "Long tail", status: "approved" },
  { id: "k8", strategyId: "s2", keyword: "clínica odontológica moema", difficulty: "baixa", traffic: "680", stage: "Decisão", type: "Long tail", status: "approved" },
  { id: "k9", strategyId: "s2", keyword: "dentista 24 horas são paulo", difficulty: "média", traffic: "2.1K", stage: "Decisão", type: "Long tail", status: "pending" },

  // s3 — Conversão
  { id: "k10", strategyId: "s3", keyword: "agendar consulta dentista online", difficulty: "baixa", traffic: "520", stage: "Decisão", type: "Long tail", status: "approved" },
  { id: "k11", strategyId: "s3", keyword: "orçamento implante dentário grátis", difficulty: "média", traffic: "890", stage: "Decisão", type: "Long tail", status: "pending" },
]

export const TOPICS: TopicItem[] = [
  // s1
  { id: "t1", strategyId: "s1", title: "10 Dicas para Manter os Dentes Brancos", keywords: ["clareamento dental", "dentes brancos"], stage: "Consciência", priority: "alta", estimatedTraffic: "850", status: "approved" },
  { id: "t2", strategyId: "s1", title: "Quanto Custa um Implante Dentário em 2026", keywords: ["implante dentário preço", "valor implante"], stage: "Consideração", priority: "alta", estimatedTraffic: "1.2K", status: "approved" },
  { id: "t3", strategyId: "s1", title: "Clareamento Dental: Caseiro ou no Consultório?", keywords: ["clareamento dental", "clareamento caseiro"], stage: "Consideração", priority: "média", estimatedTraffic: "650", status: "pending" },
  { id: "t4", strategyId: "s1", title: "Por Que Meus Dentes Doem com Frio?", keywords: ["sensibilidade dental", "dor de dente"], stage: "Consciência", priority: "média", estimatedTraffic: "420", status: "pending" },
  { id: "t9", strategyId: "s1", title: "Alimentos que Mancham os Dentes: Lista", keywords: ["dentes amarelados", "alimentos"], stage: "Consciência", priority: "baixa", estimatedTraffic: "380", status: "approved" },
  { id: "t10", strategyId: "s1", title: "Guia Rápido: Fio Dental ou Escova Interdental?", keywords: ["fio dental", "higiene bucal"], stage: "Consciência", priority: "média", estimatedTraffic: "510", status: "approved" },

  // s2
  { id: "t5", strategyId: "s2", title: "Melhor Dentista em Moema: Como Escolher", keywords: ["dentista moema", "dentista são paulo"], stage: "Decisão", priority: "alta", estimatedTraffic: "540", status: "approved" },
  { id: "t6", strategyId: "s2", title: "Guia: Encontrando Dentista 24h em SP", keywords: ["dentista 24 horas"], stage: "Decisão", priority: "média", estimatedTraffic: "380", status: "pending" },

  // s3
  { id: "t7", strategyId: "s3", title: "Como Funciona o Agendamento Online", keywords: ["agendar consulta"], stage: "Decisão", priority: "alta", estimatedTraffic: "260", status: "approved" },
]

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // s1
  { id: "c1", strategyId: "s1", date: 8, title: "10 Dicas para Dentes Brancos", status: "published" },
  { id: "c2", strategyId: "s1", date: 12, title: "Quanto Custa um Implante", status: "scheduled" },
  { id: "c3", strategyId: "s1", date: 15, title: "Clareamento Caseiro ou Consultório", status: "scheduled" },
  { id: "c4", strategyId: "s1", date: 19, title: "Sensibilidade Dental", status: "draft" },
  { id: "c5", strategyId: "s1", date: 22, title: "Aparelho Invisível: Guia", status: "scheduled" },

  // s2
  { id: "c6", strategyId: "s2", date: 10, title: "Dentista em Moema: Como escolher", status: "published" },
  { id: "c7", strategyId: "s2", date: 17, title: "Dentista 24h em SP", status: "draft" },

  // s3
  { id: "c8", strategyId: "s3", date: 14, title: "Agendamento Online", status: "scheduled" },
]

export const ARTICLES: ArticleItem[] = [
  // --- Em produção ---
  { id: "ap1", strategyId: "s1", topicId: "t3", title: "Clareamento Dental: Caseiro ou no Consultório?", excerpt: "Artigo em geração a partir de tópico aprovado.", status: "generating", createdAt: "Agora", keywords: ["clareamento dental"], progress: 62 },
  { id: "ap2", strategyId: "s1", topicId: "t4", title: "Por Que Meus Dentes Doem com Frio?", excerpt: "Na fila para produção.", status: "queued", createdAt: "Agora", keywords: ["sensibilidade dental"] },
  { id: "ap3", strategyId: "s2", topicId: "t6", title: "Guia: Encontrando Dentista 24h em SP", excerpt: "Na fila para produção.", status: "queued", createdAt: "Agora", keywords: ["dentista 24 horas"] },

  // s1 — prontos
  { id: "a1", strategyId: "s1", title: "10 Dicas para Manter os Dentes Brancos em Casa", excerpt: "Descubra técnicas simples e eficazes para manter o brilho do seu sorriso sem sair de casa...", status: "published", createdAt: "5 Abr 2026", views: "2.3K", keywords: ["clareamento dental", "dentes brancos"] },
  { id: "a2", strategyId: "s1", title: "Quanto Custa um Implante Dentário em 2026", excerpt: "Um guia completo sobre valores, procedimentos e o que esperar ao fazer um implante dentário...", status: "published", createdAt: "2 Abr 2026", views: "1.8K", keywords: ["implante dentário", "preço implante"] },
  { id: "a3", strategyId: "s1", title: "Clareamento Dental: Caseiro ou no Consultório?", excerpt: "Entenda as diferenças entre os métodos de clareamento e qual é o melhor para você...", status: "review", createdAt: "Hoje", keywords: ["clareamento dental", "clareamento caseiro"] },
  { id: "a4", strategyId: "s1", title: "Por Que Meus Dentes Doem com Frio?", excerpt: "Sensibilidade dental pode ter várias causas. Veja o que pode estar acontecendo...", status: "draft", createdAt: "Hoje", keywords: ["sensibilidade dental", "dor de dente"] },
  { id: "a5", strategyId: "s1", title: "Guia Completo do Aparelho Invisível", excerpt: "Tudo o que você precisa saber sobre alinhadores transparentes e como funcionam...", status: "scheduled", scheduledFor: "15 Abr 2026", createdAt: "8 Abr 2026", keywords: ["aparelho invisível", "invisalign"] },

  // s2
  { id: "a6", strategyId: "s2", title: "Melhor Dentista em Moema: Guia 2026", excerpt: "Como escolher uma clínica próxima a você...", status: "published", createdAt: "3 Abr 2026", views: "640", keywords: ["dentista moema"] },
  { id: "a7", strategyId: "s2", title: "Dentista 24h em São Paulo: onde encontrar", excerpt: "Lista de clínicas com atendimento emergencial...", status: "draft", createdAt: "Hoje", keywords: ["dentista 24 horas"] },

  // s3
  { id: "a8", strategyId: "s3", title: "Agende sua consulta em 2 minutos", excerpt: "Passo a passo para agendar online e garantir o melhor horário...", status: "scheduled", scheduledFor: "20 Abr 2026", createdAt: "7 Abr 2026", keywords: ["agendar consulta"] },
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
