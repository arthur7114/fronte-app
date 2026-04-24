"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Lightbulb, Loader2, Search, Send, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { sendTopicsToProduction } from "@/app/dashboard/estrategias/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Strategy, TopicItem } from "@/lib/strategies"

type BulkGenerateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  topics: TopicItem[]
  strategies: Strategy[]
  strategyId?: string | null
  onGenerated?: () => void
}

function formatSummary(summary: { enfileirados: number; ignorados: number; falhas: number }) {
  return [
    `${summary.enfileirados} na fila`,
    summary.ignorados > 0 ? `${summary.ignorados} ignorado(s)` : null,
    summary.falhas > 0 ? `${summary.falhas} com erro` : null,
  ].filter(Boolean).join(" · ")
}

export function BulkGenerateDialog({
  open,
  onOpenChange,
  topics,
  strategies,
  strategyId,
  onGenerated,
}: BulkGenerateDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [strategyFilter, setStrategyFilter] = useState(strategyId ?? "all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const approvedTopics = useMemo(
    () => topics.filter((topic) => topic.status === "approved"),
    [topics],
  )

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return approvedTopics.filter((topic) => {
      const matchesStrategy = strategyFilter === "all" || topic.strategyId === strategyFilter
      const matchesQuery = !normalizedQuery || topic.title.toLowerCase().includes(normalizedQuery)
      return matchesStrategy && matchesQuery
    })
  }, [approvedTopics, query, strategyFilter])

  const selectedCount = selected.size
  const hasApprovedTopics = approvedTopics.length > 0
  const currentStrategy = strategies.find((strategy) => strategy.id === strategyFilter)
  const allVisibleSelected = filteredTopics.length > 0 && filteredTopics.every((topic) => selected.has(topic.id))

  const toggleTopic = (topicId: string) => {
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }

  const toggleVisible = () => {
    setSelected((previous) => {
      const next = new Set(previous)
      if (allVisibleSelected) {
        filteredTopics.forEach((topic) => next.delete(topic.id))
      } else {
        filteredTopics.forEach((topic) => next.add(topic.id))
      }
      return next
    })
  }

  const goToStrategyTopics = () => {
    const targetStrategyId = strategyId ?? currentStrategy?.id
    if (targetStrategyId) {
      router.push(`/dashboard/estrategias/${targetStrategyId}?tab=topics&openSuggest=1`)
      return
    }
    router.push("/dashboard/estrategias")
  }

  const handleSubmit = () => {
    const topicIds = Array.from(selected)
    if (topicIds.length === 0) {
      toast.error("Selecione ao menos um tópico aprovado.")
      return
    }

    startTransition(async () => {
      const result = await sendTopicsToProduction(topicIds)
      if (result.error) {
        toast.error(result.error)
        return
      }

      const summary = result.summary ?? { enfileirados: topicIds.length, ignorados: 0, falhas: 0 }
      toast.success(`Produção iniciada: ${formatSummary(summary)}.`)
      if (summary.enfileirados > 0) {
        onGenerated?.()
      }
      handleOpenChange(false)
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("")
      setSelected(new Set())
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar artigos em lote
          </DialogTitle>
          <DialogDescription>
            Escolha tópicos aprovados e envie tudo para a fila de produção.
          </DialogDescription>
        </DialogHeader>

        {hasApprovedTopics ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
              <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                <SelectTrigger className="w-full">
                  <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Estratégia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as estratégias</SelectItem>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                  placeholder="Buscar tópico aprovado"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={allVisibleSelected} onCheckedChange={toggleVisible} />
                Selecionar visíveis
              </label>
              <span className="text-sm text-muted-foreground">
                {selectedCount} de {filteredTopics.length} selecionado(s)
              </span>
            </div>

            <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => {
                  const strategy = strategies.find((item) => item.id === topic.strategyId)
                  return (
                    <label
                      key={topic.id}
                      className="flex cursor-pointer items-start gap-3 border-b border-border p-4 last:border-b-0 hover:bg-muted/40"
                    >
                      <Checkbox checked={selected.has(topic.id)} onCheckedChange={() => toggleTopic(topic.id)} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground">{topic.title}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {strategy && <Badge variant="secondary">{strategy.name}</Badge>}
                          <span>{topic.stage}</span>
                          <span>Prioridade {topic.priority}</span>
                        </span>
                      </span>
                    </label>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">Nenhum tópico aprovado neste filtro</p>
                  <p className="text-sm text-muted-foreground">Ajuste a busca ou escolha outra estratégia.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Nenhum tópico aprovado disponível</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Gere tópicos na estratégia, aprove os melhores e volte para mandar tudo para produção.
              </p>
            </div>
            <Button className="gap-2" onClick={goToStrategyTopics}>
              <Lightbulb className="h-4 w-4" />
              Ir para tópicos da estratégia
            </Button>
          </div>
        )}

        {hasApprovedTopics && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || selectedCount === 0} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar {selectedCount || ""} para produção
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
