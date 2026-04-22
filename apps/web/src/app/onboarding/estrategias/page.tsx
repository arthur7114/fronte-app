"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Sparkles, CheckCircle2, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const suggestedStrategies = [
  {
    name: "Blog Educativo",
    description: "Conteúdo que educa seu cliente sobre problemas e soluções no seu segmento",
    focus: "SEO + Autoridade",
    keywords: "15-20 keywords por mês",
    tone: "Profissional e educativo",
    audience: "Clientes em busca de aprender",
    color: "from-blue-500/10 to-cyan-500/10",
    icon: "📚",
  },
  {
    name: "Local + GEO",
    description: "Conteúdo otimizado para aparecer no Google Maps e buscas locais",
    focus: "SEO Local + GEO",
    keywords: "10-15 keywords locais",
    tone: "Acolhedor e local",
    audience: "Clientes na sua região",
    color: "from-green-500/10 to-emerald-500/10",
    icon: "📍",
  },
  {
    name: "Conversões",
    description: "Conteúdo focado em gerar leads e vendas com CTAs diretos",
    focus: "Conversão",
    keywords: "5-10 keywords com intent",
    tone: "Persuasivo",
    audience: "Clientes prontos para comprar",
    color: "from-orange-500/10 to-red-500/10",
    icon: "🎯",
  },
]

export default function EstrategiasPage() {
  const router = useRouter()

  const handleSelectStrategy = (index: number) => {
    // Store selected strategies
    const selected = sessionStorage.getItem("onboarding_selected_strategies") || "[]"
    const strategies = JSON.parse(selected)
    strategies.push(index)
    sessionStorage.setItem("onboarding_selected_strategies", JSON.stringify(strategies))
    
    if (strategies.length >= 2) {
      // Go to dashboard
      router.push("/app/dashboard")
    }
  }

  const handleSkipAndGoDashboard = () => {
    router.push("/app/dashboard")
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {[
            { label: "Criar conta", done: true },
            { label: "Workspace", done: true },
            { label: "Site", done: true },
            { label: "Estratégia", done: true },
            { label: "Resumo", done: true },
            { label: "Concluir", done: false, active: true },
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
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Estratégias sugeridas para seu negócio
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Com base no seu briefing, recomendamos começar com 2-3 estratégias abaixo. Cada uma tem seu próprio tom, estilo e direcionamento. Você pode criar mais depois.
          </p>
        </div>

        {/* Strategy Cards */}
        <div className="grid gap-6">
          {suggestedStrategies.map((strategy, index) => (
            <button
              key={index}
              onClick={() => handleSelectStrategy(index)}
              className="group relative overflow-hidden rounded-xl border-2 border-border bg-card text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                strategy.color
              )} />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{strategy.icon}</span>
                    <div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {strategy.name}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {strategy.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-border group-hover:border-primary group-hover:bg-primary/10 transition-all shrink-0">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Foco</p>
                      <p className="text-sm font-medium text-foreground">{strategy.focus}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Cadência</p>
                      <p className="text-sm font-medium text-foreground">{strategy.keywords}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Tom</p>
                      <p className="text-sm font-medium text-foreground">{strategy.tone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Público-alvo</p>
                  <p className="text-sm text-foreground mt-1">{strategy.audience}</p>
                </div>
              </CardContent>
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Recomendamos começar com pelo menos 2 estratégias. Você pode adicionar mais depois.
          </p>
          
          <Button
            onClick={handleSkipAndGoDashboard}
            variant="outline"
            size="lg"
            className="w-full h-12 font-medium"
          >
            Prosseguir sem selecionar
          </Button>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Como funcionam as estratégias?</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Cada estratégia é independente, com seu próprio tom, palavras-chave, estilo e referências. Mas todas compartilham o mesmo calendário editorial do workspace. Você pode criar, editar ou deletar estratégias a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
