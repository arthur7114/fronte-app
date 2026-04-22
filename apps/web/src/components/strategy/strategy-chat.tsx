/* eslint-disable react-hooks/purity */
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Send } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "assistant" | "user"
  content: string
  options?: string[]
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Olá! Sou a IA do ContentAI e vou ajudar a criar uma estratégia de conteúdo perfeita para seu negócio. Vamos começar com algumas perguntas simples. Qual é o seu segmento de atuação?",
    options: [
      "Saúde e Bem-estar",
      "Serviços Profissionais",
      "Comércio Local",
      "Tecnologia",
      "Educação",
      "Outro",
    ],
  },
]

const followUpMessages: Record<string, Message> = {
  "Saúde e Bem-estar": {
    id: "2",
    role: "assistant",
    content: "Ótima escolha! O setor de saúde tem muito potencial de crescimento orgânico. Pode me contar mais especificamente qual é o seu negócio?",
    options: [
      "Clínica Odontológica",
      "Clínica Médica",
      "Academia / Personal",
      "Nutricionista",
      "Psicólogo / Terapeuta",
      "Outro",
    ],
  },
  "Clínica Odontológica": {
    id: "3",
    role: "assistant",
    content: "Perfeito! Clínicas odontológicas têm excelente potencial de SEO local. Em qual cidade você atende principalmente?",
  },
}

export function StrategyChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleOptionClick = (option: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: option,
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response
    setIsTyping(true)
    setTimeout(() => {
      const followUp = followUpMessages[option]
      if (followUp) {
        setMessages((prev) => [...prev, { ...followUp, id: `ai-${Date.now()}` }])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: `Entendi que você trabalha com "${option}". Isso é muito interessante! Agora me conta: quem é o seu cliente ideal? Descreva o perfil de pessoa que você mais gostaria de atender.`,
          },
        ])
      }
      setIsTyping(false)
    }, 1000)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate AI response
    setIsTyping(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: "Obrigado pela informação! Isso vai nos ajudar a criar conteúdos que realmente conectam com seu público. Mais uma pergunta: quais são os principais serviços ou produtos que você oferece?",
        },
      ])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <Card className="flex h-[600px] flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] space-y-3",
                  message.role === "user" && "text-right"
                )}
              >
                <div
                  className={cn(
                    "inline-block rounded-2xl px-4 py-3",
                    message.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                
                {message.options && (
                  <div className="flex flex-wrap gap-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="inline-block rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Digite sua resposta..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <Button onClick={handleSendMessage} size="icon" className="h-12 w-12 rounded-xl">
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Pressione Enter para enviar ou clique em uma opção acima
        </p>
      </div>
    </Card>
  )
}
