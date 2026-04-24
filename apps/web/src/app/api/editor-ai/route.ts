import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/auth-context"

export const maxDuration = 30
export const runtime = "nodejs"

type EditorAiAction = "expand" | "rewrite" | "suggest-meta" | "continue"

type RequestBody = {
  action: EditorAiAction
  content: string
  context?: string
}

const SYSTEM_PROMPTS: Record<EditorAiAction, string> = {
  expand:
    "Você é um redator especialista em conteúdo SEO em português brasileiro. Expanda o texto recebido, mantendo o tom original e adicionando detalhes relevantes, exemplos e informações úteis. Retorne APENAS o texto expandido, sem introduções ou explicações extras.",
  rewrite:
    "Você é um revisor editorial de conteúdo em português brasileiro. Reescreva o texto para ser mais claro, envolvente e bem estruturado, mantendo todas as informações originais. Retorne APENAS o texto reescrito, sem introduções ou explicações.",
  "suggest-meta":
    "Você é um especialista em SEO. Analise o artigo fornecido e retorne APENAS um JSON válido com dois campos: 'title' (título SEO otimizado, máximo 70 caracteres, em português) e 'metaDescription' (meta description atrativa, máximo 160 caracteres, em português). Sem texto extra fora do JSON.",
  continue:
    "Você é um redator de conteúdo em português brasileiro. Com base na instrução fornecida, escreva um parágrafo ou seção de conteúdo coerente e útil. Retorne APENAS o conteúdo gerado, sem introduções ou explicações.",
}

async function callOpenAi(
  systemPrompt: string,
  userContent: string,
  options: { jsonMode?: boolean; temperature?: number } = {},
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada.")

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: options.temperature ?? 0.7,
      ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  })

  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error?.message ?? "OpenAI request failed.")

  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error("OpenAI returned empty response.")
  return content
}

export async function POST(req: Request) {
  try {
    const { tenant } = await getAuthContext()
    if (!tenant) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const body: RequestBody = await req.json()
    const { action, content, context } = body

    if (!action || !content?.trim()) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 })
    }

    const validActions: EditorAiAction[] = ["expand", "rewrite", "suggest-meta", "continue"]
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 })
    }

    const systemPrompt = SYSTEM_PROMPTS[action]
    const userContent = context ? `${context}\n\n${content}` : content

    if (action === "suggest-meta") {
      const raw = await callOpenAi(systemPrompt, userContent, { jsonMode: true, temperature: 0.3 })
      const parsed = JSON.parse(raw) as { title?: string; metaDescription?: string }
      return NextResponse.json({
        title: parsed.title ?? "",
        metaDescription: parsed.metaDescription ?? "",
      })
    }

    const text = await callOpenAi(systemPrompt, userContent)
    return NextResponse.json({ text })
  } catch (error) {
    console.error("[editor-ai]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno." },
      { status: 500 },
    )
  }
}
