"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArticlesList } from "@/components/articles/articles-list"
import { ArticleEditor } from "@/components/articles/article-editor"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sparkles,
  LayoutList,
  Grid3X3,
  ExternalLink,
  Lightbulb,
  ChevronDown,
  Layers,
  PenTool,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArticleItem, Strategy } from "@/lib/strategies"

export type ArtigosClientProps = {
  articles: ArticleItem[]
  strategies: Strategy[]
}

export function ArtigosClient({ articles, strategies }: ArtigosClientProps) {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [strategyFilter, setStrategyFilter] = useState<string>("all")

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

  if (selectedArticle) {
    return (
      <ArticleEditor
        articleId={selectedArticle}
        isNew={selectedArticle === "new"}
        onBack={() => setSelectedArticle(null)}
      />
    )
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
          <Select value={strategyFilter} onValueChange={setStrategyFilter}>
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

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-2 transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Lista"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Grade"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

          {/* Button: gerar artigo */}
          <Button asChild className="gap-2">
            <Link href="/dashboard/artigos/novo">
              <Sparkles className="h-4 w-4" />
              Novo Artigo (IA)
            </Link>
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
            <Link href={`/app/estrategias/${currentStrategy.id}`}>
              Abrir estratégia
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Articles List */}
      <ArticlesList
        articles={filteredArticles}
        viewMode={viewMode}
        onSelectArticle={setSelectedArticle}
        emptyLabel={
          currentStrategy
            ? `Ainda não há artigos em ${currentStrategy.name}.`
            : "Nenhum artigo gerado ainda."
        }
      />

    </div>
  )
}
