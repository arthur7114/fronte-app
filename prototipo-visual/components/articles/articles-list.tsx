"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  MoreHorizontal,
  Calendar,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { ArticleItem, ArticleStatus } from "@/lib/strategies"
import { ARTICLES } from "@/lib/strategies"

const statusConfig = {
  queued: {
    label: "Na fila",
    icon: Clock,
    color: "bg-muted text-muted-foreground",
  },
  generating: {
    label: "Gerando",
    icon: Loader2,
    color: "bg-primary/10 text-primary",
  },
  draft: {
    label: "Rascunho",
    icon: FileText,
    color: "bg-muted text-muted-foreground",
  },
  review: {
    label: "Em revisão",
    icon: AlertCircle,
    color: "bg-amber-100 text-amber-700",
  },
  scheduled: {
    label: "Agendado",
    icon: Calendar,
    color: "bg-blue-100 text-blue-700",
  },
  published: {
    label: "Publicado",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
} satisfies Record<ArticleStatus, { label: string; icon: typeof FileText; color: string }>

type StatusFilter = "all" | ArticleStatus

type ArticlesListProps = {
  articles?: ArticleItem[]
  viewMode: "list" | "grid"
  onSelectArticle: (id: string) => void
  showStatusFilter?: boolean
  emptyLabel?: string
}

export function ArticlesList({
  articles = ARTICLES,
  viewMode,
  onSelectArticle,
  showStatusFilter = true,
  emptyLabel = "Nenhum artigo por aqui ainda.",
}: ArticlesListProps) {
  const [filter, setFilter] = useState<StatusFilter>("all")

  // Artigos em produção (queued/generating) têm exibição própria em ProductionQueue
  const visible = articles.filter(
    (a) => a.status !== "queued" && a.status !== "generating",
  )

  const filtered =
    filter === "all" ? visible : visible.filter((a) => a.status === filter)

  const counts = {
    all: visible.length,
    draft: visible.filter((a) => a.status === "draft").length,
    review: visible.filter((a) => a.status === "review").length,
    scheduled: visible.filter((a) => a.status === "scheduled").length,
    published: visible.filter((a) => a.status === "published").length,
  }

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: `Todos (${counts.all})` },
    { value: "draft", label: `Rascunhos (${counts.draft})` },
    { value: "review", label: `Em revisão (${counts.review})` },
    { value: "scheduled", label: `Agendados (${counts.scheduled})` },
    { value: "published", label: `Publicados (${counts.published})` },
  ]

  return (
    <div>
      {showStatusFilter && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{emptyLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Gere um artigo a partir de um tópico aprovado.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            "gap-4",
            viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "space-y-4",
          )}
        >
          {filtered.map((article) => {
            const status = statusConfig[article.status]
            const StatusIcon = status.icon

            return (
              <Card
                key={article.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => onSelectArticle(article.id)}
              >
                <CardContent className={cn("p-5", viewMode === "list" && "flex gap-6")}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge className={cn("mb-2", status.color)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        <h3 className="font-medium text-foreground line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {article.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.createdAt}
                      </span>
                      {article.views && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views} visualizações
                        </span>
                      )}
                      {article.scheduledFor && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Calendar className="h-3 w-3" />
                          Agendado para {article.scheduledFor}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
