"use client";

import { useState } from "react";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: string[];
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Ola! Sou a IA do ContentAI e vou ajudar a criar uma estrategia de conteudo perfeita para seu negocio. Vamos comecar com algumas perguntas simples. Qual e o seu segmento de atuacao?",
    options: ["Saude e Bem-estar", "Servicos Profissionais", "Comercio Local", "Tecnologia", "Educacao", "Outro"],
  },
];

const followUpMessages: Record<string, Message> = {
  "Saude e Bem-estar": {
    id: "2",
    role: "assistant",
    content:
      "Otima escolha! O setor de saude tem muito potencial de crescimento organico. Pode me contar mais especificamente qual e o seu negocio?",
    options: ["Clinica Odontologica", "Clinica Medica", "Academia / Personal", "Nutricionista", "Psicologo / Terapeuta", "Outro"],
  },
  "Clinica Odontologica": {
    id: "3",
    role: "assistant",
    content: "Perfeito! Clinicas odontologicas tem excelente potencial de SEO local. Em qual cidade voce atende principalmente?",
  },
};

export function StrategyChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  function appendAssistantResponse(option: string) {
    setIsTyping(true);
    setTimeout(() => {
      const followUp = followUpMessages[option] ?? {
        id: `ai-${Date.now()}`,
        role: "assistant" as const,
        content: `Entendi que voce trabalha com "${option}". Agora me conta: quem e o seu cliente ideal?`,
      };
      setMessages((current) => [...current, { ...followUp, id: `ai-${Date.now()}` }]);
      setIsTyping(false);
    }, 700);
  }

  function handleOptionClick(option: string) {
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", content: option }]);
    appendAssistantResponse(option);
  }

  function handleSendMessage() {
    if (!inputValue.trim()) return;
    const content = inputValue.trim();
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", content }]);
    setInputValue("");
    appendAssistantResponse(content);
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex gap-4", message.role === "user" && "flex-row-reverse")}>
              {message.role === "assistant" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
              ) : null}
              <div className={cn("max-w-[80%] space-y-3", message.role === "user" && "text-right")}>
                <div
                  className={cn(
                    "inline-block rounded-2xl px-4 py-3",
                    message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.options ? (
                  <div className="flex flex-wrap gap-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleOptionClick(option)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {isTyping ? (
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
          ) : null}
        </div>
      </div>
      <div className="border-t border-border p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSendMessage()}
            placeholder="Digite sua resposta..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <Button onClick={handleSendMessage} size="icon" className="h-12 w-12 rounded-xl">
            {inputValue.trim() ? <Send className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Pressione Enter para enviar ou clique em uma opcao acima
        </p>
      </div>
    </Card>
  );
}
