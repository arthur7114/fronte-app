/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles, Send, User, Loader2 } from "lucide-react"
import { ReferenceUpload } from "@/components/onboarding/reference-upload"
import { cn } from "@/lib/utils"
import { saveBriefingAnswers } from "@/lib/onboarding-server"

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
    question: "Que tipo de negócio você tem?",
    options: [
      "Clínica ou consultório",
      "Restaurante ou alimentação",
      "Loja física ou e-commerce",
      "Agência ou consultoria",
      "Serviços locais (ex: encanador, eletricista)",
      "Outro",
    ],
    placeholder: "Escreva ou escolha uma opção acima",
    hint: "Isso me ajuda a entender seu mercado e o tipo de conteúdo que vai funcionar melhor para você.",
  },
  {
    key: "services",
    question: "Quais são seus principais serviços ou produtos?",
    placeholder: "Ex: consultas de nutrição, dietas personalizadas, acompanhamento mensal...",
    hint: "Liste os 2 ou 3 principais. Não precisa ser perfeito!",
  },
  {
    key: "location",
    question: "Onde você atende? Sua presença é local, regional ou online?",
    options: [
      "Apenas local (cidade ou bairro específico)",
      "Regional (estado ou região)",
      "Nacional",
      "Online / todo o Brasil",
    ],
    placeholder: "Escreva sua cidade ou região, ou escolha uma opção",
    hint: "Isso define se vamos focar em SEO local (aparecer no Google Maps) ou SEO mais amplo.",
  },
  {
    key: "audience",
    question: "Quem é o seu cliente ideal? Descreva em poucas palavras.",
    placeholder: "Ex: mulheres de 30 a 50 anos que querem perder peso sem sofrimento",
    hint: "Quanto mais específico, melhor o conteúdo que a IA vai gerar para atrair essas pessoas.",
  },
  {
    key: "differentiator",
    question: "O que te diferencia dos concorrentes? Por que as pessoas escolhem você?",
    placeholder: "Ex: atendimento humanizado, método próprio, preço justo, rapidez...",
    hint: "Vamos usar isso para criar conteúdo que destaque suas vantagens reais.",
  },
  {
    key: "goal",
    question: "Qual é seu principal objetivo com o conteúdo?",
    options: [
      "Aparecer no Google e ser encontrado",
      "Gerar mais leads e contatos",
      "Construir autoridade no meu nicho",
      "Vender mais produtos ou serviços",
    ],
    placeholder: "Escreva ou escolha uma opção acima",
    hint: "Isso define a estratégia de conteúdo que vamos montar para você.",
  },
]

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: "ai",
  content: "Olá! Sou a assistente de estratégia do ContentAI. Vou te fazer algumas perguntas rápidas para entender o seu negócio e montar um plano de conteúdo personalizado baseado nos seus documentos de referência. São apenas 6 perguntas e leva menos de 3 minutos. Vamos lá?",
}

export default function EstrategiaOnboardingPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(-1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [showUpload, setShowUpload] = useState(true)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addMessage = (role: "ai" | "user", content: string, options?: string[]) => {
    const newMessage: Message = {
      id: messages.length,
      role,
      content,
      options,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleOptionClick = (option: string) => {
    setInput(option)
    handleSubmit(new Event("submit") as any, option)
  }

  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault()
    if (!input.trim() && !overrideInput) return

    const userInput = overrideInput || input
    setInput("")

    // Add user message
    addMessage("user", userInput)

    if (currentStep === -1) {
      // Start briefing
      setCurrentStep(0)
      setShowUpload(false)
      setIsTyping(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsTyping(false)
      addMessage("ai", STEPS[0].question, STEPS[0].options)
    } else if (currentStep < STEPS.length) {
      // Store answer
      const currentStepKey = STEPS[currentStep].key
      setAnswers((prev) => ({
        ...prev,
        [currentStepKey]: userInput,
      }))

      if (currentStep < STEPS.length - 1) {
        // Next question
        setIsTyping(true)
        await new Promise((resolve) => setTimeout(resolve, 500))
        setIsTyping(false)
        const nextStep = currentStep + 1
        setCurrentStep(nextStep)
        addMessage("ai", STEPS[nextStep].question, STEPS[nextStep].options)
      } else {
        // Briefing complete
        setIsTyping(true)
        await new Promise((resolve) => setTimeout(resolve, 500))
        setIsTyping(false)
        setIsComplete(true)
        addMessage("ai", "Perfeito! Recebi todas as informações. Vou revisar seus documentos e montar uma estratégia personalizada. Clique em 'Ver Resumo' para continuar.")
      }
    }

    inputRef.current?.focus()
  }

  const handleContinue = async () => {
    setIsSaving(true)
    try {
      // Persist to database
      await saveBriefingAnswers(answers)
      // Keep sessionStorage as fallback for the resumo page to read
      sessionStorage.setItem("onboarding_briefing", JSON.stringify({
        answers,
        uploadedFiles: uploadedFiles.map(f => f.name),
      }))
      router.push("/onboarding/resumo")
    } catch {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Briefing com IA</h1>
              <p className="text-sm text-muted-foreground">Passo 4 de 6 do onboarding</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStep >= 0 ? `Pergunta ${currentStep + 1} de ${STEPS.length}` : "Começando..."}
            </div>
          </div>
        </div>
      </div>

      {/* Chat or Upload Area */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          {/* Upload Section */}
          {showUpload && (
            <div className="space-y-6 mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Suba seus conteúdos de referência
                </h2>
                <p className="text-muted-foreground">
                  Você pode compartilhar artigos, páginas ou documentos que refletem seu estilo e tom. A IA usará como base para criar sua estratégia.
                </p>
              </div>
              <ReferenceUpload onFilesChange={setUploadedFiles} />
              <Button
                onClick={() => setShowUpload(false)}
                className="w-full h-12 font-medium text-base"
              >
                {uploadedFiles.length > 0 ? "Continuar com documentos" : "Continuar sem documentos"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Chat Messages */}
          {!showUpload && (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "ai" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-sm rounded-lg p-4",
                      msg.role === "ai"
                        ? "bg-card border border-border text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.options && msg.options.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.options.map((option, i) => (
                          <button
                            key={i}
                            onClick={() => handleOptionClick(option)}
                            disabled={isTyping}
                            className="block w-full text-left rounded-lg bg-border/40 hover:bg-border/60 disabled:opacity-50 p-2 text-xs font-medium transition-colors text-foreground"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="rounded-lg bg-card border border-border p-4 flex gap-2">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {!showUpload && (
        <div className="border-t border-border bg-card sticky bottom-0">
          <div className="container mx-auto px-6 py-4 max-w-2xl">
            {isComplete ? (
              <Button
                onClick={handleContinue}
                size="lg"
                disabled={isSaving}
                className="w-full h-12 font-medium text-base"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Ver Resumo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={STEPS[currentStep]?.placeholder || "Digite sua resposta..."}
                  disabled={isTyping}
                  autoFocus
                  className="h-12"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="h-12 w-12"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
