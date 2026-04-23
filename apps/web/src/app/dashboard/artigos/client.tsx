"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArticlesList } from "@/components/articles/articles-list"
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
import { Sparkles, ExternalLink, Lightbulb } from "lucide-react"
import type { ArticleItem, Strategy } from "@/lib/strategies"

export type ArtigosClientProps = {
  articles: ArticleItem[]
  strategies: Strategy[]
  initialStrategyId?: string
}

export function ArtigosClient({ articles, strategies, initialStrategyId }: ArtigosClientProps) {
  const router = useRouter()
  const [strategyFilter, setStrategyFilter] = useState<string>(
    initialStrategyId && strategies.some((strategy) => strategy.id === initialStrategyId)
      ? initialStrategyId
      : "all",
  )
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  const filteredArticles = useMemo(() => {
    if (strategyFilter === "all") return articles
    return articles.filter((a) => a.strategyId === strategyFilter)
  }, [strategyFilter, articles])

  const inProduction = useMemo(
    () =>
      filteredArticles.filter(
        (a) => a.status === "generating" || a.status === "queued",
      ),
    [filteredArticles],
  )

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

          {/* Button: gerar artigo */}
          <Button className="gap-2" onClick={() => setShowGenerateDialog(true)}>
            <Sparkles className="h-4 w-4" />
            Novo Artigo (IA)
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
    </div>
  )
}
