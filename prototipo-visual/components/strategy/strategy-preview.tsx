"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  MapPin,
  FileText,
  Zap,
  Sparkles,
  Target,
  Users,
  MessageSquare,
  CalendarDays,
  CheckCircle2,
  Circle,
} from "lucide-react"
import type { StrategyDraft, StrategyType } from "./strategy-form"

const TYPE_META: Record<
  StrategyType,
  { label: string; icon: React.ComponentType<{ className?: string }>; accent: string }
> = {
  seo: { label: "SEO", icon: TrendingUp, accent: "bg-primary/10 text-primary" },
  local: { label: "Local", icon: MapPin, accent: "bg-emerald-100 text-emerald-700" },
  blog: { label: "Blog", icon: FileText, accent: "bg-amber-100 text-amber-700" },
  conversao: { label: "Conversão", icon: Zap, accent: "bg-orange-100 text-orange-700" },
}

type Props = {
  draft: StrategyDraft
  onSubmit: () => void
  canSubmit: boolean
}

export function StrategyPreview({ draft, onSubmit, canSubmit }: Props) {
  const meta = TYPE_META[draft.type]
  const Icon = meta.icon

  const checks = [
    { label: "Nome definido", done: draft.name.trim().length > 2 },
    { label: "Tipo selecionado", done: Boolean(draft.type) },
    { label: "Público-alvo descrito", done: draft.audience.trim().length > 2 },
    { label: "Tom de voz", done: draft.tone.trim().length > 0 },
  ]
  const progress = Math.round((checks.filter((c) => c.done).length / checks.length) * 100)

  return (
    <div className="space-y-4">
      {/* Live preview card */}
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pré-visualização
            </span>
            <Badge variant="secondary" className="text-[11px] font-normal">
              {progress}%
            </Badge>
          </div>
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", meta.accent)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {draft.name.trim() || "Sua nova estratégia"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[11px]">
                  {meta.label}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  Rascunho
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <PreviewRow
              icon={<Target className="h-3.5 w-3.5" />}
              label="Objetivo"
              value={draft.description}
              placeholder="Descreva o objetivo da estratégia"
            />
            <PreviewRow
              icon={<Users className="h-3.5 w-3.5" />}
              label="Público"
              value={draft.audience}
              placeholder="Ainda não informado"
            />
            <PreviewRow
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              label="Tom"
              value={draft.tone}
              placeholder="Ainda não escolhido"
            />
            <PreviewRow
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="Cadência"
              value={`${draft.cadence} artigos/mês`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Checklist
          </p>
          <ul className="space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-sm">
                {c.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                )}
                <span className={cn(c.done ? "text-foreground" : "text-muted-foreground")}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <Button className="w-full gap-2" size="lg" disabled={!canSubmit} onClick={onSubmit}>
        <Sparkles className="h-4 w-4" />
        Criar estratégia
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Você poderá editar esses campos depois.
      </p>
    </div>
  )
}

function PreviewRow({
  icon,
  label,
  value,
  placeholder,
}: {
  icon: React.ReactNode
  label: string
  value: string
  placeholder?: string
}) {
  const hasValue = value.trim().length > 0
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-sm leading-snug",
            hasValue ? "text-foreground" : "italic text-muted-foreground/70",
          )}
        >
          {hasValue ? value : placeholder}
        </p>
      </div>
    </div>
  )
}
