"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { TrendingUp, MapPin, FileText, Zap, Settings, Cpu, Bot } from "lucide-react"

export type StrategyType = "seo" | "local" | "blog" | "conversao"
export type OperationMode = "manual" | "assisted" | "automatic"

export type StrategyDraft = {
  name: string
  type: StrategyType
  goal: string
  description: string
  audience: string
  tone: string
  cadence: number
  operation_mode: OperationMode
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

const MODES: {
  value: OperationMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}[] = [
  {
    value: "manual",
    label: "Manual",
    icon: Settings,
    description: "Você aprova cada etapa",
  },
  {
    value: "assisted",
    label: "Assistido",
    icon: Cpu,
    description: "IA sugere, você decide",
  },
  {
    value: "automatic",
    label: "Piloto Automático",
    icon: Bot,
    description: "Motor roda de ponta a ponta",
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
    <FieldGroup>
      {/* Nome */}
      <Field>
        <FieldLabel htmlFor="strategy-name">Nome da estratégia</FieldLabel>
        <FieldContent>
          <Input
            id="strategy-name"
            placeholder="Ex.: Blog Educativo — Clínica SP"
            value={value.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <FieldDescription>
            Use um nome curto que ajude a identificar o foco desta estratégia.
          </FieldDescription>
        </FieldContent>
      </Field>

      {/* Tipo */}
      <Field>
        <FieldLabel>Tipo de estratégia</FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-2 gap-4">
            {TYPES.map((t) => {
              const active = value.type === t.value
              const Icon = t.icon
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update("type", t.value)}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="mb-1 block font-medium leading-none text-foreground">{t.label}</span>
                    <span className="block text-sm leading-snug text-muted-foreground">{t.description}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </FieldContent>
      </Field>

      {/* Objetivo */}
      <Field>
        <FieldLabel htmlFor="strategy-goal">Objetivo da estratégia</FieldLabel>
        <FieldContent>
          <Textarea
            id="strategy-goal"
            placeholder="Ex.: Atrair pacientes de ortodontia em São Paulo via busca orgânica"
            value={value.goal}
            onChange={(e) => update("goal", e.target.value)}
            rows={2}
            className="resize-none"
          />
          <FieldDescription>
            A IA usa esse objetivo para orientar sugestões de keywords e tópicos.
          </FieldDescription>
        </FieldContent>
      </Field>

      {/* Contexto */}
      <Field>
        <FieldLabel htmlFor="strategy-desc">Contexto adicional</FieldLabel>
        <FieldContent>
          <Textarea
            id="strategy-desc"
            placeholder="Informações extras sobre o negócio, mercado, diferenciais..."
            value={value.description}
            onChange={(e) => update("description", e.target.value)}
            rows={2}
            className="resize-none"
          />
        </FieldContent>
      </Field>

      {/* Público-alvo + Tom em duas colunas */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="strategy-audience">Público-alvo</FieldLabel>
          <FieldContent>
            <Input
              id="strategy-audience"
              placeholder="Ex.: Adultos 25-55 anos"
              value={value.audience}
              onChange={(e) => update("audience", e.target.value)}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="strategy-tone">Tom de voz</FieldLabel>
          <FieldContent>
            <select
              id="strategy-tone"
              value={value.tone}
              onChange={(e) => update("tone", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecione um tom</option>
              {TONE_OPTIONS.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </FieldContent>
        </Field>
      </div>

      {/* Cadência */}
      <Field>
        <FieldLabel>Cadência de publicação</FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-4 gap-3">
            {[4, 8, 12, 20].map((n) => {
              const active = value.cadence === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => update("cadence", n)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:bg-muted/50",
                  )}
                >
                  {n} / mês
                </button>
              )
            })}
          </div>
        </FieldContent>
      </Field>

      {/* Modo de Operação */}
      <Field>
        <FieldLabel>Motor de Automação</FieldLabel>
        <FieldContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {MODES.map((m) => {
              const active = value.operation_mode === m.value
              const Icon = m.icon
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => update("operation_mode", m.value)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="mb-1 block font-medium leading-none text-foreground">{m.label}</span>
                    <span className="block text-sm leading-snug text-muted-foreground">{m.description}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}
