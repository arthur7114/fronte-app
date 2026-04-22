"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowUp,
  Bot,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Strategy } from "@/lib/strategies"
import { 
  listChats, 
  createChat, 
  loadChatMessages, 
  deleteChat, 
  askAssistant,
  type ChatSummary,
  type ChatMessage
} from "@/app/dashboard/estrategias/chat-actions"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

type StrategyAssistantProps = {
  strategy: Strategy
  keywords?: Array<{ status?: string | null }>
  topics?: Array<{ status?: string | null }>
}

export function StrategyAssistant({ strategy }: StrategyAssistantProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const handleNewChat = useCallback(async () => {
    setSending(true)
    const res = await createChat(strategy.id, "Nova conversa")
    if (res.data) {
      setChats((prev) => [res.data!, ...prev])
      setActiveChatId(res.data.id)
      setMessages([])
    }
    setSending(false)
  }, [strategy.id])

  // Load chats on mount
  useEffect(() => {
    async function init() {
      setLoadingChats(true)
      const res = await listChats(strategy.id)
      if (res.data) {
        setChats(res.data)
        // Auto-select most recent or create new if empty
        if (res.data.length > 0) {
          setActiveChatId(res.data[0].id)
        } else {
          handleNewChat()
        }
      }
      setLoadingChats(false)
    }
    init()
  }, [strategy.id, handleNewChat])

  // Load messages when active chat changes
  useEffect(() => {
    const chatId = activeChatId ?? ""
    if (!chatId) return
    async function load() {
      setLoadingMessages(true)
      const res = await loadChatMessages(chatId)
      if (res.data) setMessages(res.data)
      setLoadingMessages(false)
    }
    load()
  }, [activeChatId])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending, elapsedSeconds])

  useEffect(() => {
    if (!sending) {
      return
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [sending])

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = confirm("Excluir esta conversa?")
    if (!ok) return

    await deleteChat(id)
    setChats(chats.filter(c => c.id !== id))
    if (activeChatId === id) {
      const next = chats.find(c => c.id !== id)
      setActiveChatId(next?.id || null)
    }
    toast.success("Conversa excluída.")
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !activeChatId || sending) return

    const userMsg = input.trim()
    setInput("")
    setSending(true)
    setElapsedSeconds(0)

    // Optimistic update
    const tempUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMsg,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])

    const res = await askAssistant(activeChatId!, strategy.id, userMsg)
    
    if (res.error) {
      toast.error(res.error)
    } else if (res.content) {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.content,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMsg])
      
      if (messages.length === 0) {
        const list = await listChats(strategy.id)
        if (list.data) setChats(list.data)
      }
      router.refresh()
    }
    
    setSending(false)
  }

  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent">
      <CardContent className="flex h-[700px] p-0 gap-4">
        {/* Sidebar */}
        <aside className="w-72 flex flex-col rounded-xl border border-border bg-card">
          <div className="p-4">
            <Button 
              onClick={handleNewChat} 
              className="w-full justify-start gap-2 h-10 font-medium" 
              variant="outline"
              disabled={sending}
            >
              <Plus className="h-4 w-4" />
              Nova Conversa
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="px-2 pb-4 space-y-1">
              {loadingChats ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-2 py-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3 opacity-50" />
                  </div>
                ))
              ) : chats.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-10">Nenhuma conversa ainda.</p>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => !sending && setActiveChatId(chat.id)}
                    className={cn(
                      "group relative flex flex-col gap-1 rounded-lg px-3 py-3 text-left transition-colors cursor-pointer",
                      activeChatId === chat.id 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium pr-6">
                        {chat.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] opacity-60">
                      {new Date(chat.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Assistente Antigravity</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Expert em Estratégia Editorial</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              {loadingMessages ? (
                <div className="space-y-6">
                  <SkeletonMessage role="assistant" />
                  <SkeletonMessage role="user" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary/40" />
                  </div>
                  <div className="max-w-sm">
                    <p className="text-sm font-medium">Como posso ajudar com sua estratégia hoje?</p>
                    <p className="text-xs text-muted-foreground mt-1">Você pode perguntar sobre keywords, temas de conteúdo ou como atingir seu público-alvo.</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4 group",
                      message.role === "assistant" ? "items-start" : "items-start flex-row-reverse"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
                      message.role === "assistant" 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-background text-foreground border-border"
                    )}>
                      {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "flex flex-col gap-1 max-w-[85%]",
                      message.role === "user" && "items-end"
                    )}>
                      <div className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.role === "assistant" 
                          ? "bg-muted/50 text-foreground" 
                          : "bg-primary text-primary-foreground shadow-sm"
                      )}>
                        {message.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="w-full max-w-[420px] rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm shadow-sm">
                    <div className="flex items-start gap-3">
                      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">Processando solicitação</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Consultando o estado real da estratégia e executando ferramentas quando necessário.
                        </p>
                        <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {elapsedSeconds > 0 ? `${elapsedSeconds}s` : "Iniciando"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-border bg-muted/5">
            <div className="relative mx-auto max-w-2xl">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Pergunte qualquer coisa sobre a estratégia..."
                className="min-h-[60px] w-full resize-none rounded-2xl border-border bg-background pr-12 pt-4 shadow-sm focus-visible:ring-primary/20"
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                onClick={handleSendMessage}
                disabled={!input.trim() || sending || !activeChatId}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter opacity-50">
              Pressione Enter para enviar · Shift+Enter para nova linha
            </p>
          </div>
        </main>
      </CardContent>
    </Card>
  )
}

function SkeletonMessage({ role }: { role: "user" | "assistant" }) {
  return (
    <div className={cn("flex gap-4", role === "user" && "flex-row-reverse")}>
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="space-y-2 max-w-[70%]">
        <Skeleton className="h-12 w-[300px] rounded-2xl" />
      </div>
    </div>
  )
}
