import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Eye, ExternalLink } from "lucide-react"

export interface TopPerformingData {
  id: string | number
  title: string
  views: string
  position: number
  change: string
}

export interface WorstPerformingData {
  id: string | number
  title: string
  views: string
  position: number
  issue: string
}

interface PerformanceHighlightsProps {
  bestPerforming: TopPerformingData[]
  worstPerforming: WorstPerformingData[]
}

export function PerformanceHighlights({
  bestPerforming,
  worstPerforming,
}: PerformanceHighlightsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Best Performing */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Melhores Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Seus artigos que mais trazem visitantes do Google:
          </p>
          <div className="space-y-3">
            {bestPerforming.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                Aguardando primeiros dados de audiência.
              </div>
            )}
            {bestPerforming.map((article, index) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {article.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views} visitas
                      </span>
                      <span>Posição #{article.position}</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        {article.change} posições
                      </span>
                    </div>
                  </div>
                </div>
                <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Worst Performing */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-amber-600" />
            Precisam de Atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Artigos que podem melhorar com algumas edições:
          </p>
          <div className="space-y-3">
            {worstPerforming.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                Seus artigos não apresentam problemas.
              </div>
            )}
            {worstPerforming.map((article) => (
              <div
                key={article.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {article.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views} visitas
                      </span>
                      <span>Posição #{article.position}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {article.issue}
                  </span>
                  <button className="text-xs font-medium text-primary hover:underline">
                    Ver sugestões
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
