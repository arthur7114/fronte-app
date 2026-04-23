"use client"

import { useSyncExternalStore } from "react"

export type Channel =
  | "Blog"
  | "Instagram"
  | "LinkedIn"
  | "YouTube"
  | "Ads"
  | "SEO"

export type Confidence = "alta" | "média" | "baixa"
export type Impact = "alto" | "médio" | "baixo"
export type Effort = "alto" | "médio" | "baixo"

export type Competitor = {
  id: string
  strategyId: string
  name: string
  category: string
  url?: string
  channels: Channel[]
  dominantChannel: Channel
  frequency: string // "3,2/semana"
  tone: string
  presenceScore: number // 0..100
  confidence: Confidence
  recurringThemes: string[]
  angles: string[]
  gap: string
  channelBreakdown: { channel: Channel; score: number }[]
}

export type Opportunity = {
  id: string
  strategyId: string
  title: string
  rationale: string
  impact: Impact
  effort: Effort
  suggestedAs: "topic" | "keyword" | "angle"
  suggestedValue: string
}

export type ComparisonRow = {
  competitorId: string
  competitor: string
  dominantChannel: Channel
  recurringTheme: string
  frequency: string
  strength: "forte" | "média" | "fraca"
  gap: string
}

export type SavedInsight = {
  id: string
  strategyId: string
  kind: "opportunity" | "competitor" | "comparison"
  title: string
  subtitle?: string
  sourceId: string
  addedAt: string
  appliedAs?: "topic" | "keyword" | "angle" | null
}

export type AnalysisRun = {
  id: string
  strategyId: string
  runAt: string
  niche: string
  region: string
  depth: "rápida" | "padrão" | "profunda"
  period: 30 | 90 | 180
  channels: Channel[]
  status: "completed" | "running"
}

type StoreState = {
  competitors: Competitor[]
  opportunities: Opportunity[]
  savedInsights: SavedInsight[]
  runs: AnalysisRun[]
}

// --- Mock seed (estratégia s1 — clínica odontológica, SEO Blog) ---
const state: StoreState = {
  competitors: [
    {
      id: "c1",
      strategyId: "s1",
      name: "Odonto Excellence",
      category: "Clínica premium — mercado dental SP",
      url: "odontoexcellence.com.br",
      channels: ["Blog", "Instagram", "SEO"],
      dominantChannel: "Instagram",
      frequency: "4,1 posts/semana",
      tone: "Acolhedor e educativo",
      presenceScore: 78,
      confidence: "alta",
      recurringThemes: [
        "Clareamento dental",
        "Implantes",
        "Rotina de higiene",
        "Antes e depois",
      ],
      angles: [
        "Depoimentos reais com foco em transformação",
        "FAQ curtos em carrossel",
        "Vídeos rápidos tirando dúvidas comuns",
      ],
      gap: "Pouca profundidade técnica no blog; artigos rasos de 600-800 palavras.",
      channelBreakdown: [
        { channel: "Instagram", score: 88 },
        { channel: "Blog", score: 62 },
        { channel: "SEO", score: 58 },
        { channel: "LinkedIn", score: 22 },
        { channel: "YouTube", score: 18 },
        { channel: "Ads", score: 40 },
      ],
    },
    {
      id: "c2",
      strategyId: "s1",
      name: "Sorriso Perfeito",
      category: "Rede de franquias — nacional",
      url: "sorrisoperfeito.com.br",
      channels: ["Blog", "SEO", "Ads", "YouTube"],
      dominantChannel: "SEO",
      frequency: "6,5 posts/mês",
      tone: "Comercial e direto",
      presenceScore: 84,
      confidence: "alta",
      recurringThemes: [
        "Preço de implante",
        "Financiamento",
        "Unidades próximas",
        "Convênios",
      ],
      angles: [
        "Comparativos de preço por cidade",
        "Tabelas de procedimentos",
        "Landing pages por serviço",
      ],
      gap: "Domina termos comerciais, mas ignora fundo de funil educativo.",
      channelBreakdown: [
        { channel: "SEO", score: 92 },
        { channel: "Ads", score: 80 },
        { channel: "Blog", score: 70 },
        { channel: "YouTube", score: 48 },
        { channel: "Instagram", score: 52 },
        { channel: "LinkedIn", score: 18 },
      ],
    },
    {
      id: "c3",
      strategyId: "s1",
      name: "Dental Care SP",
      category: "Clínica boutique — Moema",
      url: "dentalcaresp.com.br",
      channels: ["Blog", "Instagram", "LinkedIn"],
      dominantChannel: "Blog",
      frequency: "2,2 posts/semana",
      tone: "Técnico e autoral",
      presenceScore: 61,
      confidence: "média",
      recurringThemes: [
        "Odontologia estética",
        "Tecnologia em consultório",
        "Bem-estar",
      ],
      angles: [
        "Casos clínicos narrados",
        "Explicações longas com referências",
        "Entrevistas com especialistas",
      ],
      gap: "Frequência baixa e distribuição social fraca, apesar de conteúdo denso.",
      channelBreakdown: [
        { channel: "Blog", score: 74 },
        { channel: "LinkedIn", score: 46 },
        { channel: "Instagram", score: 40 },
        { channel: "SEO", score: 52 },
        { channel: "YouTube", score: 10 },
        { channel: "Ads", score: 8 },
      ],
    },
  ],
  opportunities: [
    {
      id: "o1",
      strategyId: "s1",
      title: "Poucos concorrentes exploram comparativos práticos",
      rationale:
        "Nenhum dos 3 concorrentes publica tabelas comparando procedimentos lado a lado.",
      impact: "alto",
      effort: "médio",
      suggestedAs: "topic",
      suggestedValue: "Clareamento caseiro vs. consultório: comparativo completo",
    },
    {
      id: "o2",
      strategyId: "s1",
      title: "LinkedIn tem alta frequência, mas baixa profundidade técnica",
      rationale:
        "Posts médios com 180 palavras; há espaço para artigos autorais com 1.000+.",
      impact: "médio",
      effort: "alto",
      suggestedAs: "angle",
      suggestedValue: "Casos clínicos narrados em primeira pessoa",
    },
    {
      id: "o3",
      strategyId: "s1",
      title: "SEO concentra termos amplos; falta clusters long-tail",
      rationale:
        "Concorrentes disputam 'implante dentário'. Termos como 'quanto custa canal em 2026' estão abertos.",
      impact: "alto",
      effort: "baixo",
      suggestedAs: "keyword",
      suggestedValue: "quanto custa canal em 2026",
    },
    {
      id: "o4",
      strategyId: "s1",
      title: "YouTube aparece subutilizado no nicho",
      rationale:
        "Apenas 1 dos 3 concorrentes mantém canal ativo; vídeos de 60 segundos têm demanda.",
      impact: "médio",
      effort: "médio",
      suggestedAs: "angle",
      suggestedValue: "Série de vídeos curtos respondendo dúvidas comuns",
    },
  ],
  savedInsights: [],
  runs: [
    {
      id: "r1",
      strategyId: "s1",
      runAt: "2026-04-18",
      niche: "Odontologia estética",
      region: "São Paulo — SP",
      depth: "padrão",
      period: 90,
      channels: ["Blog", "Instagram", "SEO", "LinkedIn"],
      status: "completed",
    },
  ],
}

const listeners = new Set<() => void>()
function emit() {
  listeners.forEach((l) => l())
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
function getSnapshot() {
  return state
}

export function useCompetitorsStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getCompetitorsFor(strategyId: string) {
  return state.competitors.filter((c) => c.strategyId === strategyId)
}
export function getOpportunitiesFor(strategyId: string) {
  return state.opportunities.filter((o) => o.strategyId === strategyId)
}
export function getInsightsFor(strategyId: string) {
  return state.savedInsights.filter((i) => i.strategyId === strategyId)
}
export function getLatestRun(strategyId: string) {
  return state.runs
    .filter((r) => r.strategyId === strategyId)
    .sort((a, b) => (a.runAt < b.runAt ? 1 : -1))[0]
}

export function saveInsight(insight: Omit<SavedInsight, "id" | "addedAt">) {
  // idempotente pela combinação source+kind
  const exists = state.savedInsights.find(
    (i) =>
      i.sourceId === insight.sourceId &&
      i.kind === insight.kind &&
      i.strategyId === insight.strategyId,
  )
  if (exists) return exists
  const created: SavedInsight = {
    ...insight,
    id: `ins-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    addedAt: new Date().toISOString(),
  }
  state.savedInsights = [created, ...state.savedInsights]
  emit()
  return created
}

export function removeInsight(id: string) {
  state.savedInsights = state.savedInsights.filter((i) => i.id !== id)
  emit()
}

export function recordRun(run: Omit<AnalysisRun, "id">) {
  const created: AnalysisRun = {
    ...run,
    id: `r-${Date.now()}`,
  }
  state.runs = [created, ...state.runs]
  emit()
  return created
}

export function buildComparison(strategyId: string): ComparisonRow[] {
  return getCompetitorsFor(strategyId).map((c) => ({
    competitorId: c.id,
    competitor: c.name,
    dominantChannel: c.dominantChannel,
    recurringTheme: c.recurringThemes[0] ?? "—",
    frequency: c.frequency,
    strength:
      c.presenceScore >= 75 ? "forte" : c.presenceScore >= 55 ? "média" : "fraca",
    gap: c.gap,
  }))
}
