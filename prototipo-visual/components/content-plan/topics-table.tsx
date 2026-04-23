"use client"

import { useMemo, useState } from "react"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  CheckCircle2,
  Edit3,
  Lightbulb,
  MoreHorizontal,
  PenTool,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import type { TopicItem } from "@/lib/strategies"
import { TOPICS } from "@/lib/strategies"
import { cn } from "@/lib/utils"
import { RejectItemDialog } from "./reject-item-dialog"
import { isRejected, useWorkspaceStore } from "@/lib/workspace-store"

type FilterKey = "all" | "pending" | "approved" | "high"

type TopicsTableProps = {
  topics?: TopicItem[]
  strategyId?: string
  strategyName?: string
  onGenerateArticle?: (topicId: string) => void
  onSendBatchToProduction?: (topicIds: string[]) => void
}

const priorityDot: Record<TopicItem["priority"], string> = {
  alta: "bg-destructive",
  média: "bg-amber-500",
  baixa: "bg-emerald-500",
}

const stageDot: Record<TopicItem["stage"], string> = {
  Consciência: "bg-sky-500",
  Consideração: "bg-violet-500",
  Decisão: "bg-emerald-500",
}

export function TopicsTable({
  topics = TOPICS,
  strategyId,
  strategyName,
  onGenerateArticle,
  onSendBatchToProduction,
}: TopicsTableProps) {
  useWorkspaceStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<TopicItem | null>(null)
  const [bulkReject, setBulkReject] = useState(false)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [search, setSearch] = useState("")

  const visible = useMemo(
    () => topics.filter((t) => !isRejected(t.id)),
    [topics],
  )

  const counts = useMemo(
    () => ({
      all: visible.length,
      pending: visible.filter((t) => t.status === "pending").length,
      approved: visible.filter((t) => t.status === "approved").length,
      high: visible.filter((t) => t.priority === "alta").length,
    }),
    [visible],
  )

  const filtered = useMemo(() => {
    let list = visible
    if (filter === "pending") list = list.filter((t) => t.status === "pending")
    if (filter === "approved") list = list.filter((t) => t.status === "approved")
    if (filter === "high") list = list.filter((t) => t.priority === "alta")
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q)),
      )
    }
    return list
  }, [visible, filter, search])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((t) => selected.has(t.id))

  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((t) => next.delete(t.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((t) => next.add(t.id))
        return next
      })
    }
  }

  const clear = () => setSelected(new Set())
  const sendBatch = () => {
    onSendBatchToProduction?.(Array.from(selected))
    clear()
  }

  const hasSelection = selected.size > 0
  const selectedCount = selected.size
  const selectedHasPending = Array.from(selected).some(
    (id) => topics.find((t) => t.id === id)?.status === "pending",
  )

  const filterOptions: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "pending", label: "Pendentes", count: counts.pending },
    { key: "approved", label: "Aprovados", count: counts.approved },
    { key: "high", label: "Alta prioridade", count: counts.high },
  ]

  return (
    <div className="space-y-3">
      {/* Header da seção */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Tópicos</h2>
            {strategyName && (
              <Badge variant="secondary" className="font-normal">
                {strategyName}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Selecione vários para enviar à fila de produção.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Sugerir tópicos
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Toolbar: filtros + busca  |  OU  bulk actions */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/95 p-2 backdrop-blur">
        {hasSelection ? (
          <>
            <span className="ml-1 text-sm font-medium text-foreground">
              {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {selectedHasPending && (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Aprovar
                </Button>
              )}
              <Button size="sm" className="gap-1.5" onClick={sendBatch}>
                <Sparkles className="h-3.5 w-3.5" />
                Enviar para produção
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setBulkReject(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Reprovar
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
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {visible.length === 0
                ? "Nenhum tópico ainda"
                : "Nenhum resultado para os filtros atuais"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {visible.length === 0
                ? "Aprove palavras-chave e a IA vai sugerir tópicos."
                : "Ajuste a busca ou limpe os filtros."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <TooltipProvider delayDuration={200}>
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
                  <TableHead className="w-[130px]">Etapa</TableHead>
                  <TableHead className="w-[110px]">Prioridade</TableHead>
                  <TableHead className="w-[70px] text-right">KWs</TableHead>
                  <TableHead className="w-[110px] text-right">
                    Tráfego est.
                  </TableHead>
                  <TableHead className="w-[160px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((topic) => {
                  const isSelected = selected.has(topic.id)
                  const isApproved = topic.status === "approved"
                  return (
                    <TableRow
                      key={topic.id}
                      className={cn(
                        "group h-12 cursor-default",
                        isSelected &&
                          "bg-primary/5 hover:bg-primary/5 data-[state=selected]:bg-primary/5",
                      )}
                      data-state={isSelected ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggle(topic.id)}
                          aria-label={`Selecionar ${topic.title}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-[420px]">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "truncate",
                              isApproved
                                ? "text-foreground"
                                : "text-foreground/90",
                            )}
                            title={topic.title}
                          >
                            {topic.title}
                          </span>
                          {isApproved && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Aprovado, pronto para produção
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              stageDot[topic.stage],
                            )}
                          />
                          {topic.stage}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              priorityDot[topic.priority],
                            )}
                          />
                          {topic.priority}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <button className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground hover:text-foreground">
                              {topic.keywords.length}
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
                              {topic.keywords.map((kw) => (
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
                      <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                        ~{topic.estimatedTraffic}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5">
                          {isApproved ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                              onClick={() => onGenerateArticle?.(topic.id)}
                            >
                              <PenTool className="h-3.5 w-3.5" />
                              Gerar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Aprovar
                            </Button>
                          )}
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
                              <DropdownMenuItem>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setRejecting(topic)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Reprovar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </Card>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Exibindo {filtered.length} de {counts.all}
        </span>
        {hasSelection && (
          <span>
            {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {rejecting && (
        <RejectItemDialog
          open={!!rejecting}
          onOpenChange={(open) => !open && setRejecting(null)}
          itemId={rejecting.id}
          kind="topic"
          term={rejecting.title}
          strategyId={strategyId}
          strategyName={strategyName}
        />
      )}

      {bulkReject && (
        <RejectItemDialog
          open={bulkReject}
          onOpenChange={(open) => {
            if (!open) setBulkReject(false)
          }}
          items={Array.from(selected)
            .map((id) => {
              const t = topics.find((x) => x.id === id)
              return t ? { id: t.id, term: t.title } : null
            })
            .filter((x): x is { id: string; term: string } => x !== null)}
          kind="topic"
          strategyId={strategyId}
          strategyName={strategyName}
          onDone={() => {
            setBulkReject(false)
            clear()
          }}
        />
      )}
    </div>
  )
}
