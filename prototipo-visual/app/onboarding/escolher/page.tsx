"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EscolherPage() {
  const router = useRouter()

  const handleChooseAI = () => {
    sessionStorage.setItem("onboarding_path", "ia")
    router.push("/onboarding/estrategia")
  }

  const handleChooseManual = () => {
    sessionStorage.setItem("onboarding_path", "manual")
    router.push("/onboarding/resumo")
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
            { label: "Estratégia", done: false, active: true },
            { label: "Resumo", done: false },
            { label: "Concluir", done: false },
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
            Como você prefere criar sua estratégia?
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Você pode contar com a IA ou fazer tudo por conta própria. Ambos os caminhos funcionam bem!
          </p>
        </div>

        {/* Two Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Option 1: IA */}
          <button
            onClick={handleChooseAI}
            className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Conversar com a IA</h2>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  Faça um briefing rápido, suba seus conteúdos de referência e deixe a IA montar uma estratégia personalizada.
                </p>
              </div>
              <ul className="space-y-2 pt-2">
                {["Chat guiado", "Upload de referências", "Estratégia automática"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4 flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                Começar
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>

          {/* Option 2: Manual */}
          <button
            onClick={handleChooseManual}
            className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Fazer por conta própria</h2>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  Você define suas próprias estratégias, palavras-chave e conteúdos. Total controle e liberdade.
                </p>
              </div>
              <ul className="space-y-2 pt-2">
                {["Controle total", "Sem perguntas", "Começa direto"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4 flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                Começar
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Qual escolher?</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Não é uma decisão de "para sempre"! Você sempre pode voltar e criar mais estratégias depois. A maioria dos usuários começa com a IA para ganhar tempo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
