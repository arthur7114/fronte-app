"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Edit2,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArticleItem, ArticleStatus } from "@/lib/strategies"

type ArticlesTableProps = {
  articles: ArticleItem[]
  onSelectArticle: (id: string) => void
  initialFilter?: StatusFilter
  emptyLabel?: string
}

type StatusFilter =
  | "all"
  | "draft"
  | "review"
  | "scheduled"
  | "published"

const statusLabel: Record<ArticleStatus, string> = {
  queued: "Na fila",
  generating: "Gerando",
  draft: "Rascunho",
  review: "Em revisão",
  scheduled: "Agendado",
  published: "Publicado",
}

const statusDot: Record<ArticleStatus, string> = {
  queued: "bg-muted-foreground",
  generating: "bg-primary",
  draft: "bg-muted-foreground",
  review: "bg-amber-500",
  scheduled: "bg-sky-500",
  published: "bg-emerald-500",
}

export function ArticlesTable({
  articles,
  onSelectArticle,
  initialFilter = "all",
  emptyLabel = "Nenhum artigo por aqui ainda.",
}: ArticlesTableProps) {
  const [filter, setFilter] = useState<StatusFilter>(initialFilter)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Quando o parent muda o filtro (via KPI clicável), refletimos aqui
  useEffect(() => {
    setFilter(initialFilter)
  }, [initialFilter])

  // Artigos em produção (queued/generating) têm exibição própria em ProductionQueue
  const visible = useMemo(
    () =>
      articles.filter(
        (a) => a.status !== "queued" && a.status !== "generating",
      ),
    [articles],
  )

  const counts = useMemo(
    () => ({
      all: visible.length,
      draft: visible.filter((a) => a.status === "draft").length,
      review: visible.filter((a) => a.status === "review").length,
      scheduled: visible.filter((a) => a.status === "scheduled").length,
      published: visible.filter((a) => a.status === "published").length,
    }),
    [visible],
  )

  const filtered = useMemo(() => {
    let list = visible
    if (filter !== "all") list = list.filter((a) => a.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.keywords.some((k) => k.toLowerCase().includes(q)),
      )
    }
    return list
  }, [visible, filter, search])

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((a) => selected.has(a.id))

  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((a) => next.delete(a.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((a) => next.add(a.id))
        return next
      })
    }
  }

  const clear = () => setSelected(new Set())
  const hasSelection = selected.size > 0
  const selectedCount = selected.size

  const filterOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "draft", label: "Rascunhos", count: counts.draft },
    { key: "review", label: "Em revisão", count: counts.review },
    { key: "scheduled", label: "Agendados", count: counts.scheduled },
    { key: "published", label: "Publicados", count: counts.published },
  ]

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/95 p-2 backdrop-blur">
        {hasSelection ? (
          <>
            <span className="ml-1 text-sm font-medium text-foreground">
              {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Agendar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-muted-foreground"
                onClick={clear}
              >
                <X className="h-3.5 w-3.5" />
                Limpar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1">
              {filterOptions.map((f) => {
                const active = filter === f.key
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {f.label}
                    <span
                      className={cn(
                        "tabular-nums",
                        active ? "text-primary" : "text-muted-foreground/70",
                      )}
                    >
                      {f.count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="relative ml-auto w-full md:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar título ou keyword"
                className="h-8 pl-8 text-sm"
              />
            </div>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 border-dashed py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {visible.length === 0
                ? emptyLabel
                : "Nenhum resultado para os filtros atuais"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {visible.length === 0
                ? "Gere um artigo a partir de um tópico aprovado."
                : "Ajuste a busca ou limpe os filtros."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={toggleAllFiltered}
                    aria-label="Selecionar todos filtrados"
                  />
                </TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[70px] text-right">KWs</TableHead>
                <TableHead className="w-[140px]">Data</TableHead>
                <TableHead className="w-[110px] text-right">Views</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((article) => {
                const isSelected = selected.has(article.id)
                return (
                  <TableRow
                    key={article.id}
                    className={cn(
                      "group h-12 cursor-pointer",
                      isSelected &&
                        "bg-primary/5 hover:bg-primary/5 data-[state=selected]:bg-primary/5",
                    )}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() => onSelectArticle(article.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggle(article.id)}
                        aria-label={`Selecionar ${article.title}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-[480px]">
                      <span
                        className="block truncate text-foreground"
                        title={article.title}
                      >
                        {article.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            statusDot[article.status],
                          )}
                        />
                        {statusLabel[article.status]}
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground hover:text-foreground">
                            {article.keywords.length}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent
                          align="end"
                          className="w-auto min-w-[180px] p-3"
                        >
                          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Palavras-chave
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {article.keywords.map((kw) => (
                              <Badge
                                key={kw}
                                variant="secondary"
                                className="font-normal"
                              >
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {article.scheduledFor ? (
                        <span className="inline-flex items-center gap-1 text-sky-600">
                          <Calendar className="h-3 w-3" />
                          {article.scheduledFor}
                        </span>
                      ) : (
                        article.createdAt
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                      {article.views ?? "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            aria-label="Mais ações"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onSelectArticle(article.id)}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Exibindo {filtered.length} de {counts.all}
        </span>
      </div>
    </div>
  )
}
