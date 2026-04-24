"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Loader2, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArticleItem } from "@/lib/strategies"
import { getStrategy } from "@/lib/strategies"
import type { ProductionProgress, ProductionQueueItem } from "@/lib/job-feed"

type QueueItem = ArticleItem | ProductionQueueItem

type ProductionQueueProps = {
  items: QueueItem[]
  title?: string
  description?: string
  showStrategy?: boolean
  progress?: ProductionProgress
  className?: string
}

export function ProductionQueue({
  items,
  title = "Em produção",
  description,
  showStrategy = true,
  progress,
  className,
}: ProductionQueueProps) {
  if (items.length === 0) return null

  const generating = items.filter((i) => i.status === "generating")
  const queued = items.filter((i) => i.status === "queued")

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
            <Badge variant="secondary" className="ml-1 font-normal">
              {items.length}
            </Badge>
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
          {progress && progress.total > 0 && (
            <p className="mt-1 text-sm font-medium text-foreground">
              {progress.created} de {progress.total} artigos criados.{" "}
              {progress.running > 0 || progress.queued > 0 ? "Em andamento" : "Processamento concluido"}
              {progress.failed > 0 ? ` · ${progress.failed} com erro` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {generating.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {generating.length} gerando
            </span>
          )}
          {queued.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {queued.length} na fila
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ProductionCard key={item.id} item={item} showStrategy={showStrategy} />
        ))}
      </div>
    </section>
  )
}

function ProductionCard({
  item,
  showStrategy,
}: {
  item: QueueItem
  showStrategy: boolean
}) {
  const isGenerating = item.status === "generating"
  const strategy = showStrategy
    ? "strategyName" in item && item.strategyName
      ? { name: item.strategyName, color: item.strategyColor ?? "var(--primary)" }
      : getStrategy(item.strategyId)
    : undefined
  const progress = item.progress ?? (isGenerating ? 50 : 0)
  const statusDetail = "statusDetail" in item ? item.statusDetail : undefined

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        isGenerating && "border-primary/40",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Gerando
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Na fila
                </Badge>
              )}
              {strategy && (
                <span
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                  title={strategy.name}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: strategy.color }}
                  />
                  {strategy.name}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-foreground line-clamp-2">
              {item.title}
            </h3>
            {item.keywords.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {item.keywords.join(" · ")}
              </p>
            )}
            {statusDetail && (
              <p className="mt-1 text-xs text-muted-foreground">{statusDetail}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Cancelar"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isGenerating && (
          <div className="mt-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Escrevendo conteúdo… {progress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
