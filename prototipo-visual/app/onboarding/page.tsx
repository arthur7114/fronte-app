"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Building2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export default function WorkspacePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [slug, setSlug] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const userData = sessionStorage.getItem("onboarding_user")
    if (userData) {
      const user = JSON.parse(userData)
      setUserName(user.firstName)
    }
  }, [])

  useEffect(() => {
    setSlug(generateSlug(workspaceName))
  }, [workspaceName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceName.trim()) return

    setIsLoading(true)

    // Simulate workspace creation
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Store workspace data
    sessionStorage.setItem("onboarding_workspace", JSON.stringify({
      name: workspaceName,
      slug: slug,
    }))

    router.push("/onboarding/site")
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {[
            { label: "Criar conta", done: true },
            { label: "Workspace", done: false, active: true },
            { label: "Site", done: false },
            { label: "Briefing", done: false },
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
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            {userName ? `Olá, ${userName}!` : "Vamos começar!"} Configure seu espaço de trabalho
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            O workspace é onde você gerencia todos os seus sites e conteúdos. Geralmente usamos o nome da sua empresa ou agência.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="workspaceName" className="text-sm font-medium text-foreground">
              Nome do Workspace
            </label>
            <Input
              id="workspaceName"
              type="text"
              placeholder="Ex: Minha Empresa"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="h-12 text-base"
              autoFocus
              required
            />
            {slug && (
              <p className="text-sm text-muted-foreground">
                Identificador: <span className="font-mono text-foreground">{slug}</span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 font-medium text-base"
            disabled={isLoading || !workspaceName.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Criando workspace...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continuar
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Help Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">O que é um Workspace?</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Pense no workspace como o espaço da sua empresa. Dentro dele, você pode criar vários sites e convidar membros da equipe para colaborar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
