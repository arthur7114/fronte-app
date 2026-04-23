"use client"

import type React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkPlus, ExternalLink, Target, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { saveInsight, type Competitor } from "@/lib/competitors-store"

type Props = {
  competitor: Competitor | null
  strategyName: string
  onClose: () => void
}

export function CompetitorDetailSheet({ competitor, strategyName, onClose }: Props) {
  if (!competitor) return null
  const max = Math.max(...competitor.channelBreakdown.map((c) => c.score), 1)

  return (
    <Sheet open={!!competitor} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-xl"
      >
        {/* Header */}
        <SheetHeader className="space-y-3 border-b border-border px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
                {competitor.name.charAt(0)}
              </div>
              <div>
                <SheetTitle className="text-left text-lg">
                  {competitor.name}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {competitor.category}
                </p>
                {competitor.url && (
                  <a
                    href={`https://${competitor.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    {competitor.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <MiniMetric label="Presença" value={`${competitor.presenceScore}/100`} />
            <MiniMetric label="Frequência" value={competitor.frequency} />
            <MiniMetric label="Tom" value={competitor.tone} />
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="px-6 py-5">
          <TabsList>
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="channels">Canais</TabsTrigger>
            <TabsTrigger value="themes">Temas</TabsTrigger>
            <TabsTrigger value="angles">Conteúdos</TabsTrigger>
            <TabsTrigger value="gaps">Lacunas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-5">
            <section>
              <SectionTitle>Canais fortes</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {competitor.channels.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className={cn(
                      "font-normal",
                      c === competitor.dominantChannel &&
                        "bg-primary/10 text-primary hover:bg-primary/10",
                    )}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </section>
            <section>
              <SectionTitle>Como superar este concorrente</SectionTitle>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
                {competitor.gap} Priorize {competitor.dominantChannel === "Blog" ? "outros canais além do blog" : "aprofundamento técnico no blog"}, com ângulos que o concorrente não usa e cadência superior a{" "}
                <span className="font-medium">{competitor.frequency}</span>.
              </div>
              <Button
                variant="outline"
                className="mt-3 gap-2"
                onClick={() =>
                  saveInsight({
                    strategyId: competitor.strategyId,
                    kind: "competitor",
                    title: `Superar ${competitor.name}`,
                    subtitle: competitor.gap,
                    sourceId: competitor.id,
                  })
                }
              >
                <BookmarkPlus className="h-4 w-4" />
                Salvar como insight
              </Button>
            </section>
          </TabsContent>

          <TabsContent value="channels" className="mt-5">
            <SectionTitle>Presença por canal</SectionTitle>
            <div className="space-y-2.5">
              {competitor.channelBreakdown.map((b) => {
                const pct = Math.round((b.score / max) * 100)
                const dominant = b.channel === competitor.dominantChannel
                return (
                  <div key={b.channel} className="grid grid-cols-[96px_1fr_40px] items-center gap-3">
                    <span
                      className={cn(
                        "text-xs",
                        dominant ? "text-foreground font-medium" : "text-muted-foreground",
                      )}
                    >
                      {b.channel}
                    </span>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          dominant ? "bg-primary" : "bg-foreground/35",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-right text-xs tabular-nums text-muted-foreground">
                      {b.score}
                    </span>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="themes" className="mt-5">
            <SectionTitle>Temas mais repetidos</SectionTitle>
            <ul className="space-y-2">
              {competitor.recurringThemes.map((t) => (
                <li
                  key={t}
                  className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>{t}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground"
                    onClick={() =>
                      saveInsight({
                        strategyId: competitor.strategyId,
                        kind: "comparison",
                        title: `Tema recorrente: ${t}`,
                        subtitle: `Observado em ${competitor.name}`,
                        sourceId: `${competitor.id}-${t}`,
                      })
                    }
                  >
                    <Target className="h-3.5 w-3.5" />
                    Atacar
                  </Button>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="angles" className="mt-5">
            <SectionTitle>Ângulos de conteúdo usados</SectionTitle>
            <ul className="space-y-2">
              {competitor.angles.map((a) => (
                <li
                  key={a}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm leading-relaxed"
                >
                  {a}
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="gaps" className="mt-5 space-y-3">
            <SectionTitle>Lacunas exploráveis</SectionTitle>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              {competitor.gap}
            </div>
            <p className="text-xs text-muted-foreground">
              Esse insight ficará disponível para{" "}
              <span className="font-medium text-foreground">{strategyName}</span>.
            </p>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  )
}
