"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Check,
  Edit3,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react"
import {
  acceptSuggestion,
  dismissSuggestion,
  getBriefing,
  getHistory,
  getPendingSuggestions,
  getSuggestionsForSection,
  overallCompleteness,
  sectionCompleteness,
  SECTION_LABEL,
  updateBriefing,
  useBriefingStore,
  type Briefing,
  type BriefingSuggestion,
  type SectionKey,
} from "@/lib/strategy-briefing"
import { cn } from "@/lib/utils"

type Props = {
  strategyId: string
}

const SECTION_ORDER: SectionKey[] = [
  "identidade",
  "audiencia",
  "objetivo",
  "voz",
  "diferenciais",
  "cta",
  "limites",
  "cadencia",
]

export function StrategyBriefing({ strategyId }: Props) {
  useBriefingStore()
  const b = getBriefing(strategyId)
  const pct = overallCompleteness(b)
  const pending = getPendingSuggestions(strategyId)
  const history = getHistory(strategyId)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <OverviewCard pct={pct} pendingCount={pending.length} />

        <IdentidadeSection strategyId={strategyId} b={b} />
        <AudienciaSection strategyId={strategyId} b={b} />
        <ObjetivoSection strategyId={strategyId} b={b} />
        <VozSection strategyId={strategyId} b={b} />
        <DiferenciaisSection strategyId={strategyId} b={b} />
        <CTASection strategyId={strategyId} b={b} />
        <LimitesSection strategyId={strategyId} b={b} />
        <CadenciaSection strategyId={strategyId} b={b} />
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <ProgressChecklist briefing={b} />
        <HistoryPanel
          history={history}
          className="mt-4"
          strategyId={strategyId}
        />
      </aside>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Overview card
// -----------------------------------------------------------------------------

function OverviewCard({
  pct,
  pendingCount,
}: {
  pct: number
  pendingCount: number
}) {
  return (
    <Card className="border-border/60 bg-muted/20">
      <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Briefing da estratégia
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tudo que a IA sabe sobre esta estratégia. Você pode editar à mão a
            qualquer momento.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="min-w-[180px]">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Preenchimento</span>
              <span className="font-medium text-foreground tabular-nums">
                {pct}%
              </span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
          {pendingCount > 0 && (
            <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3 w-3" />
              {pendingCount} sugestão{pendingCount > 1 ? "ões" : ""} do chat
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// -----------------------------------------------------------------------------
// Sidebar
// -----------------------------------------------------------------------------

function ProgressChecklist({ briefing }: { briefing: Briefing }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Checklist
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-1.5 text-sm">
          {SECTION_ORDER.map((key) => {
            const sec = sectionCompleteness(briefing, key)
            const done = sec.pct === 100
            return (
              <li key={key}>
                <a
                  href={`#section-${key}`}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border",
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-transparent",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-foreground">{SECTION_LABEL[key]}</span>
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {sec.filled}/{sec.total}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function HistoryPanel({
  history,
  strategyId,
  className,
}: {
  history: ReturnType<typeof getHistory>
  strategyId: string
  className?: string
}) {
  if (history.length === 0) return null
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Histórico
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3 text-xs">
          {history.slice(0, 5).map((h) => (
            <li key={h.id} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  h.by === "chat"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {h.by === "chat" ? (
                  <MessageCircle className="h-3 w-3" />
                ) : (
                  <Edit3 className="h-3 w-3" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground">{h.summary}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {SECTION_LABEL[h.section]} · {h.at}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Toda alteração manual ou via chat fica registrada nesta estratégia.
        </p>
        {/* keep prop to avoid unused warning */}
        <span className="sr-only">{strategyId}</span>
      </CardContent>
    </Card>
  )
}

// -----------------------------------------------------------------------------
// Helpers de seção
// -----------------------------------------------------------------------------

function SectionShell({
  id,
  title,
  description,
  completeness,
  suggestions,
  onAccept,
  onDismiss,
  editing,
  onToggleEdit,
  onSave,
  onCancel,
  canSave = true,
  children,
}: {
  id: SectionKey
  title: string
  description?: string
  completeness: { filled: number; total: number; pct: number }
  suggestions: BriefingSuggestion[]
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
  editing: boolean
  onToggleEdit: () => void
  onSave: () => void
  onCancel: () => void
  canSave?: boolean
  children: React.ReactNode
}) {
  const hasSuggestions = suggestions.length > 0
  const isEmpty = completeness.filled === 0
  return (
    <Card
      id={`section-${id}`}
      className={cn("scroll-mt-24", hasSuggestions && "ring-1 ring-primary/30")}
    >
      <CardHeader className="flex flex-col gap-3 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {hasSuggestions && (
              <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                <Sparkles className="h-3 w-3" />
                Sugestão pendente
              </Badge>
            )}
            {!hasSuggestions && isEmpty && (
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                Vazio
              </Badge>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {completeness.filled}/{completeness.total}
          </span>
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
              <Button size="sm" onClick={onSave} disabled={!canSave}>
                Salvar
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={onToggleEdit}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      {hasSuggestions && (
        <div className="mx-5 mb-3 space-y-2">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm text-foreground">{s.summary}</p>
                {s.fromValue && s.toValue && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="line-through">{s.fromValue}</span>
                    <span className="mx-1.5">→</span>
                    <span className="text-foreground">{s.toValue}</span>
                  </p>
                )}
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Proposto pela IA {s.at}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => onDismiss(s.id)}
                >
                  <X className="h-3.5 w-3.5" />
                  Descartar
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => onAccept(s.id)}>
                  <Check className="h-3.5 w-3.5" />
                  Aceitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <CardContent className="space-y-4 pt-0">{children}</CardContent>
    </Card>
  )
}

function ReadRow({
  label,
  value,
  muted,
}: {
  label: string
  value?: React.ReactNode
  muted?: string
}) {
  const isEmpty =
    value == null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  return (
    <div className="grid grid-cols-1 gap-1 py-1.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-start md:gap-4">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">
        {isEmpty ? (
          <span className="text-muted-foreground">
            {muted ?? "Não preenchido"}
          </span>
        ) : Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((v) => (
              <Badge key={String(v)} variant="secondary" className="font-normal">
                {String(v)}
              </Badge>
            ))}
          </div>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState("")
  const commit = () => {
    const term = input.trim()
    if (term && !value.includes(term)) onChange([...value, term])
    setInput("")
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5">
      {value.map((v) => (
        <Badge key={v} variant="secondary" className="gap-1 font-normal">
          {v}
          <button
            type="button"
            className="ml-0.5 rounded-sm text-muted-foreground hover:text-foreground"
            onClick={() => onChange(value.filter((x) => x !== v))}
            aria-label={`Remover ${v}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        className="flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
        placeholder={placeholder ?? "Adicionar e pressionar Enter"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            commit()
          }
          if (e.key === "Backspace" && !input && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commit}
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Seções
// -----------------------------------------------------------------------------

function useSectionState<T extends Partial<Briefing>>(initial: T) {
  const [draft, setDraft] = useState<T>(initial)
  const [editing, setEditing] = useState(false)
  return { draft, setDraft, editing, setEditing }
}

function IdentidadeSection({
  strategyId,
  b,
}: {
  strategyId: string
  b: Briefing
}) {
  const initial = useMemo(
    () => ({ name: b.name ?? "", description: b.description ?? "" }),
    [b.name, b.description],
  )
  const { draft, setDraft, editing, setEditing } = useSectionState(initial)
  const pending = getSuggestionsForSection(strategyId, "identidade")
  const completeness = sectionCompleteness(b, "identidade")

  return (
    <SectionShell
      id="identidade"
      title="Identidade"
      description="Como essa estratégia é nomeada e o que ela resume."
      completeness={completeness}
      suggestions={pending}
      onAccept={(id) => acceptSuggestion(strategyId, id)}
      onDismiss={(id) => dismissSuggestion(strategyId, id)}
      editing={editing}
      onToggleEdit={() => {
        setDraft(initial)
        setEditing(true)
      }}
      onCancel={() => setEditing(false)}
      onSave={() => {
        updateBriefing(strategyId, draft, { section: "identidade" })
        setEditing(false)
      }}
    >
      {editing ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="brief-name">Nome</Label>
            <Input
              id="brief-name"
              value={draft.name ?? ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brief-description">Resumo</Label>
            <Textarea
              id="brief-description"
              rows={3}
              value={draft.description ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </div>
        </div>
      ) : (
        <dl>
          <ReadRow label="Nome" value={b.name} />
          <ReadRow label="Resumo" value={b.description} />
        </dl>
      )}
    </SectionShell>
  )
}

function AudienciaSection({
  strategyId,
  b,
}: {
  strategyId: string
  b: Briefing
}) {
  const initial = useMemo(
    () => ({
      audience: b.audience ?? "",
      persona: b.persona ?? "",
      painPoints: b.painPoints ?? [],
      jargon: b.jargon ?? [],
    }),
    [b.audience, b.persona, b.painPoints, b.jargon],
  )
  const { draft, setDraft, editing, setEditing } = useSectionState(initial)
  const pending = getSuggestionsForSection(strategyId, "audiencia")
  const completeness = sectionCompleteness(b, "audiencia")

  return (
    <SectionShell
      id="audiencia"
      title="Audiência"
      description="Para quem essa estratégia escreve."
      completeness={completeness}
      suggestions={pending}
      onAccept={(id) => acceptSuggestion(strategyId, id)}
      onDismiss={(id) => dismissSuggestion(strategyId, id)}
      editing={editing}
      onToggleEdit={() => {
        setDraft(initial)
        setEditing(true)
      }}
      onCancel={() => setEditing(false)}
      onSave={() => {
        updateBriefing(strategyId, draft, { section: "audiencia" })
        setEditing(false)
      }}
    >
      {editing ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="brief-audience">Público principal</Label>
            <Input
              id="brief-audience"
              value={draft.audience ?? ""}
              onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brief-persona">Persona</Label>
            <Textarea
              id="brief-persona"
              rows={2}
              placeholder="Descreva a persona principal em 1-2 frases"
              value={draft.persona ?? ""}
              onChange={(e) => setDraft({ ...draft, persona: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Dores e objeções</Label>
            <TagInput
              value={draft.painPoints ?? []}
              onChange={(v) => setDraft({ ...draft, painPoints: v })}
              placeholder="Ex.: medo de dor"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Jargão do público</Label>
            <TagInput
              value={draft.jargon ?? []}
              onChange={(v) => setDraft({ ...draft, jargon: v })}
              placeholder="Ex.: clareamento"
            />
          </div>
        </div>
      ) : (
        <dl>
          <ReadRow label="Público" value={b.audience} />
          <ReadRow label="Persona" value={b.persona} />
          <ReadRow label="Dores" value={b.painPoints} />
          <ReadRow label="Jargão" value={b.jargon} />
        </dl>
      )}
    </SectionShell>
  )
}

function ObjetivoSection({
  strategyId,
  b,
}: {
  strategyId: string
  b: Briefing
}) {
  const initial = useMemo(
    () => ({
      goal: b.goal ?? "",
      kpi: b.kpi,
      kpiTarget: b.kpiTarget ?? "",
      kpiDeadline: b.kpiDeadline ?? "",
    }),
    [b.goal, b.kpi, b.kpiTarget, b.kpiDeadline],
  )
  const { draft, setDraft, editing, setEditing } = useSectionState(initial)
  const pending = getSuggestionsForSection(strategyId, "objetivo")
  const completeness = sectionCompleteness(b, "objetivo")

  const kpiLabel: Record<string, string> = {
    trafego: "Tráfego orgânico",
    leads: "Leads",
    agendamentos: "Agendamentos",
  }

  return (
    <SectionShell
      id="objetivo"
      title="Objetivo"
      description="Qual resultado esta estratégia busca."
      completeness={completeness}
      suggestions={pending}
      onAccept={(id) => acceptSuggestion(strategyId, id)}
      onDismiss={(id) => dismissSuggestion(strategyId, id)}
      editing={editing}
      onToggleEdit={() => {
        setDraft(initial)
        setEditing(true)
      }}
      onCancel={() => setEditing(false)}
      onSave={() => {
        updateBriefing(strategyId, draft, { section: "objetivo" })
        setEditing(false)
      }}
    >
      {editing ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="brief-goal">Meta qualitativa</Label>
            <Input
              id="brief-goal"
              value={draft.goal ?? ""}
              onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>KPI alvo</Label>
              <Select
                value={draft.kpi}
                onValueChange={(v) =>
                  setDraft({ ...draft, kpi: v as Briefing["kpi"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolher KPI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trafego">Tráfego orgânico</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="agendamentos">Agendamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brief-target">Alvo</Label>
              <Input
                id="brief-target"
                placeholder="Ex.: 30k sessões/mês"
                value={draft.kpiTarget ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, kpiTarget: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brief-deadline">Prazo</Label>
              <Input
                id="brief-deadline"
                type="date"
                value={draft.kpiDeadline ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, kpiDeadline: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <dl>
          <ReadRow label="Meta" value={b.goal} />
          <ReadRow
            label="KPI"
            value={b.kpi ? kpiLabel[b.kpi] : undefined}
          />
          <ReadRow label="Alvo" value={b.kpiTarget} />
          <ReadRow label="Prazo" value={b.kpiDeadline} />
        </dl>
      )}
    </SectionShell>
  )
}

function VozSection({ strategyId, b }: { strategyId: string; b: Briefing }) {
  const initial = useMemo(
    () => ({
      tone: b.tone ?? "",
      person: b.person,
      formality: b.formality ?? 3,
      avgLength: b.avgLength,
      dos: b.dos ?? [],
      donts: b.donts ?? [],
    }),
    [b.tone, b.person, b.formality, b.avgLength, b.dos, b.donts],
  )
  const { draft, setDraft, editing, setEditing } = useSectionState(initial)
  const pending = getSuggestionsForSection(strategyId, "voz")
  const completeness = sectionCompleteness(b, "voz")

  const personLabel: Record<string, string> = {
    "primeira-plural": "Nós (1ª pessoa plural)",
    "primeira-singular": "Eu (1ª pessoa singular)",
    terceira: "Ele/ela (3ª pessoa)",
  }
  const lengthLabel: Record<string, string> = {
    curto: "Curto (~600 palavras)",
    medio: "Médio (~1200 palavras)",
    longo: "Longo (~2000 palavras)",
  }

  return (
    <SectionShell
      id="voz"
      title="Voz & estilo"
      description="Como os artigos falam com o leitor."
      completeness={completeness}
      suggestions={pending}
      onAccept={(id) => acceptSuggestion(strategyId, id)}
      onDismiss={(id) => dismissSuggestion(strategyId, id)}
      editing={editing}
      onToggleEdit={() => {
        setDraft(initial)
        setEditing(true)
      }}
      onCancel={() => setEditing(false)}
      onSave={() => {
        updateBriefing(strategyId, draft, { section: "voz" })
        setEditing(false)
      }}
    >
      {editing ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brief-tone">Tom</Label>
              <Input
                id="brief-tone"
                placeholder="Ex.: profissional e acolhedor"
                value={draft.tone ?? ""}
                onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pessoa gramatical</Label>
              <Select
                value={draft.person}
                onValueChange={(v) =>
                  setDraft({ ...draft, person: v as Briefing["person"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primeira-plural">
                    Nós (1ª plural)
                  </SelectItem>
                  <SelectItem value="primeira-singular">
                    Eu (1ª singular)
                  </SelectItem>
                  <SelectItem value="terceira">Ele/ela (3ª pessoa)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Formalidade</Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {draft.formality}/5 ·{" "}
                  {draft.formality === undefined
                    ? "—"
                    : draft.formality <= 2
                      ? "informal"
                      : draft.formality >= 4
                        ? "formal"
                        : "equilibrado"}
                </span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[draft.formality ?? 3]}
                onValueChange={([v]) => setDraft({ ...draft, formality: v })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tamanho médio</Label>
              <Select
                value={draft.avgLength}
                onValueChange={(v) =>
                  setDraft({ ...draft, avgLength: v as Briefing["avgLength"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curto">Curto (~600 palavras)</SelectItem>
                  <SelectItem value="medio">Médio (~1200 palavras)</SelectItem>
                  <SelectItem value="longo">Longo (~2000 palavras)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>O que fazer</Label>
              <TagInput
                value={draft.dos ?? []}
                onChange={(v) => setDraft({ ...draft, dos: v })}
                placeholder="Ex.: usar dados e fontes"
              />
            </div>
            <div className="space-y-1.5">
              <Label>O que evitar</Label>
              <TagInput
                value={draft.donts ?? []}
                onChange={(v) => setDraft({ ...draft, donts: v })}
                placeholder="Ex.: jargão sem explicar"
              />
            </div>
          </div>
        </div>
      ) : (
        <dl>
          <ReadRow label="Tom" value={b.tone} />
          <ReadRow
            label="Pessoa"
            value={b.person ? personLabel[b.person] : undefined}
          />
          <ReadRow
            label="Formalidade"
            value={
              b.formality ? (
                <span className="tabular-nums">{b.formality}/5</span>
              ) : undefined
            }
          />
          <ReadRow
            label="Tamanho médio"
            value={b.avgLength ? lengthLabel[b.avgLength] : undefined}
          />
          <ReadRow label="Fazer" value={b.dos} />
          <ReadRow label="Evitar" value={b.donts} />
        </dl>
      )}
    </SectionShell>
  )
}

function DiferenciaisSection({
  strategyId,
  b,
}: {
  strategyId: string
  b: Briefing
}) {
  const initial = useMemo(
    () => ({ usps: b.usps ?? [], proofs: b.proofs ?? [] }),
    [b.usps, b.proofs],
  )
  const { draft, setDraft, editing, setEditing } = useSectionState(initial)
  const pending = getSuggestionsForSection(strategyId, "diferenciais")
  const completeness = sectionCompleteness(b, "diferenciais")

  return (
    <SectionShell
      id="diferenciais"
      title="Diferenciais & provas"
      description="O que a IA pode usar como argumento e citar como prova."
      completeness={completeness}
      suggestions={pending}
      onAccept={(id) => acceptSuggestion(strategyId, id)}
      onDismiss={(id) => dismissSuggestion(strategyId, id)}
      editing={editing}
      onToggleEdit={() => {
        setDraft(initial)
        setEditing(true)
      }}
      onCancel={() => setEditing(false)}
      onSave={() => {
        updateBriefing(strategyId, draft, { section: "diferenciais" })
        setEditing(false)
      }}
    >
      {editing ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Diferenciais (USPs)</Label>
            <TagInput
              value={draft.usps ?? []}
              onChange={(v) => setDraft({ ...draft, usps: v })}
              placeholder="Ex.: atendimento no mesmo dia"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Provas sociais</Label>
            <TagInput
              value={draft.proofs ?? []}
              onChange={(v) => setDraft({ ...draft, proofs: v })}
              placeholder="Ex.: 4.9 estrelas no Google"
            />
          </div>
        </div>
      ) : (
        <dl>
          <ReadRow label="Diferenciais" value={b.usps} />
          <ReadRow label="Provas" value={b.proofs} />
        </dl>
      )}
    </SectionShell>
  )
}

function CTASection({ strategyId, b }: { strategyId: string; b: Briefing }) {
  const initial = useMemo(
    () => ({ ctaText: b.ctaText ?? "", ctaLink: b.ctaLink ?? "" }),
    [b.ctaText, b.ctaLink],
  )
  const { draft, setDraft, editing, setEditing } = useSectionState(initial)
  const pending = getSuggestionsForSection(strategyId, "cta")
  const completeness = sectionCompleteness(b, "cta")

  return (
    <SectionShell
      id="cta"
      title="CTA padrão"
      description="Chamada usada ao final de cada artigo gerado."
      completeness={completeness}
      suggestions={pending}
      onAccept={(id) => acceptSuggestion(strategyId, id)}
      onDismiss={(id) => dismissSuggestion(strategyId, id)}
      editing={editing}
      onToggleEdit={() => {
        setDraft(initial)
        setEditing(true)
      }}
      onCancel={() => setEditing(false)}
      onSave={() => {
        updateBriefing(strategyId, draft, { section: "cta" })
        setEditing(false)
      }}
    >
      {editing ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="brief-cta-text">Texto do CTA</Label>
            <Input
              id="brief-cta-text"
              placeholder="Ex.: Agendar avaliação gratuita"
              value={draft.ctaText ?? ""}
              onChange={(e) => setDraft({ ...draft, ctaText: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brief-cta-link">Link</Label>
            <Input
              id="brief-cta-link"
              placeholder="https://"
              value={draft.ctaLink ?? ""}
              onChange={(e) => setDraft({ ...draft, ctaLink: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <dl>
          <ReadRow label="Texto" value={b.ctaText} />
          <ReadRow label="Link" value={b.ctaLink} />
        </dl>
      )}
    </SectionShell>
  )
}

function LimitesSection({
  strategyId,
  b,
}: {
  strategyId: string
  b: Briefing
}) {
  const initial = useMemo(
    () => ({ avoid: b.avoid ?? [] }),
    [b.avoid],
  )
  const { draft, setDraft, editing, setEditing } = useSectionState(initial)
  const pending = getSuggestionsForSection(strategyId, "limites")
  const completeness = sectionCompleteness(b, "limites")

  return (
    <SectionShell
      id="limites"
      title="Limites"
      description="Temas ou abordagens a não incluir nesta estratégia."
      completeness={completeness}
      suggestions={pending}
      onAccept={(id) => acceptSuggestion(strategyId, id)}
      onDismiss={(id) => dismissSuggestion(strategyId, id)}
      editing={editing}
      onToggleEdit={() => {
        setDraft(initial)
        setEditing(true)
      }}
      onCancel={() => setEditing(false)}
      onSave={() => {
        updateBriefing(strategyId, draft, { section: "limites" })
        setEditing(false)
      }}
    >
      {editing ? (
        <div className="space-y-1.5">
          <Label>Assuntos a evitar</Label>
          <TagInput
            value={draft.avoid ?? []}
            onChange={(v) => setDraft({ ...draft, avoid: v })}
            placeholder="Ex.: comparações diretas com concorrentes"
          />
          <p className="text-xs text-muted-foreground">
            Palavras e tópicos banidos gerenciados na aba Palavras-chave também
            afetam esta estratégia.
          </p>
        </div>
      ) : (
        <dl>
          <ReadRow label="Evitar" value={b.avoid} />
        </dl>
      )}
    </SectionShell>
  )
}

function CadenciaSection({
  strategyId,
  b,
}: {
  strategyId: string
  b: Briefing
}) {
  const initial = useMemo(
    () => ({
      frequency: b.frequency,
      preferredDays: b.preferredDays ?? [],
      channels: b.channels ?? [],
    }),
    [b.frequency, b.preferredDays, b.channels],
  )
  const { draft, setDraft, editing, setEditing } = useSectionState(initial)
  const pending = getSuggestionsForSection(strategyId, "cadencia")
  const completeness = sectionCompleteness(b, "cadencia")

  const freqLabel: Record<string, string> = {
    diaria: "Diária",
    semanal: "Semanal",
    quinzenal: "Quinzenal",
    mensal: "Mensal",
  }

  const daysList = [
    "segunda",
    "terça",
    "quarta",
    "quinta",
    "sexta",
    "sábado",
    "domingo",
  ]

  return (
    <SectionShell
      id="cadencia"
      title="Cadência & canais"
      description="Com que frequência e onde esta estratégia publica."
      completeness={completeness}
      suggestions={pending}
      onAccept={(id) => acceptSuggestion(strategyId, id)}
      onDismiss={(id) => dismissSuggestion(strategyId, id)}
      editing={editing}
      onToggleEdit={() => {
        setDraft(initial)
        setEditing(true)
      }}
      onCancel={() => setEditing(false)}
      onSave={() => {
        updateBriefing(strategyId, draft, { section: "cadencia" })
        setEditing(false)
      }}
    >
      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Frequência</Label>
              <Select
                value={draft.frequency}
                onValueChange={(v) =>
                  setDraft({ ...draft, frequency: v as Briefing["frequency"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diaria">Diária</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Canais</Label>
              <TagInput
                value={draft.channels ?? []}
                onChange={(v) => setDraft({ ...draft, channels: v })}
                placeholder="Ex.: Blog, Newsletter"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dias preferidos</Label>
            <div className="flex flex-wrap gap-1.5">
              {daysList.map((d) => {
                const selected = (draft.preferredDays ?? []).includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const cur = draft.preferredDays ?? []
                      setDraft({
                        ...draft,
                        preferredDays: selected
                          ? cur.filter((x) => x !== d)
                          : [...cur, d],
                      })
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs capitalize",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <dl>
          <ReadRow
            label="Frequência"
            value={b.frequency ? freqLabel[b.frequency] : undefined}
          />
          <ReadRow label="Dias preferidos" value={b.preferredDays} />
          <ReadRow label="Canais" value={b.channels} />
        </dl>
      )}
    </SectionShell>
  )
}

