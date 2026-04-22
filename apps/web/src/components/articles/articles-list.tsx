"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText, Clock, CheckCircle2, AlertCircle, Eye, Edit2,
  MoreHorizontal, Calendar, Loader2, Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArticleItem, ArticleStatus } from "@/lib/strategies"

const statusConfig = {
  queued: { label: "Na fila", icon: Clock, color: "bg-muted text-muted-foreground" },
  generating: { label: "Gerando", icon: Loader2, color: "bg-primary/10 text-primary" },
  draft: { label: "Rascunho", icon: FileText, color: "bg-muted text-muted-foreground" },
  review: { label: "Em revisão", icon: AlertCircle, color: "bg-amber-100 text-amber-700" },
  scheduled: { label: "Agendado", icon: Calendar, color: "bg-blue-100 text-blue-700" },
  published: { label: "Publicado", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
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
  articles = [], viewMode, onSelectArticle,
  showStatusFilter = true, emptyLabel = "Nenhum artigo por aqui ainda.",
}: ArticlesListProps) {
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const visible = articles.filter((a) => a.status !== "queued" && a.status !== "generating")
  const filtered = filter === "all" ? visible : visible.filter((a) => a.status === filter)

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
    { value: "review", label: `Revisão (${counts.review})` },
    { value: "scheduled", label: `Agendados (${counts.scheduled})` },
    { value: "published", label: `Publicados (${counts.published})` },
  ]

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div>
      {showStatusFilter && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {filterOptions.map((opt) => (
            <Button key={opt.value} variant={filter === opt.value ? "secondary" : "ghost"} size="sm" className="rounded-full" onClick={() => setFilter(opt.value)}>
              {opt.label}
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{emptyLabel}</p>
            <p className="mt-1 text-sm text-muted-foreground">Gere um artigo a partir de um tópico aprovado.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={(c) => { if (c) setSelected(new Set(filtered.map(a => a.id))); else setSelected(new Set()) }}
                  />
                </TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[180px]">Keywords</TableHead>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead className="w-[60px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((article) => {
                const status = statusConfig[article.status]
                const StatusIcon = status.icon
                return (
                  <TableRow key={article.id} className="cursor-pointer" onClick={() => onSelectArticle(article.id)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(article.id)} onCheckedChange={() => toggle(article.id)} />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground line-clamp-1">{article.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[11px]", status.color)}>
                        <StatusIcon className="mr-1 h-3 w-3" />{status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {article.keywords.slice(0, 2).map((kw) => (
                          <span key={kw} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{kw}</span>
                        ))}
                        {article.keywords.length > 2 && (
                          <span className="text-[11px] text-muted-foreground">+{article.keywords.length - 2}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{article.createdAt}</span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectArticle(article.id)}>
                            <Edit2 className="mr-2 h-4 w-4" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
