"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronRight, Sparkles, Wand2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Strategy } from "@/lib/strategies"
import type { Channel } from "@/lib/competitors-store"

const ALL_CHANNELS: Channel[] = [
  "Blog",
  "Instagram",
  "LinkedIn",
  "YouTube",
  "Ads",
  "SEO",
]

export type FormValues = {
  niche: string
  region: string
  competitors: string[]
  keywords: string[]
  channels: Channel[]
  depth: "rápida" | "padrão" | "profunda"
  period: 30 | 90 | 180
}

function defaultsFromStrategy(strategy: Strategy): FormValues {
  return {
    niche: strategy.type === "local" ? "Odontologia local" : "Odontologia estética",
    region: strategy.type === "local" ? "São Paulo — Zona Sul" : "São Paulo — SP",
    competitors: [],
    keywords: [],
    channels: ["Blog", "SEO", "Instagram", "LinkedIn"],
    depth: "padrão",
    period: 90,
  }
}

type Props = {
  strategy: Strategy
  onSubmit: (values: FormValues) => void
}

export function CompetitorForm({ strategy, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(defaultsFromStrategy(strategy))
  const [competitorInput, setCompetitorInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")

  const addChip = (field: "competitors" | "keywords", raw: string) => {
    const v = raw.trim()
    if (!v) return
    setValues((s) => ({
      ...s,
      [field]: Array.from(new Set([...s[field], v])),
    }))
  }

  const removeChip = (field: "competitors" | "keywords", term: string) => {
    setValues((s) => ({ ...s, [field]: s[field].filter((t) => t !== term) }))
  }

  const toggleChannel = (ch: Channel) => {
    setValues((s) => ({
      ...s,
      channels: s.channels.includes(ch)
        ? s.channels.filter((c) => c !== ch)
        : [...s.channels, ch],
    }))
  }

  const fillFromStrategy = () => {
    setValues((s) => ({
      ...s,
      competitors: Array.from(
        new Set([...s.competitors, "Odonto Excellence", "Sorriso Perfeito"]),
      ),
      keywords: Array.from(
        new Set([
          ...s.keywords,
          "clareamento dental",
          "implante dentário preço",
          "sensibilidade dental",
        ]),
      ),
    }))
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Configurar pesquisa</CardTitle>
          <p className="text-sm text-muted-foreground">
            Os campos vêm pré-preenchidos a partir de{" "}
            <span className="font-medium text-foreground">{strategy.name}</span>.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="niche" className="text-xs font-medium">
              Mercado / nicho
            </Label>
            <Input
              id="niche"
              value={values.niche}
              onChange={(e) => setValues((s) => ({ ...s, niche: e.target.value }))}
              placeholder="Ex: Odontologia estética"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region" className="text-xs font-medium">
              Região
            </Label>
            <Input
              id="region"
              value={values.region}
              onChange={(e) => setValues((s) => ({ ...s, region: e.target.value }))}
              placeholder="Ex: São Paulo — SP"
            />
          </div>
        </div>

        {/* Competidores conhecidos — chips */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Concorrentes conhecidos</Label>
          <div className="rounded-md border border-input bg-background px-2 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {values.competitors.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  onRemove={() => removeChip("competitors", c)}
                />
              ))}
              <input
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    addChip("competitors", competitorInput)
                    setCompetitorInput("")
                  }
                  if (
                    e.key === "Backspace" &&
                    !competitorInput &&
                    values.competitors.length
                  ) {
                    removeChip(
                      "competitors",
                      values.competitors[values.competitors.length - 1],
                    )
                  }
                }}
                onBlur={() => {
                  if (competitorInput) {
                    addChip("competitors", competitorInput)
                    setCompetitorInput("")
                  }
                }}
                placeholder={
                  values.competitors.length === 0
                    ? "Digite domínios ou nomes e tecle Enter"
                    : ""
                }
                className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Keywords principais — chips */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Palavras-chave principais</Label>
          <div className="rounded-md border border-input bg-background px-2 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {values.keywords.map((k) => (
                <Chip
                  key={k}
                  label={k}
                  onRemove={() => removeChip("keywords", k)}
                />
              ))}
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    addChip("keywords", keywordInput)
                    setKeywordInput("")
                  }
                  if (
                    e.key === "Backspace" &&
                    !keywordInput &&
                    values.keywords.length
                  ) {
                    removeChip(
                      "keywords",
                      values.keywords[values.keywords.length - 1],
                    )
                  }
                }}
                onBlur={() => {
                  if (keywordInput) {
                    addChip("keywords", keywordInput)
                    setKeywordInput("")
                  }
                }}
                placeholder={
                  values.keywords.length === 0
                    ? "Digite termos e tecle Enter"
                    : ""
                }
                className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Canais */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Canais para analisar</Label>
          <div className="flex flex-wrap gap-2">
            {ALL_CHANNELS.map((ch) => {
              const active = values.channels.includes(ch)
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {ch}
                </button>
              )
            })}
          </div>
        </div>

        {/* Profundidade + período */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Profundidade da análise</Label>
            <Select
              value={values.depth}
              onValueChange={(v) =>
                setValues((s) => ({ ...s, depth: v as FormValues["depth"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rápida">
                  Rápida — resumo em minutos
                </SelectItem>
                <SelectItem value="padrão">
                  Padrão — análise equilibrada
                </SelectItem>
                <SelectItem value="profunda">
                  Profunda — coleta estendida
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Período</Label>
            <Select
              value={String(values.period)}
              onValueChange={(v) =>
                setValues((s) => ({
                  ...s,
                  period: Number(v) as FormValues["period"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="180">Últimos 180 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={fillFromStrategy}
          >
            <Wand2 className="h-4 w-4" />
            Usar dados da estratégia
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={() => onSubmit(values)}
            disabled={!values.niche || values.channels.length === 0}
          >
            <Sparkles className="h-4 w-4" />
            Analisar concorrentes
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      variant="secondary"
      className="gap-1 rounded-full bg-muted py-0.5 pl-2.5 pr-1 text-xs font-normal"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
        aria-label={`Remover ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}
