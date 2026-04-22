import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/auth-context"
import {
  getStrategyForTenant,
  listKeywordCandidatesForTenant,
  listTopicCandidatesForTenant,
} from "@/lib/automation-data"

export const runtime = "nodejs"

type StepId =
  | "goal"
  | "context"
  | "audience"
  | "type"
  | "tone"
  | "cadence"
  | "operation_mode"

type StepPayload = {
  id: StepId
  title: string
  question: string
}

type RequestBody = {
  strategyId?: string
  step?: StepPayload
  answers?: Record<string, unknown>
  userMessage?: string
}

type AiPayload = {
  message: string
  suggestions: string[]
}

const FALLBACKS: Record<StepId, string[]> = {
  goal: [
    "Aumentar tráfego orgânico qualificado",
    "Gerar leads mais preparados para compra",
    "Construir autoridade no nicho",
  ],
  context: [
    "Conteúdo educativo com foco nos serviços mais rentáveis e nas dúvidas frequentes dos clientes.",
    "Estratégia focada em diferenciais, prova de confiança e comparação com alternativas do mercado.",
    "Plano editorial para atrair pessoas em pesquisa inicial e conduzir até contato comercial.",
  ],
  audience: [
    "Pessoas pesquisando soluções antes de contratar",
    "Clientes locais com intenção clara de compra",
    "Decisores que precisam comparar opções e reduzir risco",
  ],
  type: ["SEO", "Local", "Blog", "Conversão"],
  tone: [
    "Profissional e educativo",
    "Acolhedor e próximo",
    "Técnico e direto",
    "Persuasivo e comercial",
  ],
  cadence: ["4 artigos/mês", "8 artigos/mês", "12 artigos/mês", "20 artigos/mês"],
  operation_mode: ["Manual", "Assistido", "Piloto Automático"],
}

function buildContext(strategy: any, keywords: any[], topics: any[]) {
  const kwList =
    keywords
      .filter((k: any) => k.status === "approved")
      .slice(0, 12)
      .map((k: any) => `- ${k.keyword} (${k.journey_stage || "sem etapa"}, vol: ${k.search_volume || "?"})`)
      .join("\n") || "Nenhuma keyword aprovada ainda."

  const topicList =
    topics
      .slice(0, 10)
      .map((t: any) => `- [${t.status}] ${t.topic}`)
      .join("\n") || "Nenhum tópico gerado ainda."

  return `Estratégia:
- Nome: ${strategy.name}
- Objetivo atual: ${strategy.goal || "não definido"}
- Contexto atual: ${strategy.description || strategy.focus || "não definido"}
- Público atual: ${strategy.audience || "não definido"}
- Tom atual: ${strategy.tone || "não definido"}
- Tipo atual: ${strategy.strategy_type || "seo"}
- Cadência atual: ${strategy.cadence || 8} artigos/mês
- Modo atual: ${strategy.operation_mode || "manual"}

Keywords aprovadas:
${kwList}

Tópicos:
${topicList}`
}

function normalizeSuggestions(stepId: StepId, suggestions: unknown) {
  if (!Array.isArray(suggestions)) return FALLBACKS[stepId]

  const cleaned = suggestions
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)

  return cleaned.length > 0 ? cleaned : FALLBACKS[stepId]
}

function fallbackResponse(step: StepPayload, userMessage?: string): AiPayload {
  const intro = userMessage
    ? `Boa pergunta. Para esta etapa, responda de forma objetiva para preencher "${step.title}".`
    : `Vamos preencher "${step.title}". Escolha uma sugestão ou escreva sua própria resposta.`

  return {
    message: `${intro}\n\n${step.question}`,
    suggestions: FALLBACKS[step.id],
  }
}

async function askOpenAI({
  apiKey,
  context,
  step,
  answers,
  userMessage,
}: {
  apiKey: string
  context: string
  step: StepPayload
  answers: Record<string, unknown>
  userMessage?: string
}): Promise<AiPayload> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Você é um estrategista de conteúdo brasileiro dentro de um roteiro fechado. Retorne apenas JSON válido com as chaves message e suggestions. message deve ter no máximo 450 caracteres. suggestions deve ter de 3 a 5 strings clicáveis. Não avance etapa, não salve dados e não peça informações fora da etapa atual.",
        },
        {
          role: "user",
          content: JSON.stringify({
            context,
            currentStep: step,
            collectedAnswers: answers,
            userMessage: userMessage || null,
          }),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content
  const parsed = JSON.parse(raw || "{}")

  return {
    message:
      typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : fallbackResponse(step, userMessage).message,
    suggestions: normalizeSuggestions(step.id, parsed.suggestions),
  }
}

export async function POST(req: Request) {
  try {
    const { tenant } = await getAuthContext()
    if (!tenant) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = (await req.json()) as RequestBody
    if (!body.strategyId || !body.step?.id || !body.step.title || !body.step.question) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const [strategy, keywords, topics] = await Promise.all([
      getStrategyForTenant(tenant.id, body.strategyId),
      listKeywordCandidatesForTenant(tenant.id, body.strategyId),
      listTopicCandidatesForTenant(tenant.id),
    ])

    if (!strategy) {
      return NextResponse.json({ error: "Estratégia não encontrada" }, { status: 404 })
    }

    const filteredTopics = topics.filter((t: any) => t.strategy_id === body.strategyId)
    const context = buildContext(strategy, keywords, filteredTopics)
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(fallbackResponse(body.step, body.userMessage))
    }

    const result = await askOpenAI({
      apiKey,
      context,
      step: body.step,
      answers: body.answers || {},
      userMessage: body.userMessage,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Strategy chat error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
