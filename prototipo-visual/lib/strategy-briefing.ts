"use client"

import { useSyncExternalStore } from "react"

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------

export type KpiMetric = "trafego" | "leads" | "agendamentos"
export type AvgLength = "curto" | "medio" | "longo"
export type Frequency = "diaria" | "semanal" | "quinzenal" | "mensal"
export type Person = "primeira-plural" | "primeira-singular" | "terceira"

export type BriefingSuggestion = {
  id: string
  section: SectionKey
  fromValue?: string
  toValue: string
  summary: string
  at: string
}

export type BriefingHistoryEntry = {
  id: string
  section: SectionKey
  by: "user" | "chat"
  at: string
  summary: string
}

export type Briefing = {
  // Identidade
  name?: string
  description?: string
  // Audiência
  audience?: string
  persona?: string
  painPoints?: string[]
  avoid?: string[]
  jargon?: string[]
  // Objetivo
  goal?: string
  kpi?: KpiMetric
  kpiTarget?: string
  kpiDeadline?: string
  // Voz & estilo
  tone?: string
  person?: Person
  formality?: number // 1..5
  avgLength?: AvgLength
  dos?: string[]
  donts?: string[]
  // Diferenciais & provas
  usps?: string[]
  proofs?: string[]
  // CTA
  ctaText?: string
  ctaLink?: string
  // Cadência
  frequency?: Frequency
  preferredDays?: string[]
  channels?: string[]
}

export type SectionKey =
  | "identidade"
  | "audiencia"
  | "objetivo"
  | "voz"
  | "diferenciais"
  | "cta"
  | "limites"
  | "cadencia"

export const SECTION_LABEL: Record<SectionKey, string> = {
  identidade: "Identidade",
  audiencia: "Audiência",
  objetivo: "Objetivo",
  voz: "Voz & estilo",
  diferenciais: "Diferenciais & provas",
  cta: "CTA padrão",
  limites: "Limites",
  cadencia: "Cadência & canais",
}

// -----------------------------------------------------------------------------
// Campos usados no cálculo de preenchimento por seção
// -----------------------------------------------------------------------------

const SECTION_FIELDS: Record<SectionKey, (keyof Briefing)[]> = {
  identidade: ["name", "description"],
  audiencia: ["audience", "persona", "painPoints"],
  objetivo: ["goal", "kpi", "kpiTarget"],
  voz: ["tone", "person", "formality", "avgLength"],
  diferenciais: ["usps", "proofs"],
  cta: ["ctaText", "ctaLink"],
  limites: ["avoid", "donts"],
  cadencia: ["frequency", "preferredDays"],
}

function isFilled(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === "string") return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === "number") return true
  return true
}

export function sectionCompleteness(b: Briefing, key: SectionKey) {
  const fields = SECTION_FIELDS[key]
  const filled = fields.filter((f) => isFilled(b[f])).length
  return { filled, total: fields.length, pct: Math.round((filled / fields.length) * 100) }
}

export function overallCompleteness(b: Briefing) {
  const all = (Object.keys(SECTION_FIELDS) as SectionKey[]).map((k) => sectionCompleteness(b, k))
  const total = all.reduce((acc, s) => acc + s.total, 0)
  const filled = all.reduce((acc, s) => acc + s.filled, 0)
  return Math.round((filled / total) * 100)
}

// -----------------------------------------------------------------------------
// Seeds por estratégia (s1 vem com sugestões pendentes do chat)
// -----------------------------------------------------------------------------

type State = {
  briefings: Record<string, Briefing>
  suggestions: Record<string, BriefingSuggestion[]>
  history: Record<string, BriefingHistoryEntry[]>
}

const INITIAL: State = {
  briefings: {
    s1: {
      name: "Estratégia SEO Blog",
      description:
        "Conteúdo educativo focado em ranquear no Google para termos informacionais do segmento.",
      audience: "Adultos 25-55 interessados em saúde bucal",
      persona: "Camila, 38, mora em SP, tem filhos e prioriza clínicas próximas que aceitam convênio.",
      painPoints: ["Medo de dor", "Dúvida sobre preço", "Dificuldade de agendar"],
      avoid: ["Promessas milagrosas", "Comparações negativas com concorrentes"],
      jargon: ["clareamento", "canal", "resina"],
      goal: "Aumentar tráfego orgânico qualificado em 3x",
      kpi: "trafego",
      kpiTarget: "30k sessões/mês",
      kpiDeadline: "2026-09-30",
      tone: "Profissional e educativo",
      person: "primeira-plural",
      formality: 4,
      avgLength: "medio",
      dos: ["Usar dados e fontes", "Fechar com chamada para ação clara"],
      donts: ["Jargão técnico sem explicar", "Afirmações sem evidência"],
      usps: [
        "Atendimento no mesmo dia",
        "Odontólogos especialistas em cada área",
        "Aceita mais de 20 convênios",
      ],
      proofs: ["4.9 estrelas no Google (1.2k avaliações)", "+10 anos em Moema"],
      ctaText: "Agendar avaliação gratuita",
      ctaLink: "https://exemplo.com/agendar",
      frequency: "semanal",
      preferredDays: ["terça", "quinta"],
      channels: ["Blog", "Newsletter"],
    },
    s2: {
      name: "Estratégia Local",
      description:
        "Artigos otimizados para SEO local e Google Maps, focados em clientes na região.",
      audience: "Moradores da zona sul de São Paulo",
      persona: "Rodrigo, 42, mora em Moema e procura um dentista de confiança perto de casa.",
      painPoints: ["Distância", "Fila longa", "Falta de horários à noite"],
      goal: "Dominar buscas locais e aumentar agendamentos",
      kpi: "agendamentos",
      kpiTarget: "120/mês",
      tone: "Acolhedor e próximo",
      person: "primeira-plural",
      formality: 3,
      avgLength: "curto",
      usps: ["Localização em Moema", "Horário estendido"],
      ctaText: "Agendar consulta agora",
      frequency: "quinzenal",
      channels: ["Blog"],
    },
    s3: {
      name: "Estratégia de Conversão",
      description:
        "Conteúdo persuasivo com CTAs diretos para gerar leads e agendamentos qualificados.",
      audience: "Pessoas com intenção alta (fundo de funil)",
      goal: "Converter leitores em leads qualificados",
      kpi: "leads",
      tone: "Persuasivo e direto",
      person: "primeira-plural",
      formality: 3,
      avgLength: "medio",
      ctaText: "Falar no WhatsApp",
      frequency: "semanal",
    },
  },
  suggestions: {
    s1: [
      {
        id: "sg-s1-1",
        section: "audiencia",
        fromValue: "Medo de dor, Dúvida sobre preço, Dificuldade de agendar",
        toValue:
          "Medo de dor, Dúvida sobre preço, Dificuldade de agendar, Medo de anestesia",
        summary: "Adicionar \"Medo de anestesia\" às dores da audiência",
        at: "há 2 dias",
      },
      {
        id: "sg-s1-2",
        section: "voz",
        fromValue: "Formalidade 4",
        toValue: "Formalidade 3",
        summary: "Reduzir formalidade de 4 para 3 em artigos de consciência",
        at: "há 2 dias",
      },
    ],
  },
  history: {
    s1: [
      {
        id: "h-s1-1",
        section: "voz",
        by: "user",
        at: "há 5 min",
        summary: "Você ajustou \"Tamanho médio\" para \"Médio\"",
      },
      {
        id: "h-s1-2",
        section: "objetivo",
        by: "chat",
        at: "há 2 dias",
        summary: "Chat definiu meta de 30k sessões/mês",
      },
    ],
  },
}

// -----------------------------------------------------------------------------
// Store (useSyncExternalStore pattern, mesmo de workspace-store/competitors-store)
// -----------------------------------------------------------------------------

let state: State = INITIAL
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function getSnapshot() {
  return state
}

export function useBriefingStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

// -----------------------------------------------------------------------------
// Seletores
// -----------------------------------------------------------------------------

export function getBriefing(strategyId: string): Briefing {
  return state.briefings[strategyId] ?? {}
}

export function getPendingSuggestions(strategyId: string): BriefingSuggestion[] {
  return state.suggestions[strategyId] ?? []
}

export function getHistory(strategyId: string): BriefingHistoryEntry[] {
  return state.history[strategyId] ?? []
}

export function getSuggestionsForSection(
  strategyId: string,
  section: SectionKey,
): BriefingSuggestion[] {
  return (state.suggestions[strategyId] ?? []).filter((s) => s.section === section)
}

// -----------------------------------------------------------------------------
// Ações
// -----------------------------------------------------------------------------

function pushHistory(strategyId: string, entry: BriefingHistoryEntry) {
  const cur = state.history[strategyId] ?? []
  state = {
    ...state,
    history: { ...state.history, [strategyId]: [entry, ...cur].slice(0, 20) },
  }
}

export function updateBriefing(
  strategyId: string,
  patch: Partial<Briefing>,
  meta: { section: SectionKey; by?: "user" | "chat"; summary?: string },
) {
  const current = state.briefings[strategyId] ?? {}
  const next = { ...current, ...patch }
  state = {
    ...state,
    briefings: { ...state.briefings, [strategyId]: next },
  }
  pushHistory(strategyId, {
    id: `h-${strategyId}-${Date.now()}`,
    section: meta.section,
    by: meta.by ?? "user",
    at: "agora",
    summary: meta.summary ?? `${SECTION_LABEL[meta.section]} atualizada`,
  })
  emit()
}

export function acceptSuggestion(strategyId: string, suggestionId: string) {
  const list = state.suggestions[strategyId] ?? []
  const sug = list.find((s) => s.id === suggestionId)
  if (!sug) return
  // remove a sugestão
  state = {
    ...state,
    suggestions: {
      ...state.suggestions,
      [strategyId]: list.filter((s) => s.id !== suggestionId),
    },
  }
  pushHistory(strategyId, {
    id: `h-${strategyId}-${Date.now()}`,
    section: sug.section,
    by: "chat",
    at: "agora",
    summary: `Você aceitou sugestão: ${sug.summary}`,
  })
  emit()
}

export function dismissSuggestion(strategyId: string, suggestionId: string) {
  const list = state.suggestions[strategyId] ?? []
  state = {
    ...state,
    suggestions: {
      ...state.suggestions,
      [strategyId]: list.filter((s) => s.id !== suggestionId),
    },
  }
  emit()
}
