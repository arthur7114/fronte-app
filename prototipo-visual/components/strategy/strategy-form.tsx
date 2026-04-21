"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { TrendingUp, MapPin, FileText, Zap } from "lucide-react"

export type StrategyType = "seo" | "local" | "blog" | "conversao"

export type StrategyDraft = {
  name: string
  type: StrategyType
  description: string
  audience: string
  tone: string
  cadence: number
}

const TYPES: {
  value: StrategyType
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}[] = [
  {
    value: "seo",
    label: "SEO",
    icon: TrendingUp,
    description: "Tráfego orgânico",
  },
  {
    value: "local",
    label: "Local",
    icon: MapPin,
    description: "Busca local e mapa",
  },
  {
    value: "blog",
    label: "Blog",
    icon: FileText,
    description: "Autoridade e educação",
  },
  {
    value: "conversao",
    label: "Conversão",
    icon: Zap,
    description: "Foco em gerar leads",
  },
]

const TONE_OPTIONS = [
  "Profissional e educativo",
  "Acolhedor e próximo",
  "Técnico e direto",
  "Persuasivo e comercial",
  "Leve e inspirador",
]

type Props = {
  value: StrategyDraft
  onChange: (next: StrategyDraft) => void
}

export function StrategyForm({ value, onChange }: Props) {
  const update = <K extends keyof StrategyDraft>(key: K, val: StrategyDraft[K]) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="space-y-8">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="strategy-name" className="text-sm font-medium">
          Nome da estratégia
        </Label>
        <Input
          id="strategy-name"
          placeholder="Ex.: Blog Educativo — Clínica SP"
          value={value.name}
          onChange={(e) => update("name", e.target.value)}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Use um nome curto que ajude a identificar o foco desta estratégia.
        </p>
      </div>

      {/* Tipo */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tipo de estratégia</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TYPES.map((t) => {
            const active = value.type === t.value
            const Icon = t.icon
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => update("type", t.value)}
                className={cn(
                  "group relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="strategy-desc" className="text-sm font-medium">
          Objetivo e contexto
        </Label>
        <Textarea
          id="strategy-desc"
          placeholder="Descreva o que essa estratégia pretende alcançar e qualquer contexto relevante do negócio."
          value={value.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Público-alvo + Tom em duas colunas */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="strategy-audience" className="text-sm font-medium">
            Público-alvo
          </Label>
          <Input
            id="strategy-audience"
            placeholder="Ex.: Adultos 25-55 anos, classe B"
            value={value.audience}
            onChange={(e) => update("audience", e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strategy-tone" className="text-sm font-medium">
            Tom de voz
          </Label>
          <select
            id="strategy-tone"
            value={value.tone}
            onChange={(e) => update("tone", e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Selecione um tom</option>
            {TONE_OPTIONS.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cadência */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <Label className="text-sm font-medium">Cadência de publicação</Label>
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{value.cadence}</span> artigos/mês
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[4, 8, 12, 20].map((n) => {
            const active = value.cadence === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => update("cadence", n)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                {n}/mês
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
