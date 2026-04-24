"use client"

import { useMemo, useState, useTransition } from "react"
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
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Lightbulb, Plus, CheckCircle2, Send, Sparkles, Trash2,
  MoreHorizontal, XCircle, Clock,
} from "lucide-react"
import type { KeywordItem, TopicItem } from "@/lib/strategies"
import { TOPICS } from "@/lib/strategies"
import { cn } from "@/lib/utils"
import { RejectItemDialog } from "./reject-item-dialog"
import { isRejected, useWorkspaceStore } from "@/lib/workspace-store"
import {
  addManualTopic,
  approveTopicCandidate,
  massApproveTopics,
  massDeleteTopics,
  massRejectTopics,
  sendTopicsToProduction,
  triggerTopicResearch,
} from "@/app/dashboard/estrategias/actions"
import { useJobStatus } from "@/hooks/use-job-status"
import { JobStatusBanner } from "@/components/ui/job-status-banner"

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

type TopicResearchScope = "all_approved" | "selected_keywords" | "without_approved_topics"

type TopicsTableProps = {
  topics?: TopicItem[]
  keywords?: KeywordItem[]
  strategyId?: string
  strategyName?: string
  initialSuggestOpen?: boolean
  onApprove?: (topicId: string) => void
}

export function TopicsTable({
  topics = TOPICS, keywords = [], strategyId, strategyName, initialSuggestOpen = false, onApprove,
}: TopicsTableProps) {
  useWorkspaceStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<TopicItem | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(initialSuggestOpen)
  const [isPending, startTransition] = useTransition()
  const jobStatus = useJobStatus(strategyId ?? "", "research_topics")
  const briefJobStatus = useJobStatus(strategyId ?? "", "generate_brief")

  const approvedKeywords = useMemo(
    () => keywords.filter((keyword) => keyword.status === "approved"),
    [keywords],
  )
  const suggestedList = useMemo(
    () => topics.filter((topic) => topic.status === "suggested" && !isRejected(topic.id)),
    [topics],
  )
  const approvedList = useMemo(
    () => topics.filter((topic) => topic.status === "approved" && !isRejected(topic.id)),
    [topics],
  )
  const rejectedList = useMemo(
    () => topics.filter((topic) => topic.status === "rejected" || isRejected(topic.id)),
    [topics],
  )
  const totalVisible = suggestedList.length + approvedList.length + rejectedList.length
  const selectedTopics = useMemo(
    () => Array.from(selected).map((id) => topics.find((topic) => topic.id === id)).filter(Boolean) as TopicItem[],
    [selected, topics],
  )
  const hasSelection = selected.size > 0
  const selectedHasSuggested = selectedTopics.some((topic) => topic.status === "suggested")
  const selectedAllApproved = selectedTopics.length > 0 && selectedTopics.every((topic) => topic.status === "approved")

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const clear = () => setSelected(new Set())

  const selectAll = (items: TopicItem[], checked: boolean | "indeterminate") => {
    if (!checked) {
      clear()
      return
    }
    setSelected(new Set(items.map((item) => item.id)))
  }

  const handleApprove = (topicId: string) => {
    startTransition(async () => {
      const result = await approveTopicCandidate(topicId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.success)
      onApprove?.(topicId)
    })
  }

  const handleSuggestTopics = (input: {
    topicCount: number
    keywordIds?: string[]
    scope: TopicResearchScope
  }) => {
    if (!strategyId) return
    jobStatus.trigger()
    startTransition(async () => {
      const result = await triggerTopicResearch(strategyId, {
        topicCount: input.topicCount,
        keywordIds: input.keywordIds,
        scope: input.scope,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.success)
      setSuggestOpen(false)
    })
  }

  const handleMassApprove = () => {
    const ids = selectedTopics.filter((topic) => topic.status === "suggested").map((topic) => topic.id)
    if (ids.length === 0) return
    startTransition(async () => {
      const result = await massApproveTopics(ids)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.success)
      clear()
    })
  }

  const handleMassReject = (ids = Array.from(selected)) => {
    if (ids.length === 0) return
    startTransition(async () => {
      const result = await massRejectTopics(ids)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.success)
      clear()
    })
  }

  const handleMassDelete = (ids = Array.from(selected)) => {
    if (ids.length === 0) return
    startTransition(async () => {
      const result = await massDeleteTopics(ids)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.success)
      clear()
    })
  }

  const handleSendToProduction = (ids = Array.from(selected)) => {
    const approvedIds = ids.filter((id) => topics.find((topic) => topic.id === id)?.status === "approved")
    if (approvedIds.length === 0) {
      toast.error("Selecione ao menos um tópico aprovado.")
      return
    }

    briefJobStatus.trigger()
    startTransition(async () => {
      const result = await sendTopicsToProduction(approvedIds)
      if (result.error) {
        toast.error(result.error)
      } else {
        const summary = result.summary ?? { enfileirados: approvedIds.length, ignorados: 0, falhas: 0 }
        const details = [
          `${summary.enfileirados} na fila`,
          summary.ignorados > 0 ? `${summary.ignorados} ignorado(s)` : null,
          summary.falhas > 0 ? `${summary.falhas} com erro` : null,
        ].filter(Boolean).join(" · ")
        toast.success(`Producao iniciada: ${details}.`)
      }
      clear()
    })
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
              {totalVisible} tópicos · {approvedList.length} aprovados · {suggestedList.length} sugestões
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setAddOpen(true)} disabled={!strategyId}>
              <Plus className="h-4 w-4" />Adicionar tópico
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setSuggestOpen(true)} disabled={isPending || jobStatus.isRunning || !strategyId}>
              <Sparkles className="h-4 w-4" />{isPending ? "Enviando..." : "Sugerir tópicos"}
            </Button>
            <Button className="gap-2" onClick={() => handleSendToProduction(approvedList.map((topic) => topic.id))} disabled={isPending || briefJobStatus.isRunning || approvedList.length === 0}>
              <Send className="h-4 w-4" />Gerar artigos
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <JobStatusBanner
          status={jobStatus.status}
          jobLabel="topics"
          count={topics.length}
          errorMessage={jobStatus.errorMessage}
          onRetry={() => setSuggestOpen(true)}
          onDismiss={jobStatus.dismiss}
          className="mb-4"
        />
        <JobStatusBanner
          status={briefJobStatus.status}
          jobLabel="articles"
          count={approvedList.length}
          errorMessage={briefJobStatus.errorMessage}
          onRetry={() => handleSendToProduction(approvedList.map((t) => t.id))}
          onDismiss={briefJobStatus.dismiss}
          className="mb-4"
        />

        <Tabs defaultValue="suggested" className="space-y-4">
          <TabsList>
            <TabsTrigger value="suggested">Sugestões ({suggestedList.length})</TabsTrigger>
            <TabsTrigger value="approved">Aprovados ({approvedList.length})</TabsTrigger>
            <TabsTrigger value="rejected">Descartados ({rejectedList.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="suggested" className="m-0">
            <TopicsContent
              topics={suggestedList}
              selected={selected}
              pending={isPending}
              emptyTitle="Nenhum tópico sugerido"
              emptyDescription="Sugira tópicos por IA ou adicione um tópico manualmente."
              onToggle={toggle}
              onSelectAll={selectAll}
              onApprove={handleApprove}
              onReject={setRejecting}
              onDelete={(topic) => handleMassDelete([topic.id])}
              onSendToProduction={(topic) => handleSendToProduction([topic.id])}
            />
          </TabsContent>
          <TabsContent value="approved" className="m-0">
            <TopicsContent
              topics={approvedList}
              selected={selected}
              pending={isPending}
              emptyTitle="Nenhum tópico aprovado"
              emptyDescription="Aprove sugestões para liberar o envio explícito para produção."
              onToggle={toggle}
              onSelectAll={selectAll}
              onApprove={handleApprove}
              onReject={setRejecting}
              onDelete={(topic) => handleMassDelete([topic.id])}
              onSendToProduction={(topic) => handleSendToProduction([topic.id])}
            />
          </TabsContent>
          <TabsContent value="rejected" className="m-0">
            <TopicsContent
              topics={rejectedList}
              selected={selected}
              pending={isPending}
              emptyTitle="Nenhum tópico descartado"
              emptyDescription="Tópicos descartados ficam separados das sugestões editoriais."
              onToggle={toggle}
              onSelectAll={selectAll}
              onApprove={handleApprove}
              onReject={setRejecting}
              onDelete={(topic) => handleMassDelete([topic.id])}
              onSendToProduction={(topic) => handleSendToProduction([topic.id])}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      {strategyId && (
        <>
          <AddTopicDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            strategyId={strategyId}
            approvedKeywords={approvedKeywords}
          />
          <SuggestTopicsDialog
            open={suggestOpen}
            onOpenChange={setSuggestOpen}
            pending={isPending || jobStatus.isRunning}
            approvedKeywords={approvedKeywords}
            topics={topics}
            onSubmit={handleSuggestTopics}
          />
        </>
      )}

      {rejecting && (
        <RejectItemDialog
          open={!!rejecting}
          onOpenChange={(open) => !open && setRejecting(null)}
          itemId={rejecting.id}
          kind="topic"
          term={rejecting.title}
          strategyId={strategyId}
          strategyName={strategyName}
          onDone={() => handleMassReject([rejecting.id])}
        />
      )}

      {hasSelection && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-background px-6 py-3 shadow-lg animate-in slide-in-from-bottom-10">
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <div className="h-4 w-px bg-border" />
          <Button size="sm" variant="outline" className="text-muted-foreground" onClick={clear} disabled={isPending}>Cancelar</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleMassReject()} disabled={isPending}>
            <XCircle className="h-3.5 w-3.5" />Descartar
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleMassDelete()} disabled={isPending}>
            <Trash2 className="h-3.5 w-3.5" />Excluir
          </Button>
          {selectedHasSuggested && (
            <Button size="sm" onClick={handleMassApprove} disabled={isPending} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />Aprovar
            </Button>
          )}
          {selectedAllApproved && (
            <Button size="sm" className="gap-1.5" onClick={() => handleSendToProduction()} disabled={isPending || briefJobStatus.isRunning}>
              <Send className="h-3.5 w-3.5" />Gerar artigos
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

function TopicsContent({
  topics,
  selected,
  pending,
  emptyTitle,
  emptyDescription,
  onToggle,
  onSelectAll,
  onApprove,
  onReject,
  onDelete,
  onSendToProduction,
}: {
  topics: TopicItem[]
  selected: Set<string>
  pending: boolean
  emptyTitle: string
  emptyDescription: string
  onToggle: (id: string) => void
  onSelectAll: (items: TopicItem[], checked: boolean | "indeterminate") => void
  onApprove: (topicId: string) => void
  onReject: (topic: TopicItem) => void
  onDelete: (topic: TopicItem) => void
  onSendToProduction: (topic: TopicItem) => void
}) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={topics.length > 0 && topics.every((topic) => selected.has(topic.id))}
                onCheckedChange={(checked) => onSelectAll(topics, checked)}
              />
            </TableHead>
            <TableHead>Tópico</TableHead>
            <TableHead className="w-[120px]">Estágio</TableHead>
            <TableHead className="w-[110px]">Prioridade</TableHead>
            <TableHead className="w-[90px]">Tráfego</TableHead>
            <TableHead className="w-[110px]">Status</TableHead>
            <TableHead className="w-[60px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow
              key={topic.id}
              className={cn(
                "transition-colors",
                topic.status === "approved" && "hover:bg-green-50/40",
                topic.status === "suggested" && "border-l-2 border-l-amber-300 hover:bg-muted/50",
                topic.status === "rejected" && "opacity-75 hover:bg-muted/40",
              )}
            >
              <TableCell>
                <Checkbox checked={selected.has(topic.id)} onCheckedChange={() => onToggle(topic.id)} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {topic.status === "approved" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                  ) : topic.status === "rejected" ? (
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  )}
                  <span className="font-medium text-foreground line-clamp-1">{topic.title}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {topic.keywords.slice(0, 3).map((keyword) => (
                    <span key={keyword} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{keyword}</span>
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
                {topic.status === "approved" ? (
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 text-[11px]">
                    <CheckCircle2 className="h-3 w-3" />Aprovado
                  </Badge>
                ) : topic.status === "rejected" ? (
                  <Badge variant="secondary" className="gap-1 bg-destructive/10 text-destructive text-[11px]">
                    <XCircle className="h-3 w-3" />Descartado
                  </Badge>
                ) : (
                  <button
                    className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100 hover:border-amber-400"
                    onClick={() => onApprove(topic.id)}
                    disabled={pending}
                    title="Clique para aprovar"
                  >
                    <Clock className="h-3 w-3" />Sugerido
                  </button>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {topic.status === "suggested" && (
                      <DropdownMenuItem onClick={() => onApprove(topic.id)} disabled={pending}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />Aprovar
                      </DropdownMenuItem>
                    )}
                    {topic.status === "approved" && (
                      <DropdownMenuItem onClick={() => onSendToProduction(topic)} disabled={pending}>
                        <Send className="mr-2 h-4 w-4" />Gerar artigo
                      </DropdownMenuItem>
                    )}
                    {topic.status !== "rejected" && (
                      <DropdownMenuItem onClick={() => onReject(topic)}>
                        <XCircle className="mr-2 h-4 w-4 text-amber-600" />Descartar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(topic)} disabled={pending}>
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
  )
}

function AddTopicDialog({
  open,
  onOpenChange,
  strategyId,
  approvedKeywords,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategyId: string
  approvedKeywords: KeywordItem[]
}) {
  const [title, setTitle] = useState("")
  const [keywordId, setKeywordId] = useState("")
  const [customKeyword, setCustomKeyword] = useState("")
  const [funnelStage, setFunnelStage] = useState<"awareness" | "consideration" | "decision">("awareness")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [note, setNote] = useState("")
  const [isPending, startTransition] = useTransition()
  const selectedKeyword = approvedKeywords.find((keyword) => keyword.id === keywordId)
  const primaryKeyword = selectedKeyword?.keyword ?? customKeyword

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await addManualTopic(strategyId, {
        title,
        primaryKeyword,
        keywordId: selectedKeyword?.id ?? null,
        funnelStage,
        priority,
        note,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(result.success)
      setTitle("")
      setKeywordId("")
      setCustomKeyword("")
      setFunnelStage("awareness")
      setPriority("medium")
      setNote("")
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar tópico</DialogTitle>
          <DialogDescription>Tópicos manuais entram como sugestão e precisam ser aprovados antes da produção.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="grid gap-2 text-sm font-medium">
            Título
            <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Palavra-chave principal
            {approvedKeywords.length > 0 ? (
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={keywordId}
                onChange={(event) => setKeywordId(event.target.value)}
              >
                <option value="">Selecionar keyword aprovada</option>
                {approvedKeywords.map((keyword) => (
                  <option key={keyword.id} value={keyword.id}>{keyword.keyword}</option>
                ))}
              </select>
            ) : (
              <Input value={customKeyword} onChange={(event) => setCustomKeyword(event.target.value)} maxLength={120} />
            )}
          </label>
          {approvedKeywords.length > 0 && !keywordId && (
            <label className="grid gap-2 text-sm font-medium">
              Outra palavra-chave
              <Input value={customKeyword} onChange={(event) => setCustomKeyword(event.target.value)} maxLength={120} />
            </label>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Estágio do funil
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={funnelStage}
                onChange={(event) => setFunnelStage(event.target.value as "awareness" | "consideration" | "decision")}
              >
                <option value="awareness">Consciência</option>
                <option value="consideration">Consideração</option>
                <option value="decision">Decisão</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Prioridade
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={priority}
                onChange={(event) => setPriority(event.target.value as "high" | "medium" | "low")}
              >
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Observação / ângulo editorial
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={500} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending || !title.trim() || !primaryKeyword.trim()}>
            {isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SuggestTopicsDialog({
  open,
  onOpenChange,
  pending,
  approvedKeywords,
  topics,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending: boolean
  approvedKeywords: KeywordItem[]
  topics: TopicItem[]
  onSubmit: (input: { topicCount: number; keywordIds?: string[]; scope: TopicResearchScope }) => void
}) {
  const [scope, setScope] = useState<TopicResearchScope>("all_approved")
  const [topicCount, setTopicCount] = useState(10)
  const [topicsPerKeyword, setTopicsPerKeyword] = useState(2)
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(new Set())
  const approvedTopicTerms = useMemo(
    () => new Set(
      topics
        .filter((topic) => topic.status === "approved")
        .flatMap((topic) => topic.keywords)
        .map((keyword) => keyword.toLowerCase()),
    ),
    [topics],
  )
  const keywordsWithoutApprovedTopics = useMemo(
    () => approvedKeywords.filter((keyword) => !approvedTopicTerms.has(keyword.keyword.toLowerCase())),
    [approvedKeywords, approvedTopicTerms],
  )
  const scopedKeywords = scope === "without_approved_topics" ? keywordsWithoutApprovedTopics : approvedKeywords
  const selectedCount = scope === "selected_keywords" ? selectedKeywordIds.size : scopedKeywords.length

  const setPerKeyword = (value: number) => {
    const safeValue = Math.max(1, Math.min(20, value || 1))
    setTopicsPerKeyword(safeValue)
    setTopicCount(Math.max(1, selectedCount || 1) * safeValue)
  }

  const toggleKeyword = (id: string) => {
    setSelectedKeywordIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleSubmit = () => {
    const keywordIds = scope === "selected_keywords" ? Array.from(selectedKeywordIds) : undefined
    if (scope === "selected_keywords" && (!keywordIds || keywordIds.length === 0)) {
      toast.error("Selecione ao menos uma keyword aprovada.")
      return
    }

    onSubmit({
      topicCount: Math.max(1, Math.min(100, topicCount || 10)),
      keywordIds,
      scope,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Sugerir tópicos</DialogTitle>
          <DialogDescription>Configure o escopo de keywords aprovadas e o volume total de tópicos.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Escopo</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button type="button" variant={scope === "all_approved" ? "default" : "outline"} onClick={() => setScope("all_approved")}>
                Todas aprovadas
              </Button>
              <Button type="button" variant={scope === "selected_keywords" ? "default" : "outline"} onClick={() => setScope("selected_keywords")}>
                Selecionadas
              </Button>
              <Button type="button" variant={scope === "without_approved_topics" ? "default" : "outline"} onClick={() => setScope("without_approved_topics")}>
                Sem tópicos
              </Button>
            </div>
          </div>

          {scope === "selected_keywords" && (
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
              {approvedKeywords.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma keyword aprovada disponível.</p>
              ) : approvedKeywords.map((keyword) => (
                <label key={keyword.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={selectedKeywordIds.has(keyword.id)} onCheckedChange={() => toggleKeyword(keyword.id)} />
                  <span>{keyword.keyword}</span>
                </label>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Quantidade total
              <Input
                type="number"
                min={1}
                max={100}
                value={topicCount}
                onChange={(event) => setTopicCount(Number(event.target.value))}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Tópicos por keyword
              <Input
                type="number"
                min={1}
                max={20}
                value={topicsPerKeyword}
                onChange={(event) => setPerKeyword(Number(event.target.value))}
              />
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={pending || approvedKeywords.length === 0}>
            {pending ? "Enviando..." : "Sugerir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
