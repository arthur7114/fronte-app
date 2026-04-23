"use client"

import { ExternalLink, Globe, Search, Trophy, TrendingUp } from "lucide-react"
import type { Tables } from "@super/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Strategy } from "@/lib/strategies"

type Competitor = Tables<"workspace_competitors">

type CompetitorResearchProps = {
  strategy: Strategy
  competitors: Competitor[]
  onContinueToTopics?: () => void
}

export function CompetitorResearch({
  strategy,
  competitors,
  onContinueToTopics,
}: CompetitorResearchProps) {
  const totalScore = competitors.reduce((sum, competitor) => sum + competitor.frequency_score, 0)
  const topScore = Math.max(...competitors.map((competitor) => competitor.frequency_score), 1)

  if (competitors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Nenhum concorrente detectado</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Concorrentes aparecem aqui quando pesquisas de keywords encontram domínios recorrentes no Top 10.
            </p>
          </div>
          <Button variant="outline" className="mt-2 gap-2" onClick={onContinueToTopics}>
            <Search className="h-4 w-4" />
            Ver tópicos da estratégia
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-muted/20">
        <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Pesquisa de concorrentes</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Share of Voice orgânico agregado para o workspace, aplicado à estratégia {strategy.name}.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {competitors.length} domínios rastreados
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Share of Voice orgânico
          </CardTitle>
          <CardDescription>
            Domínios que mais aparecem nas pesquisas relacionadas ao seu workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {competitors.map((competitor, index) => {
              const share = totalScore > 0 ? (competitor.frequency_score / totalScore) * 100 : 0
              const progress = (competitor.frequency_score / topScore) * 100

              return (
                <div key={competitor.id} className="group">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <a
                        href={`https://${competitor.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
                      >
                        <span className="truncate">{competitor.domain}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </a>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {share.toFixed(1)}%
                      </span>
                      <Badge variant="secondary" className="font-mono">
                        {competitor.frequency_score}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
