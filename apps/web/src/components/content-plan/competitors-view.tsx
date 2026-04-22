"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Globe, Trophy, TrendingUp } from "lucide-react"

type Competitor = {
  id: string
  domain: string
  frequency_score: number
  last_seen: string
}

export function CompetitorsView({ competitors }: { competitors: Competitor[] }) {
  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Globe className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">Nenhum concorrente detectado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicie pesquisas de palavras-chave para começarmos a mapear o Share of Voice (SoV).
          </p>
        </CardContent>
      </Card>
    )
  }

  // Define total occurrences to calculate SoV
  const totalScore = competitors.reduce((acc, curr) => acc + curr.frequency_score, 0)
  const topCompetitorScore = Math.max(...competitors.map(c => c.frequency_score))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Share of Voice (SoV) Orgânico
        </CardTitle>
        <CardDescription>
          Domínios que mais aparecem no Top 10 para as palavras-chave do seu workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {competitors.map((comp, idx) => {
            const sov = ((comp.frequency_score / totalScore) * 100).toFixed(1)
            const progress = (comp.frequency_score / topCompetitorScore) * 100

            return (
              <div key={comp.id} className="group relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <a
                      href={`https://${comp.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {comp.domain}
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {sov}% SoV
                    </span>
                    <Badge variant="secondary" className="font-mono">
                      {comp.frequency_score} repetições
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
  )
}
