"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles, Send, User, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id: number
  role: "ai" | "user"
  content: string
  options?: string[]
}

type BriefingStep = {
  key: string
  question: string
  options?: string[]
  placeholder: string
  hint?: string
}

const STEPS: BriefingStep[] = [
  {
    key: "segment",
    question: "Que tipo de negocio voce tem?",
    options: [
      "Clinica ou consultorio",
      "Restaurante ou alimentacao",
      "Loja fisica ou e-commerce",
      "Agencia ou consultoria",
      "Servicos locais (ex: encanador, eletricista)",
      "Outro",
    ],
    placeholder: "Escreva ou escolha uma opcao acima",
    hint: "Isso me ajuda a entender seu mercado e o tipo de conteudo que vai funcionar melhor para voce.",
  },
  {
    key: "services",
    question: "Quais sao seus principais servicos ou produtos?",
    placeholder: "Ex: consultas de nutricao, dietas personalizadas, acompanhamento mensal...",
    hint: "Liste os 2 ou 3 principais. Nao precisa ser perfeito!",
  },
  {
    key: "location",
    question: "Onde voce atende? Sua presenca e local, regional ou online?",
    options: [
      "Apenas local (cidade ou bairro especifico)",
      "Regional (estado ou regiao)",
      "Nacional",
      "Online / todo o Brasil",
    ],
    placeholder: "Escreva sua cidade ou regiao, ou escolha uma opcao",
    hint: "Isso define se vamos focar em SEO local (aparecer no Google Maps) ou SEO mais amplo.",
  },
  {
    key: "audience",
    question: "Quem e o seu cliente ideal? Descreva em poucas palavras.",
    placeholder: "Ex: mulheres de 30 a 50 anos que querem perder peso sem sofrimento",
    hint: "Quanto mais especifico, melhor o conteudo que a IA vai gerar para atrair essas pessoas.",
  },
  {
    key: "differentiator",
    question: "O que te diferencia dos concorrentes? Por que as pessoas escolhem voce?",
    placeholder: "Ex: atendimento humanizado, metodo proprio, preco justo, rapidez...",
    hint: "Vamos usar isso para criar conteudo que destaque suas vantagens reais.",
  },
  {
    key: "goal",
    question: "Qual e seu principal objetivo com o conteudo?",
    options: [
      "Aparecer no Google e ser encontrado",
      "Gerar mais leads e contatos",
      "Construir autoridade no meu nicho",
      "Vender mais produtos ou servicos",
    ],
    placeholder: "Escreva ou escolha uma opcao acima",
    hint: "Isso define a estrategia de conteudo que vamos montar para voce.",
  },
]

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: "ai",
  content: "Ola! Sou a assistente de estrategia do ContentAI. Vou te fazer algumas perguntas rapidas para entender o seu negocio e montar um plano de conteudo personalizado. Sao apenas 6 perguntas e leva menos de 3 minutos. Vamos la?",
}

export default function BriefingPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(-1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [started, setStarted] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const addAIMessage = (content: string, options?: string[], delay = 800) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "ai", content, options },
      ])
      setTimeout(() => inputRef.current?.focus(), 100)
    }, delay)
  }

  const handleStart = () => {
    setStarted(true)
    const firstStep = STEPS[0]
    setCurrentStep(0)
    addAIMessage(firstStep.question, firstStep.options, 600)
  }

  const handleAnswer = (answer: string) => {
    if (!answer.trim() || currentStep < 0) return

    const step = STEPS[currentStep]
    const newAnswers = { ...answers, [step.key]: answer }
    setAnswers(newAnswers)

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: answer },
    ])
    setInput("")

    const nextStep = currentStep + 1

    if (nextStep < STEPS.length) {
      setCurrentStep(nextStep)
      const next = STEPS[nextStep]
      addAIMessage(next.question, next.options)
    } else {
      setCurrentStep(-1)
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "ai",
            content: "Perfeito! Agora eu tenho tudo que preciso para montar sua estrategia de conteudo personalizada. Vou gerar seu plano inicial com palavras-chave, topicos e um calendario de publicacao. Isso vai aparecer no seu painel assim que voce acessar o dashboard.",
          },
        ])
        setIsComplete(true)
      }, 1200)
    }
  }

  const handleSend = () => {
    if (input.trim()) handleAnswer(input.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFinish = async () => {
    setIsRedirecting(true)
    sessionStorage.setItem("onboarding_briefing", JSON.stringify(answers))
    await new Promise((r) => setTimeout(r, 1200))
    router.push("/dashboard")
  }

  const progress = currentStep >= 0 ? ((currentStep) / STEPS.length) * 100 : isComplete ? 100 : 0

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          {[
            { label: "Criar conta", done: true },
            { label: "Workspace", done: true },
            { label: "Site", done: true },
            { label: "Briefing", done: false, active: true },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <div className={cn("h-px w-8", s.done || s.active ? "bg-primary" : "bg-border")} />
              )}
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  s.done
                    ? "bg-primary/20 text-primary"
                    : s.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s.done ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={cn(s.active ? "text-foreground font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {started && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Briefing do negocio</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat window */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col min-h-[520px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3 items-start", msg.role === "user" && "flex-row-reverse")}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "shrink-0 flex h-8 w-8 items-center justify-center rounded-full",
                  msg.role === "ai"
                    ? "bg-primary/10"
                    : "bg-muted"
                )}
              >
                {msg.role === "ai" ? (
                  <Sparkles className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div className={cn("flex flex-col gap-2 max-w-[85%]", msg.role === "user" && "items-end")}>
                {/* Bubble */}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "ai"
                      ? "bg-muted text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  )}
                >
                  {msg.content}
                </div>

                {/* Options */}
                {msg.options && msg.role === "ai" && !isComplete && currentStep >= 0 && STEPS[currentStep]?.options === msg.options && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted">
                <div className="flex gap-1 items-center h-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Input area */}
        <div className="p-4">
          {!started ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full h-12 font-medium text-base"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Comecar o briefing
              </span>
            </Button>
          ) : isComplete ? (
            <Button
              onClick={handleFinish}
              size="lg"
              className="w-full h-12 font-medium text-base"
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Gerando sua estrategia...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Ver meu dashboard
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentStep >= 0 ? STEPS[currentStep]?.placeholder : "Escreva sua resposta..."}
                className="h-11 text-sm"
                disabled={isTyping || currentStep < 0}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="h-11 w-11 shrink-0"
                disabled={!input.trim() || isTyping || currentStep < 0}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Hint */}
          {started && !isComplete && currentStep >= 0 && STEPS[currentStep]?.hint && (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {STEPS[currentStep].hint}
            </p>
          )}
        </div>
      </div>

      {/* Skip */}
      {!isComplete && started && (
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular por agora e configurar depois
          </button>
        </div>
      )}
    </div>
  )
}
