"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Lightbulb, Plus, CheckCircle2, PenTool, Sparkles, Trash2,
  MoreHorizontal, XCircle, ShieldBan,
} from "lucide-react"
import type { TopicItem } from "@/lib/strategies"
import { TOPICS } from "@/lib/strategies"
import { cn } from "@/lib/utils"
import { RejectItemDialog } from "./reject-item-dialog"
import { isRejected, useWorkspaceStore } from "@/lib/workspace-store"
import {
  approveTopicCandidate, triggerTopicResearch,
  triggerBriefAndPostGeneration, massApproveTopics, massRejectTopics,
} from "@/app/dashboard/estrategias/actions"

const priorityColors: Record<string, string> = {
  alta: "bg-red-100 text-red-700",
  média: "bg-amber-100 text-amber-700",
  baixa: "bg-green-100 text-green-700",
}

const stageColors: Record<string, string> = {
  Consciência: "bg-blue-100 text-blue-700",
  Consideração: "bg-purple-100 text-purple-700",
  Decisão: "bg-green-100 text-green-700",
}

type TopicsTableProps = {
  topics?: TopicItem[]
  strategyId?: string
  strategyName?: string
  onSendBatchToProduction?: (topicIds: string[]) => void
  onApprove?: (topicId: string) => void
}

export function TopicsTable({
  topics = TOPICS, strategyId, strategyName,
  onSendBatchToProduction, onApprove,
}: TopicsTableProps) {
  useWorkspaceStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<TopicItem | null>(null)
  const [isPending, startTransition] = useTransition()

  const visible = useMemo(() => topics.filter((t) => !isRejected(t.id)), [topics])
  const hasSelection = selected.size > 0
  const selectedHasPending = Array.from(selected).some(
    (id) => topics.find((t) => t.id === id)?.status === "pending",
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const clear = () => setSelected(new Set())

  const handleApprove = (topicId: string) => {
    startTransition(async () => {
      const r = await approveTopicCandidate(topicId)
      if (r.error) toast.error(r.error); else { toast.success(r.success); onApprove?.(topicId) }
    })
  }

  const handleSuggestTopics = () => {
    if (!strategyId) return
    startTransition(async () => {
      const r = await triggerTopicResearch(strategyId)
      if (r.error) toast.error(r.error); else toast.success(r.success)
    })
  }

  const handleMassApprove = () => {
    if (selected.size === 0) return
    startTransition(async () => {
      const r = await massApproveTopics(Array.from(selected))
      if (r.error) toast.error(r.error); else { toast.success(r.success); clear() }
    })
  }

  const handleMassReject = () => {
    if (selected.size === 0) return
    startTransition(async () => {
      const r = await massRejectTopics(Array.from(selected))
      if (r.error) toast.error(r.error); else { toast.success(r.success); clear() }
    })
  }

  const sendBatch = () => {
    onSendBatchToProduction?.(Array.from(selected))
    clear()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
              Tópicos
              {strategyName && <Badge variant="secondary" className="ml-1 font-normal">{strategyName}</Badge>}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {visible.length} tópicos · {visible.filter(t => t.status === "approved").length} aprovados · {visible.filter(t => t.status === "pending").length} aguardando
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleSuggestTopics} disabled={isPending || !strategyId}>
              <Sparkles className="h-4 w-4" />{isPending ? "Processando..." : "Sugerir tópicos"}
            </Button>
            <Button className="gap-2"><Plus className="h-4 w-4" />Adicionar</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Nenhum tópico ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">Aprove palavras-chave e a IA gerará tópicos.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={visible.length > 0 && selected.size === visible.length}
                      onCheckedChange={(c) => { if (c) setSelected(new Set(visible.map(v => v.id))); else clear() }}
                    />
                  </TableHead>
                  <TableHead>Tópico</TableHead>
                  <TableHead className="w-[100px]">Estágio</TableHead>
                  <TableHead className="w-[100px]">Prioridade</TableHead>
                  <TableHead className="w-[90px]">Tráfego</TableHead>
                  <TableHead className="w-[90px]">Status</TableHead>
                  <TableHead className="w-[60px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(topic.id)} onCheckedChange={() => toggle(topic.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground line-clamp-1">{topic.title}</span>
                        {topic.status === "approved" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {topic.keywords.slice(0, 3).map((kw) => (
                          <span key={kw} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{kw}</span>
                        ))}
                        {topic.keywords.length > 3 && (
                          <span className="text-[11px] text-muted-foreground">+{topic.keywords.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className={cn("text-[11px]", stageColors[topic.stage])}>{topic.stage}</Badge></TableCell>
                    <TableCell><Badge variant="secondary" className={cn("text-[11px]", priorityColors[topic.priority])}>{topic.priority}</Badge></TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">~{topic.estimatedTraffic}</span></TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={topic.status === "approved" ? "bg-green-100 text-green-700 text-[11px]" : "text-[11px]"}>
                        {topic.status === "approved" ? "Aprovado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {topic.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleApprove(topic.id)} disabled={isPending}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />Aprovar
                            </DropdownMenuItem>
                          )}
                          {topic.status === "approved" && (
                            <DropdownMenuItem asChild disabled={isPending}>
                              <Link href={`/dashboard/artigos/novo?strategyId=${strategyId}&topicId=${topic.id}`}>
                                <PenTool className="mr-2 h-4 w-4" />Gerar artigo
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setRejecting(topic)}>
                            <XCircle className="mr-2 h-4 w-4 text-amber-600" />Reprovar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setRejecting(topic)}>
                            <ShieldBan className="mr-2 h-4 w-4" />Adicionar à blacklist
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {rejecting && (
        <RejectItemDialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}
          itemId={rejecting.id} kind="topic" term={rejecting.title}
          strategyId={strategyId} strategyName={strategyName} />
      )}

      {hasSelection && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-background px-6 py-3 shadow-lg animate-in slide-in-from-bottom-10">
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <div className="h-4 w-px bg-border" />
          <Button size="sm" variant="outline" className="text-muted-foreground" onClick={clear} disabled={isPending}>Cancelar</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleMassReject} disabled={isPending}>
            <XCircle className="h-3.5 w-3.5" />Reprovar
          </Button>
          {selectedHasPending && (
            <Button size="sm" onClick={handleMassApprove} disabled={isPending} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />Aprovar
            </Button>
          )}
          {!selectedHasPending && (
            <Button size="sm" className="gap-1.5" onClick={sendBatch} disabled={isPending}>
              <Sparkles className="h-3.5 w-3.5" />Produção
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
