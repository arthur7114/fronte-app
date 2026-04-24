"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArticlesList } from "@/components/articles/articles-list"
import { BulkGenerateDialog } from "@/components/articles/bulk-generate-dialog"
import { GenerateArticleDialog } from "@/components/articles/generate-article-dialog"
import { ProductionQueue } from "@/components/articles/production-queue"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ExternalLink, Lightbulb, Layers3 } from "lucide-react"
import type { ArticleItem, Strategy, TopicItem } from "@/lib/strategies"
import type { ProductionProgress, ProductionQueueItem } from "@/lib/job-feed"

export type ArtigosClientProps = {
  articles: ArticleItem[]
  strategies: Strategy[]
  topics: TopicItem[]
  productionItems: ProductionQueueItem[]
  productionProgress: ProductionProgress
  initialStrategyId?: string
}

export function ArtigosClient({
  articles,
  strategies,
  topics,
  productionItems,
  productionProgress,
  initialStrategyId,
}: ArtigosClientProps) {
  const router = useRouter()
  const [strategyFilter, setStrategyFilter] = useState<string>(
    initialStrategyId && strategies.some((strategy) => strategy.id === initialStrategyId)
      ? initialStrategyId
      : "all",
  )
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  const filteredArticles = useMemo(() => {
    if (strategyFilter === "all") return articles
    return articles.filter((a) => a.strategyId === strategyFilter)
  }, [strategyFilter, articles])

  const inProduction = useMemo(() => {
    if (strategyFilter === "all") return productionItems
    return productionItems.filter((item) => item.strategyId === strategyFilter)
  }, [productionItems, strategyFilter])

  const visibleProductionProgress = useMemo(() => {
    if (strategyFilter === "all") return productionProgress
    return {
      total: inProduction.length,
      created: 0,
      running: inProduction.filter((item) => item.status === "generating").length,
      queued: inProduction.filter((item) => item.status === "queued").length,
      failed: 0,
    }
  }, [inProduction, productionProgress, strategyFilter])

  const currentStrategy = strategies.find((s) => s.id === strategyFilter)

  const handleStrategyFilterChange = (value: string) => {
    setStrategyFilter(value)
    router.replace(value === "all" ? "/dashboard/artigos" : `/dashboard/artigos?strategy=${value}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Artigos</h1>
          <p className="mt-1 text-muted-foreground">
            Todos os artigos gerados, agrupados por estratégia.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Strategy filter */}
          <Select value={strategyFilter} onValueChange={handleStrategyFilterChange}>
            <SelectTrigger className="w-[220px]">
              <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por estratégia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as estratégias</SelectItem>
              {strategies.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="gap-2" onClick={() => setShowBulkDialog(true)}>
            <Layers3 className="h-4 w-4" />
            Gerar em lote
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowGenerateDialog(true)}>
            <Sparkles className="h-4 w-4" />
            Novo artigo
          </Button>
        </div>
      </div>

      {/* Em produção */}
      {inProduction.length > 0 && (
        <ProductionQueue
          items={inProduction}
          title="Em produção"
          description="A IA está escrevendo estes artigos. Você pode acompanhar o progresso em tempo real."
          showStrategy={strategyFilter === "all"}
          progress={visibleProductionProgress}
        />
      )}

      {/* Strategy context banner */}
      {currentStrategy && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Exibindo artigos de</span>
            <Badge variant="outline" className="font-medium">
              {currentStrategy.name}
            </Badge>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href={`/dashboard/estrategias/${currentStrategy.id}`}>
              Abrir estratégia
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Articles List */}
      <ArticlesList
        articles={filteredArticles}
        viewMode="list"
        onSelectArticle={(id) => router.push(`/dashboard/artigos/${id}`)}
        emptyLabel={
          currentStrategy
            ? `Ainda não há artigos em ${currentStrategy.name}.`
            : "Nenhum artigo gerado ainda."
        }
      />

      <GenerateArticleDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerated={() => router.refresh()}
        strategyId={currentStrategy?.id ?? null}
      />
      <BulkGenerateDialog
        key={currentStrategy?.id ?? "all"}
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
        topics={topics}
        strategies={strategies}
        strategyId={currentStrategy?.id ?? null}
        onGenerated={() => router.refresh()}
      />
    </div>
  )
}
