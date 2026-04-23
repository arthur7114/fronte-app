"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  CalendarDays,
  Check,
  ExternalLink,
  FileText,
  Hash,
  MessageCircle,
  Pencil,
  Star,
  Target,
  Users,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { KeywordItem, Strategy, TopicItem } from "@/lib/strategies"
import { updateStrategy } from "@/app/dashboard/estrategias/actions"

type StrategyBriefingProps = {
  strategy: Strategy
  keywords: KeywordItem[]
  topics: TopicItem[]
}

type ChecklistItem = {
  label: string
  done: boolean
  filled: number
  total: number
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim())
}

// -------------------------------------------------------
// Section edit state helpers
// -------------------------------------------------------

type SectionId =
  | "identidade"
  | "audiencia"
  | "objetivo"
  | "voz"
  | "diferenciais"
  | "cta"
  | "limites"

// -------------------------------------------------------
// Root component
// -------------------------------------------------------

export function StrategyBriefing({
  strategy: initialStrategy,
  keywords,
  topics,
}: StrategyBriefingProps) {
  const [strategy, setStrategy] = useState<Strategy>(initialStrategy)
  const [editingSection, setEditingSection] = useState<SectionId | null>(null)
  const [isPending, startTransition] = useTransition()

  function openSection(id: SectionId) {
    setEditingSection(id)
  }
  function closeSection() {
    setEditingSection(null)
  }

  async function save(id: SectionId, patch: Partial<Strategy>) {
    const updated = { ...strategy, ...patch }
    setStrategy(updated)
    closeSection()

    // Map Strategy fields back to DB column names
    const dbPatch: Record<string, unknown> = {}
    if ("name" in patch) dbPatch.name = patch.name
    if ("description" in patch) dbPatch.description = patch.description
    if ("tone" in patch) dbPatch.tone = patch.tone
    if ("audience" in patch) dbPatch.audience = patch.audience
    if ("persona" in patch) dbPatch.persona = patch.persona
    if ("goal" in patch) dbPatch.goal = patch.goal
    if ("cadence" in patch) dbPatch.cadence = patch.cadence
    if ("differentiators" in patch) dbPatch.differentiators = patch.differentiators
    if ("ctaText" in patch) dbPatch.cta_text = patch.ctaText
    if ("ctaLink" in patch) dbPatch.cta_link = patch.ctaLink
    if ("restrictions" in patch) dbPatch.restrictions = patch.restrictions

    startTransition(async () => {
      const result = await updateStrategy(strategy.id, dbPatch)
      if (result && "error" in result) {
        toast.error("Erro ao salvar: " + result.error)
        setStrategy(initialStrategy) // revert
      } else {
        toast.success("Briefing atualizado")
      }
    })
  }

  const checklist: ChecklistItem[] = [
    {
      label: "Identidade",
      done: hasText(strategy.name) && hasText(strategy.description),
      filled: Number(hasText(strategy.name)) + Number(hasText(strategy.description)),
      total: 2,
    },
    {
      label: "Audiência",
      done: hasText(strategy.audience),
      filled: Number(hasText(strategy.audience)) + Number(hasText(strategy.persona)),
      total: 2,
    },
    {
      label: "Objetivo",
      done: hasText(strategy.goal),
      filled: Number(hasText(strategy.goal)),
      total: 1,
    },
    {
      label: "Voz",
      done: hasText(strategy.tone),
      filled: Number(hasText(strategy.tone)) + Number(strategy.cadence > 0),
      total: 2,
    },
    {
      label: "Diferenciais",
      done: hasText(strategy.differentiators),
      filled: Number(hasText(strategy.differentiators)),
      total: 1,
    },
    {
      label: "CTA",
      done: hasText(strategy.ctaText),
      filled: Number(hasText(strategy.ctaText)) + Number(hasText(strategy.ctaLink)),
      total: 2,
    },
    {
      label: "Limites",
      done: hasText(strategy.restrictions),
      filled: Number(hasText(strategy.restrictions)),
      total: 1,
    },
    {
      label: "Base editorial",
      done: keywords.length > 0 || topics.length > 0,
      filled: Number(keywords.length > 0) + Number(topics.length > 0),
      total: 2,
    },
  ]

  const filled = checklist.reduce((sum, item) => sum + item.filled, 0)
  const total = checklist.reduce((sum, item) => sum + item.total, 0)
  const completeness = Math.round((filled / total) * 100)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        {/* Overview */}
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Briefing da estratégia</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Contexto que a IA usa para sugerir keywords, tópicos e artigos.
              </p>
            </div>
            <div className="min-w-[180px]">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Preenchimento</span>
                <span className="font-medium tabular-nums text-foreground">{completeness}%</span>
              </div>
              <Progress value={completeness} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Identidade */}
        <EditableSection
          id="identidade"
          title="Identidade"
          description="Como a estratégia é reconhecida pela IA."
          icon={FileText}
          editing={editingSection === "identidade"}
          saving={isPending}
          onEdit={() => openSection("identidade")}
          onCancel={closeSection}
          readContent={
            <>
              <ReadRow label="Nome" value={strategy.name} />
              <ReadRow label="Resumo" value={strategy.description} />
            </>
          }
          editContent={
            <IdentidadeForm
              strategy={strategy}
              onSave={(patch) => save("identidade", patch)}
              onCancel={closeSection}
              saving={isPending}
            />
          }
        />

        {/* Audiência */}
        <EditableSection
          id="audiencia"
          title="Audiência"
          description="Para quem os artigos desta estratégia serão escritos."
          icon={Users}
          editing={editingSection === "audiencia"}
          saving={isPending}
          onEdit={() => openSection("audiencia")}
          onCancel={closeSection}
          readContent={
            <>
              <ReadRow label="Público principal" value={strategy.audience} />
              <ReadRow label="Persona" value={strategy.persona} />
            </>
          }
          editContent={
            <AudienciaForm
              strategy={strategy}
              onSave={(patch) => save("audiencia", patch)}
              onCancel={closeSection}
              saving={isPending}
            />
          }
        />

        {/* Objetivo */}
        <EditableSection
          id="objetivo"
          title="Objetivo"
          description="Resultado esperado para orientar pesquisa, estrutura e CTA."
          icon={Target}
          editing={editingSection === "objetivo"}
          saving={isPending}
          onEdit={() => openSection("objetivo")}
          onCancel={closeSection}
          readContent={<ReadRow label="Meta" value={strategy.goal} />}
          editContent={
            <ObjetivoForm
              strategy={strategy}
              onSave={(patch) => save("objetivo", patch)}
              onCancel={closeSection}
              saving={isPending}
            />
          }
        />

        {/* Voz */}
        <EditableSection
          id="voz"
          title="Voz & Cadência"
          description="Tom usado como base para briefs e artigos."
          icon={MessageCircle}
          editing={editingSection === "voz"}
          saving={isPending}
          onEdit={() => openSection("voz")}
          onCancel={closeSection}
          readContent={
            <>
              <ReadRow label="Tom" value={strategy.tone} />
              <ReadRow
                label="Cadência"
                value={strategy.cadence > 0 ? `${strategy.cadence} artigo${strategy.cadence > 1 ? "s" : ""} por mês` : undefined}
              />
            </>
          }
          editContent={
            <VozForm
              strategy={strategy}
              onSave={(patch) => save("voz", patch)}
              onCancel={closeSection}
              saving={isPending}
            />
          }
        />

        {/* Diferenciais */}
        <EditableSection
          id="diferenciais"
          title="Diferenciais"
          description="Vantagens competitivas e provas sociais para reforçar nos artigos."
          icon={Star}
          editing={editingSection === "diferenciais"}
          saving={isPending}
          onEdit={() => openSection("diferenciais")}
          onCancel={closeSection}
          readContent={<ReadRow label="Diferenciais" value={strategy.differentiators} />}
          editContent={
            <DiferenciaisForm
              strategy={strategy}
              onSave={(patch) => save("diferenciais", patch)}
              onCancel={closeSection}
              saving={isPending}
            />
          }
        />

        {/* CTA */}
        <EditableSection
          id="cta"
          title="CTA Padrão"
          description="Call-to-action padrão para os artigos desta estratégia."
          icon={ExternalLink}
          editing={editingSection === "cta"}
          saving={isPending}
          onEdit={() => openSection("cta")}
          onCancel={closeSection}
          readContent={
            <>
              <ReadRow label="Texto" value={strategy.ctaText} />
              <ReadRow label="Link" value={strategy.ctaLink} />
            </>
          }
          editContent={
            <CtaForm
              strategy={strategy}
              onSave={(patch) => save("cta", patch)}
              onCancel={closeSection}
              saving={isPending}
            />
          }
        />

        {/* Limites */}
        <EditableSection
          id="limites"
          title="Limites"
          description="Assuntos, abordagens ou formatos que a IA deve evitar."
          icon={X}
          editing={editingSection === "limites"}
          saving={isPending}
          onEdit={() => openSection("limites")}
          onCancel={closeSection}
          readContent={<ReadRow label="A evitar" value={strategy.restrictions} />}
          editContent={
            <LimitesForm
              strategy={strategy}
              onSave={(patch) => save("limites", patch)}
              onCancel={closeSection}
              saving={isPending}
            />
          }
        />

        {/* Base editorial — read-only, derived */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-3 pb-3">
            <Hash className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <h3 className="text-base font-semibold text-foreground">Base editorial</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Insumos reais conectados a esta estratégia.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="space-y-1">
              <ReadRow label="Palavras-chave" value={`${keywords.length} cadastradas`} />
              <ReadRow label="Tópicos" value={`${topics.length} cadastrados`} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Checklist
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5 text-sm">
              {checklist.map((item) => (
                <li key={item.label}>
                  <span className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border",
                          item.done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-transparent",
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-foreground">{item.label}</span>
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {item.filled}/{item.total}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <CalendarDays className="mb-2 h-4 w-4 text-primary" />
              Última atualização:{" "}
              {new Date(initialStrategy.lastUpdated).toLocaleDateString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Próxima ação
            </p>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {topics.length > 0
              ? "Use um tópico aprovado para gerar o próximo artigo desta estratégia."
              : "Aprove palavras-chave e tópicos antes de iniciar produção em escala."}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

// -------------------------------------------------------
// Generic editable section wrapper
// -------------------------------------------------------

function EditableSection({
  title,
  description,
  icon: Icon,
  editing,
  saving,
  onEdit,
  onCancel,
  readContent,
  editContent,
}: {
  id: SectionId
  title: string
  description: string
  icon: typeof FileText
  editing: boolean
  saving: boolean
  onEdit: () => void
  onCancel: () => void
  readContent: React.ReactNode
  editContent: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex min-w-0 items-start gap-2">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-muted-foreground"
            onClick={onEdit}
            disabled={saving}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {editing ? editContent : <dl className="space-y-1">{readContent}</dl>}
      </CardContent>
    </Card>
  )
}

// -------------------------------------------------------
// Read row
// -------------------------------------------------------

function ReadRow({ label, value }: { label: string; value?: string }) {
  const empty = !value?.trim()
  return (
    <div className="grid grid-cols-1 gap-1 py-1.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-start md:gap-4">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">
        {empty ? <span className="italic text-muted-foreground">Não preenchido</span> : value}
      </dd>
    </div>
  )
}

// -------------------------------------------------------
// Form actions row
// -------------------------------------------------------

function FormActions({
  onCancel,
  saving,
}: {
  onCancel: () => void
  saving: boolean
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
        Cancelar
      </Button>
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Salvando…" : "Salvar"}
      </Button>
    </div>
  )
}

// -------------------------------------------------------
// Section forms
// -------------------------------------------------------

function IdentidadeForm({
  strategy,
  onSave,
  onCancel,
  saving,
}: {
  strategy: Strategy
  onSave: (patch: Partial<Strategy>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [name, setName] = useState(strategy.name)
  const [description, setDescription] = useState(strategy.description)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ name: name.trim(), description: description.trim() })
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="strat-name">Nome</Label>
        <Input
          id="strat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: SEO Local São Paulo"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="strat-desc">Resumo</Label>
        <Textarea
          id="strat-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o foco e propósito desta estratégia"
          rows={3}
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  )
}

function AudienciaForm({
  strategy,
  onSave,
  onCancel,
  saving,
}: {
  strategy: Strategy
  onSave: (patch: Partial<Strategy>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [audience, setAudience] = useState(strategy.audience)
  const [persona, setPersona] = useState(strategy.persona)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ audience: audience.trim(), persona: persona.trim() })
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="strat-audience">Público principal</Label>
        <Textarea
          id="strat-audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Ex: Donos de pequenas clínicas odontológicas no Brasil"
          rows={2}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="strat-persona">Persona</Label>
        <Textarea
          id="strat-persona"
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          placeholder="Descreva a persona principal em 1-2 frases"
          rows={2}
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  )
}

function ObjetivoForm({
  strategy,
  onSave,
  onCancel,
  saving,
}: {
  strategy: Strategy
  onSave: (patch: Partial<Strategy>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [goal, setGoal] = useState(strategy.goal)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ goal: goal.trim() })
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="strat-goal">Meta principal</Label>
        <Textarea
          id="strat-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Ex: Aumentar tráfego orgânico qualificado em 3x nos próximos 6 meses"
          rows={3}
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  )
}

function VozForm({
  strategy,
  onSave,
  onCancel,
  saving,
}: {
  strategy: Strategy
  onSave: (patch: Partial<Strategy>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [tone, setTone] = useState(strategy.tone)
  const [cadence, setCadence] = useState(String(strategy.cadence || ""))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ tone: tone.trim(), cadence: Number(cadence) || 0 })
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="strat-tone">Tom de voz</Label>
        <Input
          id="strat-tone"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="Ex: Profissional e acessível, sem jargão técnico"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="strat-cadence">Cadência (artigos por mês)</Label>
        <Input
          id="strat-cadence"
          type="number"
          min={0}
          max={100}
          value={cadence}
          onChange={(e) => setCadence(e.target.value)}
          placeholder="Ex: 8"
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  )
}

function DiferenciaisForm({
  strategy,
  onSave,
  onCancel,
  saving,
}: {
  strategy: Strategy
  onSave: (patch: Partial<Strategy>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [differentiators, setDifferentiators] = useState(strategy.differentiators)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ differentiators: differentiators.trim() })
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="strat-diff">Diferenciais e provas sociais</Label>
        <Textarea
          id="strat-diff"
          value={differentiators}
          onChange={(e) => setDifferentiators(e.target.value)}
          placeholder="Ex: Mais de 10 anos de experiência, 500+ clientes atendidos, certificação ISO"
          rows={4}
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  )
}

function CtaForm({
  strategy,
  onSave,
  onCancel,
  saving,
}: {
  strategy: Strategy
  onSave: (patch: Partial<Strategy>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [ctaText, setCtaText] = useState(strategy.ctaText)
  const [ctaLink, setCtaLink] = useState(strategy.ctaLink)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ ctaText: ctaText.trim(), ctaLink: ctaLink.trim() })
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="strat-cta-text">Texto do CTA</Label>
        <Input
          id="strat-cta-text"
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          placeholder="Ex: Agende uma consulta gratuita"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="strat-cta-link">Link de destino</Label>
        <Input
          id="strat-cta-link"
          type="url"
          value={ctaLink}
          onChange={(e) => setCtaLink(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  )
}

function LimitesForm({
  strategy,
  onSave,
  onCancel,
  saving,
}: {
  strategy: Strategy
  onSave: (patch: Partial<Strategy>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [restrictions, setRestrictions] = useState(strategy.restrictions)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ restrictions: restrictions.trim() })
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="strat-restrictions">Assuntos ou abordagens a evitar</Label>
        <Textarea
          id="strat-restrictions"
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
          placeholder="Ex: Não mencionar concorrentes pelo nome. Evitar linguagem muito técnica. Não fazer promessas de resultado."
          rows={4}
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  )
}
