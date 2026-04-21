"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sparkles,
  Search,
  Loader2,
  CheckCircle2,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TOPICS, listStrategies } from "@/lib/strategies"

type BulkGenerateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated?: (count: number) => void
}

export function BulkGenerateDialog({
  open,
  onOpenChange,
  onGenerated,
}: BulkGenerateDialogProps) {
  const strategies = listStrategies()
  const [strategyFilter, setStrategyFilter] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<"select" | "generating" | "done">("select")

  const approvedTopics = useMemo(
    () => TOPICS.filter((t) => t.status === "approved"),
    [],
  )

  const filtered = useMemo(() => {
    return approvedTopics.filter((t) => {
      if (strategyFilter !== "all" && t.strategyId !== strategyFilter)
        return false
      if (
        query.trim() &&
        !t.title.toLowerCase().includes(query.toLowerCase()) &&
        !t.keywords.some((kw) =>
          kw.toLowerCase().includes(query.toLowerCase()),
        )
      )
        return false
      return true
    })
  }, [approvedTopics, strategyFilter, query])

  const allSelected =
    filtered.length > 0 && filtered.every((t) => selected.has(t.id))

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected)
      filtered.forEach((t) => next.delete(t.id))
      setSelected(next)
    } else {
      const next = new Set(selected)
      filtered.forEach((t) => next.add(t.id))
      setSelected(next)
    }
  }

  const reset = () => {
    setSelected(new Set())
    setQuery("")
    setStrategyFilter("all")
    setStep("select")
  }

  const handleGenerate = async () => {
    setStep("generating")
    await new Promise((r) => setTimeout(r, 1600))
    setStep("done")
    onGenerated?.(selected.size)
  }

  const handleClose = (next: boolean) => {
    if (!next) {
      setTimeout(reset, 200)
    }
    onOpenChange(next)
  }

  const selectedCount = selected.size

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] sm:max-w-[680px]">
        {step === "select" && (
          <>
            <DialogHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Gerar artigos em massa</DialogTitle>
              <DialogDescription>
                Selecione os tópicos aprovados e a IA vai cuidar da produção —
                você pode acompanhar tudo na tela de Artigos.
              </DialogDescription>
            </DialogHeader>

            {/* Filtros */}
            <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar tópico ou palavra-chave"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="ml-2 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                <SelectTrigger className="sm:w-[200px]">
                  <SelectValue placeholder="Estratégia" />
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
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-1 py-1 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                <Checkbox
                  checked={allSelected && filtered.length > 0}
                  onCheckedChange={toggleAll}
                  disabled={filtered.length === 0}
                />
                {selectedCount > 0 ? (
                  <span className="text-foreground">
                    {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span>Selecionar todos os visíveis</span>
                )}
              </label>
              <span className="text-xs text-muted-foreground">
                {filtered.length} tópico{filtered.length !== 1 ? "s" : ""} aprovados
              </span>
            </div>

            {/* Lista de tópicos */}
            <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <Lightbulb className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">
                    Nenhum tópico aprovado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aprove tópicos em alguma estratégia para gerar em massa.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map((topic) => {
                    const isSelected = selected.has(topic.id)
                    const strategy = strategies.find(
                      (s) => s.id === topic.strategyId,
                    )
                    return (
                      <li key={topic.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-start gap-3 p-3 transition-colors",
                            isSelected ? "bg-primary/5" : "hover:bg-muted/40",
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggle(topic.id)}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {topic.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {strategy && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: strategy.color }}
                                  />
                                  {strategy.name}
                                </span>
                              )}
                              {topic.keywords.slice(0, 3).map((kw) => (
                                <Badge
                                  key={kw}
                                  variant="secondary"
                                  className="text-[10px] font-normal"
                                >
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px] font-normal"
                          >
                            Prioridade {topic.priority}
                          </Badge>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button
                className="gap-2"
                disabled={selectedCount === 0}
                onClick={handleGenerate}
              >
                <Sparkles className="h-4 w-4" />
                Enviar {selectedCount > 0 ? selectedCount : ""} para produção
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "generating" && (
          <div className="py-10 text-center">
            <div className="relative mx-auto mb-5 h-14 w-14">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Enviando para produção…
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedCount} artigo{selectedCount > 1 ? "s" : ""} entraram na fila.
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Pronto! A produção começou.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe os artigos em tempo real na seção "Em produção" na tela de
              Artigos.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Fechar
              </Button>
              <Button onClick={() => handleClose(false)}>
                Ir para Artigos
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
