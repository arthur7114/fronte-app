"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { StrategyChatInterface } from "@/components/strategy/strategy-chat"
import { StrategyForm, type StrategyDraft } from "@/components/strategy/strategy-form"
import { StrategyPreview } from "@/components/strategy/strategy-preview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  Sparkles,
  PencilLine,
  TrendingUp,
  MapPin,
  FileText,
  Zap,
} from "lucide-react"

type PresetId = "blog" | "local" | "conversao"

const PRESETS: {
  id: PresetId
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  accent: string
  draft: Partial<StrategyDraft>
}[] = [
  {
    id: "blog",
    icon: FileText,
    title: "Blog educativo",
    description: "Autoridade e SEO orgânico",
    accent: "bg-amber-100 text-amber-700",
    draft: {
      name: "Blog Educativo",
      type: "blog",
      description:
        "Conteúdo que educa o cliente ideal sobre problemas e soluções do seu segmento, gerando autoridade e tráfego orgânico.",
      audience: "Pessoas em fase de pesquisa e aprendizado",
      tone: "Profissional e educativo",
      cadence: 8,
    },
  },
  {
    id: "local",
    icon: MapPin,
    title: "Local + GEO",
    description: "Google Maps e buscas regionais",
    accent: "bg-emerald-100 text-emerald-700",
    draft: {
      name: "Local + GEO",
      type: "local",
      description:
        "Conteúdo otimizado para aparecer no Google Maps e em buscas locais da sua região de atuação.",
      audience: "Clientes próximos geograficamente",
      tone: "Acolhedor e próximo",
      cadence: 4,
    },
  },
  {
    id: "conversao",
    icon: Zap,
    title: "Conversão",
    description: "Leads e vendas com CTAs diretos",
    accent: "bg-orange-100 text-orange-700",
    draft: {
      name: "Estratégia de Conversão",
      type: "conversao",
      description:
        "Conteúdo direto ao ponto para capturar leads qualificados e guiar o visitante até uma conversão.",
      audience: "Clientes prontos para decidir",
      tone: "Persuasivo e comercial",
      cadence: 4,
    },
  },
]

const EMPTY_DRAFT: StrategyDraft = {
  name: "",
  type: "seo",
  description: "",
  audience: "",
  tone: "",
  cadence: 8,
}

export default function NovaEstrategiaPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<StrategyDraft>(EMPTY_DRAFT)
  const [activePreset, setActivePreset] = useState<PresetId | null>(null)
  const [mode, setMode] = useState<"form" | "chat">("form")

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id)
    setDraft({ ...EMPTY_DRAFT, ...preset.draft })
  }

  const clearPreset = (next: StrategyDraft) => {
    setDraft(next)
    // Se o usuário editou depois de escolher preset, não precisamos sinalizar nada,
    // mas mantemos o preset ativo apenas se os campos continuam iguais.
    const active = PRESETS.find((p) => p.id === activePreset)
    if (
      active &&
      (next.name !== active.draft.name ||
        next.type !== active.draft.type ||
        next.description !== active.draft.description)
    ) {
      setActivePreset(null)
    }
  }

  const canSubmit =
    draft.name.trim().length > 2 &&
    !!draft.type &&
    draft.audience.trim().length > 2 &&
    draft.tone.trim().length > 0

  const handleSubmit = () => {
    // Simulação: volta para a lista; idealmente criaria a estratégia e levaria ao detalhe.
    router.push("/dashboard/estrategias")
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header compacto */}
      <div className="space-y-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/dashboard/estrategias"
            className="transition-colors hover:text-foreground"
          >
            Estratégias
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Nova</span>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Nova estratégia
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Comece a partir de um preset ou configure do jeito que preferir. Cada
                estratégia é independente com suas próprias palavras, tópicos e artigos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Presets rápidos */}
      <section aria-labelledby="presets-heading" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2
            id="presets-heading"
            className="text-sm font-medium text-foreground"
          >
            Começar a partir de um preset
          </h2>
          <span className="text-xs text-muted-foreground">
            Preenche os campos automaticamente
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {PRESETS.map((preset) => {
            const Icon = preset.icon
            const active = activePreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "group relative flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all",
                  active
                    ? "border-primary shadow-sm ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:shadow-sm",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    preset.accent,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {preset.title}
                    </p>
                    {active && (
                      <span className="text-[11px] font-medium text-primary">
                        Selecionado
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {preset.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Layout principal: editor + preview */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Editor */}
        <div className="min-w-0">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "form" | "chat")}>
            <div className="flex items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="form" className="gap-1.5">
                  <PencilLine className="h-3.5 w-3.5" />
                  Formulário
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Assistente IA
                </TabsTrigger>
              </TabsList>
              {mode === "form" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft(EMPTY_DRAFT)
                    setActivePreset(null)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </Button>
              )}
            </div>

            <TabsContent value="form" className="mt-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <StrategyForm value={draft} onChange={clearPreset} />
              </div>
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Converse com a IA para montar a estratégia. Ao final, os campos do
                  formulário serão preenchidos automaticamente.
                </p>
                <StrategyChatInterface />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: preview ao vivo */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <StrategyPreview
            draft={draft}
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
          />
        </aside>
      </div>
    </div>
  )
}
