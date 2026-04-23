"use client"

import type React from "react"
import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowUpRight,
  BookmarkCheck,
  BookmarkPlus,
  CheckCircle2,
  Gauge,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  buildComparison,
  saveInsight,
  useCompetitorsStore,
  type Competitor,
  type Opportunity,
} from "@/lib/competitors-store"

type Props = {
  strategyId: string
  strategyName: string
  competitors: Competitor[]
  opportunities: Opportunity[]
  onSelectCompetitor: (c: Competitor) => void
}

export function CompetitorResults({
  strategyId,
  strategyName,
  competitors,
  opportunities,
  onSelectCompetitor,
}: Props) {
  const store = useCompetitorsStore()
  const savedIds = useMemo(
    () =>
      new Set(
        store.savedInsights
          .filter((i) => i.strategyId === strategyId)
          .map((i) => i.sourceId),
      ),
    [store.savedInsights, strategyId],
  )
  const comparison = useMemo(() => buildComparison(strategyId), [strategyId])

  return (
    <div className="space-y-6">
      {/* Mapa competitivo — cards */}
      <section className="space-y-3">
        <SectionHeader
          title="Mapa competitivo"
          description={`${competitors.length} concorrentes analisados`}
          icon={Gauge}
        />
        <div className="grid gap-3 md:grid-cols-3">
          {competitors.map((c) => (
            <CompetitorCard
              key={c.id}
              competitor={c}
              onOpen={() => onSelectCompetitor(c)}
            />
          ))}
        </div>
      </section>

      {/* Comparação */}
      <section className="space-y-3">
        <SectionHeader
          title="Comparação"
          description="Canal dominante, tema e lacuna explorável de cada concorrente"
          icon={TrendingUp}
        />
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="[&_th]:h-10 [&_th]:text-xs [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
                  <TableHead>Concorrente</TableHead>
                  <TableHead>Canal dominante</TableHead>
                  <TableHead>Tema recorrente</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Força</TableHead>
                  <TableHead>Lacuna explorável</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.map((row) => {
                  const sourceId = `cmp-${row.competitorId}`
                  const saved = savedIds.has(sourceId)
                  return (
                    <TableRow key={row.competitorId} className="text-sm">
                      <TableCell className="font-medium">
                        {row.competitor}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.dominantChannel}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.recurringTheme}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.frequency}
                      </TableCell>
                      <TableCell>
                        <StrengthBadge strength={row.strength} />
                      </TableCell>
                      <TableCell className="max-w-[260px] text-muted-foreground">
                        {row.gap}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 gap-1.5 text-xs",
                            saved
                              ? "text-emerald-700"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          disabled={saved}
                          onClick={() =>
                            saveInsight({
                              strategyId,
                              kind: "comparison",
                              title: `Lacuna de ${row.competitor}`,
                              subtitle: row.gap,
                              sourceId,
                            })
                          }
                        >
                          {saved ? (
                            <>
                              <BookmarkCheck className="h-3.5 w-3.5" />
                              Salvo
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="h-3.5 w-3.5" />
                              Salvar insight
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      {/* Oportunidades */}
      <section className="space-y-3">
        <SectionHeader
          title="Oportunidades detectadas"
          description={`Itens acionáveis para ${strategyName}`}
          icon={Sparkles}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {opportunities.map((o) => (
            <OpportunityCard
              key={o.id}
              opportunity={o}
              saved={savedIds.has(o.id)}
              onSave={() =>
                saveInsight({
                  strategyId,
                  kind: "opportunity",
                  title: o.title,
                  subtitle: o.suggestedValue,
                  sourceId: o.id,
                  appliedAs: o.suggestedAs,
                })
              }
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function CompetitorCard({
  competitor,
  onOpen,
}: {
  competitor: Competitor
  onOpen: () => void
}) {
  return (
    <Card
      className="group cursor-pointer transition-colors hover:border-primary/40"
      onClick={onOpen}
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
              {competitor.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-foreground">{competitor.name}</div>
              <div className="text-xs text-muted-foreground">
                {competitor.category}
              </div>
            </div>
          </div>
          <ConfidenceBadge confidence={competitor.confidence} />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <Stat label="Canais fortes">
            <div className="flex flex-wrap gap-1">
              {competitor.channels.slice(0, 3).map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="font-normal"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </Stat>
          <Stat label="Frequência">{competitor.frequency}</Stat>
          <Stat label="Tom">{competitor.tone}</Stat>
          <Stat label="Presença">
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${competitor.presenceScore}%` }}
                />
              </div>
              <span className="tabular-nums text-foreground">
                {competitor.presenceScore}
              </span>
            </div>
          </Stat>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="-mx-1 w-full justify-between gap-1 text-xs text-muted-foreground group-hover:text-foreground"
        >
          Ver perfil detalhado
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-foreground">{children}</div>
    </div>
  )
}

function ConfidenceBadge({
  confidence,
}: {
  confidence: Competitor["confidence"]
}) {
  const map = {
    alta: "border-emerald-200 bg-emerald-50 text-emerald-700",
    média: "border-amber-200 bg-amber-50 text-amber-700",
    baixa: "border-border bg-muted text-muted-foreground",
  } as const
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-normal uppercase tracking-wide", map[confidence])}
    >
      Confiança {confidence}
    </Badge>
  )
}

function StrengthBadge({
  strength,
}: {
  strength: "forte" | "média" | "fraca"
}) {
  const map = {
    forte: "bg-primary/10 text-primary",
    média: "bg-amber-100 text-amber-700",
    fraca: "bg-muted text-muted-foreground",
  } as const
  return (
    <Badge variant="secondary" className={cn("font-normal", map[strength])}>
      {strength}
    </Badge>
  )
}

function OpportunityCard({
  opportunity,
  saved,
  onSave,
}: {
  opportunity: Opportunity
  saved: boolean
  onSave: () => void
}) {
  const ImpactIcon =
    opportunity.impact === "alto" ? TrendingUp : opportunity.impact === "médio" ? Target : CheckCircle2
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ImpactIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {opportunity.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {opportunity.rationale}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
            Impacto <span className="font-medium text-foreground capitalize">{opportunity.impact}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
            Esforço <span className="font-medium text-foreground capitalize">{opportunity.effort}</span>
          </span>
          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 capitalize">
            vira {opportunity.suggestedAs === "topic" ? "tópico" : opportunity.suggestedAs === "keyword" ? "palavra-chave" : "ângulo"}
          </span>
        </div>

        <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed">
          <span className="text-muted-foreground">Sugestão: </span>
          <span className="text-foreground">{opportunity.suggestedValue}</span>
        </div>

        <Button
          size="sm"
          variant={saved ? "secondary" : "default"}
          disabled={saved}
          className="w-full gap-1.5"
          onClick={onSave}
        >
          {saved ? (
            <>
              <BookmarkCheck className="h-3.5 w-3.5" />
              Adicionado à estratégia
            </>
          ) : (
            <>
              <BookmarkPlus className="h-3.5 w-3.5" />
              Adicionar à estratégia
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
