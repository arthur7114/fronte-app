"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react"
import { CompetitorForm, type FormValues } from "./competitor-form"
import { CompetitorProgress } from "./competitor-progress"
import { CompetitorResults } from "./competitor-results"
import { CompetitorDetailSheet } from "./competitor-detail-sheet"
import { SavedInsights } from "./saved-insights"
import type { Strategy } from "@/lib/strategies"
import {
  getCompetitorsFor,
  getInsightsFor,
  getLatestRun,
  getOpportunitiesFor,
  recordRun,
  useCompetitorsStore,
  type Competitor,
} from "@/lib/competitors-store"

type Phase = "idle" | "running" | "results"

type Props = {
  strategy: Strategy
  onContinueToTopics?: () => void
}

export function CompetitorResearch({ strategy, onContinueToTopics }: Props) {
  useCompetitorsStore()
  const latestRun = getLatestRun(strategy.id)
  const hasData = !!latestRun && getCompetitorsFor(strategy.id).length > 0

  const [phase, setPhase] = useState<Phase>(hasData ? "results" : "idle")
  const [selected, setSelected] = useState<Competitor | null>(null)
  const [lastConfig, setLastConfig] = useState<FormValues | null>(null)

  const competitors = useMemo(
    () => getCompetitorsFor(strategy.id),
    [strategy.id, phase],
  )
  const opportunities = useMemo(
    () => getOpportunitiesFor(strategy.id),
    [strategy.id, phase],
  )
  const insights = getInsightsFor(strategy.id)

  const start = (values: FormValues) => {
    setLastConfig(values)
    setPhase("running")
  }

  const finish = () => {
    if (lastConfig) {
      recordRun({
        strategyId: strategy.id,
        runAt: new Date().toISOString().slice(0, 10),
        niche: lastConfig.niche,
        region: lastConfig.region,
        depth: lastConfig.depth,
        period: lastConfig.period,
        channels: lastConfig.channels,
        status: "completed",
      })
    }
    setPhase("results")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Coluna principal */}
      <div className="space-y-5">
        {/* Resumo da execução atual + ações */}
        {phase === "results" && latestRun && (
          <RunSummary
            run={latestRun}
            onNew={() => setPhase("idle")}
            onRerun={() => lastConfig && start(lastConfig)}
          />
        )}

        {phase === "idle" && (
          <>
            {hasData ? (
              <EmptyPicker
                onConfigure={() => setPhase("idle")}
                onQuickRun={() => {
                  // rodar com os últimos parâmetros conhecidos
                  start({
                    niche: latestRun?.niche ?? "",
                    region: latestRun?.region ?? "",
                    competitors: [],
                    keywords: [],
                    channels: latestRun?.channels ?? ["Blog", "SEO"],
                    depth: latestRun?.depth ?? "padrão",
                    period: latestRun?.period ?? 90,
                  })
                }}
              />
            ) : (
              <EmptyState />
            )}
            <CompetitorForm strategy={strategy} onSubmit={start} />
          </>
        )}

        {phase === "running" && <CompetitorProgress onDone={finish} />}

        {phase === "results" && (
          <CompetitorResults
            strategyId={strategy.id}
            strategyName={strategy.name}
            competitors={competitors}
            opportunities={opportunities}
            onSelectCompetitor={setSelected}
          />
        )}
      </div>

      {/* Coluna lateral */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <SavedInsights
          insights={insights}
          onContinue={() => onContinueToTopics?.()}
        />
      </aside>

      <CompetitorDetailSheet
        competitor={selected}
        strategyName={strategy.name}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Nenhuma pesquisa rodada ainda
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Configure abaixo e a IA mapeia concorrentes, canais, temas e
            oportunidades para alimentar a estratégia.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyPicker({
  onConfigure,
  onQuickRun,
}: {
  onConfigure: () => void
  onQuickRun: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Rodar nova pesquisa
          </p>
          <p className="text-xs text-muted-foreground">
            Use os últimos parâmetros ou ajuste a configuração abaixo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={onConfigure}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Configurar
          </Button>
          <Button className="gap-2" onClick={onQuickRun}>
            <RefreshCw className="h-3.5 w-3.5" />
            Re-analisar com últimos parâmetros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RunSummary({
  run,
  onNew,
  onRerun,
}: {
  run: ReturnType<typeof getLatestRun>
  onNew: () => void
  onRerun: () => void
}) {
  if (!run) return null
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Pesquisa de {run.runAt}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {run.region}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {run.channels.length} canais · últimos {run.period}d
        </span>
        <span className="capitalize">· análise {run.depth}</span>
      </div>
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              Histórico
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="flex-col items-start gap-0">
              <span className="text-xs font-medium">Pesquisa atual</span>
              <span className="text-[11px] text-muted-foreground">
                {run.runAt} · {run.region}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              Nenhuma execução anterior
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={onRerun}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-analisar
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={onNew}>
          <Search className="h-3.5 w-3.5" />
          Nova pesquisa
        </Button>
      </div>
    </div>
  )
}
