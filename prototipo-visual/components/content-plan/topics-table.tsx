"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Lightbulb,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  PenTool,
  Sparkles,
  X,
} from "lucide-react"
import type { TopicItem } from "@/lib/strategies"
import { TOPICS } from "@/lib/strategies"
import { cn } from "@/lib/utils"
import { RejectItemDialog } from "./reject-item-dialog"
import { isRejected, useWorkspaceStore } from "@/lib/workspace-store"

const priorityColors = {
  alta: "bg-red-100 text-red-700",
  média: "bg-amber-100 text-amber-700",
  baixa: "bg-green-100 text-green-700",
}

const stageColors = {
  Consciência: "bg-blue-100 text-blue-700",
  Consideração: "bg-purple-100 text-purple-700",
  Decisão: "bg-green-100 text-green-700",
}

type TopicsTableProps = {
  topics?: TopicItem[]
  strategyId?: string
  strategyName?: string
  onGenerateArticle?: (topicId: string) => void
  onSendBatchToProduction?: (topicIds: string[]) => void
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

  const visible = topics.filter((t) => !isRejected(t.id))

  const approvedIds = useMemo(
    () => visible.filter((t) => t.status === "approved").map((t) => t.id),
    [visible],
  )
  const allApprovedSelected =
    approvedIds.length > 0 && approvedIds.every((id) => selected.has(id))
  const hasSelection = selected.size > 0
  const selectedCount = selected.size
  const selectedHasPending = Array.from(selected).some(
    (id) => topics.find((t) => t.id === id)?.status === "pending",
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllApproved = () => {
    if (allApprovedSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(approvedIds))
    }
  }

  const clear = () => setSelected(new Set())

  const sendBatch = () => {
    const ids = Array.from(selected)
    onSendBatchToProduction?.(ids)
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
              {strategyName && (
                <Badge variant="secondary" className="ml-1 font-normal">
                  {strategyName}
                </Badge>
              )}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Pautas derivadas das palavras-chave aprovadas. Selecione vários para
              enviar à fila de produção.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Sugerir tópicos
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar tópico
            </Button>
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
              <p className="mt-1 text-sm text-muted-foreground">
                Aprove palavras-chave e a IA gerará tópicos para esta estratégia.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bulk toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={allApprovedSelected}
                  onCheckedChange={toggleAllApproved}
                  aria-label="Selecionar aprovados"
                />
                {hasSelection ? (
                  <span className="text-foreground">
                    {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span>Selecionar todos os aprovados</span>
                )}
              </label>

              {hasSelection && (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedHasPending && (
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aprovar
                    </Button>
                  )}
                  <Button size="sm" className="gap-1.5" onClick={sendBatch}>
                    <Sparkles className="h-3.5 w-3.5" />
                    Enviar {selectedCount} para produção
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
              )}
            </div>

            <div className="space-y-3">
              {visible.map((topic) => {
                const isSelected = selected.has(topic.id)
                return (
                  <div
                    key={topic.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/20",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggle(topic.id)}
                      className="mt-1"
                      aria-label={`Selecionar ${topic.title}`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">
                          {topic.title}
                        </h3>
                        {topic.status === "approved" && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {topic.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="secondary" className={stageColors[topic.stage]}>
                          {topic.stage}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={priorityColors[topic.priority]}
                        >
                          Prioridade {topic.priority}
                        </Badge>
                        <span className="text-muted-foreground">
                          ~{topic.estimatedTraffic} visitas/mês
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {topic.status === "approved" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => onGenerateArticle?.(topic.id)}
                        >
                          <PenTool className="h-3.5 w-3.5" />
                          Gerar
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          Aprovar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        aria-label="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Reprovar"
                        onClick={() => setRejecting(topic)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>

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
    </Card>
  )
}
