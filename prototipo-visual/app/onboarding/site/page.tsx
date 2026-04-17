"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Globe, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20)
}

const languages = [
  { value: "pt-BR", label: "Portugues (Brasil)" },
  { value: "pt-PT", label: "Portugues (Portugal)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Espanol" },
]

// Simulated taken subdomains
const takenSubdomains = ["demo", "test", "blog", "site", "app"]

export default function SiteConfigPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [siteName, setSiteName] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [language, setLanguage] = useState("pt-BR")
  const [subdomainStatus, setSubdomainStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [workspaceName, setWorkspaceName] = useState("")

  useEffect(() => {
    const workspaceData = sessionStorage.getItem("onboarding_workspace")
    if (workspaceData) {
      const workspace = JSON.parse(workspaceData)
      setWorkspaceName(workspace.name)
    }
  }, [])

  useEffect(() => {
    const generated = generateSubdomain(siteName)
    setSubdomain(generated)

    if (generated.length >= 3) {
      setSubdomainStatus("checking")
      const timer = setTimeout(() => {
        if (takenSubdomains.includes(generated)) {
          setSubdomainStatus("taken")
        } else {
          setSubdomainStatus("available")
        }
      }, 600)
      return () => clearTimeout(timer)
    } else {
      setSubdomainStatus("idle")
    }
  }, [siteName])

  const handleSubdomainChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setSubdomain(sanitized)

    if (sanitized.length >= 3) {
      setSubdomainStatus("checking")
      setTimeout(() => {
        if (takenSubdomains.includes(sanitized)) {
          setSubdomainStatus("taken")
        } else {
          setSubdomainStatus("available")
        }
      }, 600)
    } else {
      setSubdomainStatus("idle")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!siteName.trim() || subdomainStatus !== "available") return

    setIsLoading(true)

    // Simulate site creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store site data
    sessionStorage.setItem("onboarding_site", JSON.stringify({
      name: siteName,
      subdomain,
      language,
    }))

    // Proceed to briefing chat
    router.push("/onboarding/briefing")
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {[
            { label: "Criar conta", done: true },
            { label: "Workspace", done: true },
            { label: "Site", done: false, active: true },
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
            <Globe className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Configure seu primeiro site
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            {workspaceName && (
              <span>
                No workspace <span className="font-medium text-foreground">{workspaceName}</span>,{" "}
              </span>
            )}
            este sera o destino dos seus artigos e conteudos. Voce pode adicionar mais sites depois.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="siteName" className="text-sm font-medium text-foreground">
              Nome do Site
            </label>
            <Input
              id="siteName"
              type="text"
              placeholder="Ex: Blog da Clinica"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="h-12 text-base"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subdomain" className="text-sm font-medium text-foreground">
              Subdominio
            </label>
            <div className="flex items-center gap-0">
              <Input
                id="subdomain"
                type="text"
                placeholder="meusite"
                value={subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                className="h-12 text-base rounded-r-none border-r-0"
                required
              />
              <div className="h-12 px-4 flex items-center bg-muted border border-input rounded-r-lg text-sm text-muted-foreground">
                .contentai.com.br
              </div>
            </div>
            
            {/* Subdomain Status */}
            <div className="flex items-center gap-2 text-sm">
              {subdomainStatus === "checking" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Verificando disponibilidade...</span>
                </>
              )}
              {subdomainStatus === "available" && (
                <>
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span className="text-primary">Subdominio disponivel!</span>
                </>
              )}
              {subdomainStatus === "taken" && (
                <>
                  <X className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-destructive">Este subdominio ja esta em uso</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="text-sm font-medium text-foreground">
              Idioma do Conteudo
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Este sera o idioma padrao dos artigos gerados pela IA.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 font-medium text-base"
            disabled={isLoading || !siteName.trim() || subdomainStatus !== "available"}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Criando site...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Finalizar e comecar
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Info */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-medium text-foreground">O que acontece agora?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Seu blog estara no ar em <span className="font-mono text-foreground">{subdomain || "meusite"}.contentai.com.br</span></span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Nossa IA vai te ajudar a criar sua estrategia de conteudo</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Voce pode conectar seu dominio personalizado depois</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
