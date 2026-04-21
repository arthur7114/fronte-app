"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, CheckCircle2, Mail } from "lucide-react"
import { addLead, type LeadOrigin } from "@/lib/leads-store"
import { cn } from "@/lib/utils"

type Props = {
  origin?: LeadOrigin
  sourceArticle?: string
  variant?: "inline" | "footer"
  title?: string
  description?: string
}

export function NewsletterCTA({
  origin = "inline",
  sourceArticle,
  variant = "inline",
  title = "Receba nossas dicas semanais",
  description = "Conteúdo exclusivo sobre saúde bucal direto no seu e-mail. Zero spam, cancele quando quiser.",
}: Props) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Digite um e-mail válido.")
      return
    }

    addLead({
      email: trimmed,
      name: name.trim() || undefined,
      interest: "tudo",
      origin,
      sourceArticle,
    })

    setSubmitted(true)
    setEmail("")
    setName("")
  }

  if (variant === "footer") {
    return (
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Newsletter
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground text-balance">
            {title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {submitted ? (
          <SuccessState />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder="Seu nome (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 flex-1"
              />
              <Button type="submit" size="lg" className="h-11">
                Quero receber
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Ao enviar, você concorda com nossa Política de Privacidade.
            </p>
          </form>
        )}
      </div>
    )
  }

  // Inline variant (dentro do artigo)
  return (
    <aside
      className={cn(
        "my-10 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8",
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Mail className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>

          {submitted ? (
            <div className="mt-4">
              <SuccessState compact />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 flex-1 bg-background"
              />
              <Button type="submit" className="h-10">
                Assinar
              </Button>
            </form>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </aside>
  )
}

function SuccessState({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-primary/30 bg-background p-4",
        compact ? "" : "min-h-[96px]",
      )}
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-medium text-foreground">Inscrição confirmada!</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          Enviamos um e-mail de boas-vindas. Seus dados já estão disponíveis no painel de leads.
        </p>
      </div>
    </div>
  )
}
