"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Bot, Lightbulb, RotateCcw, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Strategy } from "@/lib/strategies"

type Message = {
  id: string
  role: "assistant" | "user"
  content: string
}

type StrategyAssistantProps = {
  strategy: Strategy
}

const QUICK_PROMPTS = [
  {
    label: "Sugerir novos tópicos",
    prompt:
      "Com base nas palavras-chave aprovadas, sugira 5 novos tópicos de artigo para esta estratégia.",
  },
  {
    label: "Analisar minhas keywords",
    prompt: "Analise as palavras-chave atuais e aponte oportunidades e lacunas.",
  },
  {
    label: "Revisar tom de voz",
    prompt: "Revisite o tom de voz desta estratégia e sugira ajustes.",
  },
  {
    label: "Pauta das próximas 2 semanas",
    prompt: "Monte uma pauta com 4 artigos para as próximas duas semanas.",
  },
]

export function StrategyAssistant({ strategy }: StrategyAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "assistant",
      content: `Oi! Sou o assistente desta estratégia. Estou olhando para "${strategy.name}" — objetivo de ${strategy.goal.toLowerCase()}, com tom ${strategy.tone.toLowerCase()}. Como posso ajudar?`,
    },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, sending])

  const send = async (content: string) => {
    if (!content.trim() || sending) return
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)

    await new Promise((r) => setTimeout(r, 900))

    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content:
        "Boa ideia. Posso preparar isso levando em conta o público " +
        strategy.audience.toLowerCase() +
        ". Quer que eu envie os tópicos resultantes direto para a fila de produção ou prefere revisar antes?",
    }
    setMessages((prev) => [...prev, assistantMsg])
    setSending(false)
  }

  const reset = () => {
    setMessages([
      {
        id: "m1",
        role: "assistant",
        content: `Conversa reiniciada. Em que posso ajudar com "${strategy.name}"?`,
      },
    ])
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex h-[620px] flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Assistente da estratégia
              </p>
              <p className="text-xs text-muted-foreground">
                Contexto: {strategy.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={reset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nova conversa
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex items-start gap-3">
                <Avatar role="assistant" />
                <div className="mt-2 flex gap-1">
                  <Dot />
                  <Dot delay="150ms" />
                  <Dot delay="300ms" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="border-t border-border px-5 py-3">
            <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => send(p.prompt)}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Lightbulb className="h-3 w-3" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-border px-5 py-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 focus-within:border-primary/50">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                placeholder="Pergunte algo sobre esta estratégia…"
                rows={1}
                className="min-h-0 resize-none border-0 bg-transparent p-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                disabled={!input.trim() || sending}
                onClick={() => send(input)}
                aria-label="Enviar"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              As respostas levam em conta palavras-chave, tópicos e tom desta estratégia.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MessageBubble({
  role,
  content,
}: {
  role: Message["role"]
  content: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        role === "user" && "flex-row-reverse",
      )}
    >
      <Avatar role={role} />
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {content}
      </div>
    </div>
  )
}

function Avatar({ role }: { role: Message["role"] }) {
  if (role === "user") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <User className="h-4 w-4" />
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Bot className="h-4 w-4" />
    </div>
  )
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
    />
  )
}
