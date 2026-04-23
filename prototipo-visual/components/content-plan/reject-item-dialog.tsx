"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Ban, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { rejectItem, type BanKind, type BanScope } from "@/lib/workspace-store"

type RejectItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // modo single
  itemId?: string
  term?: string
  // modo bulk
  items?: Array<{ id: string; term: string }>
  kind: BanKind
  strategyId?: string
  strategyName?: string
  onDone?: () => void
}

export function RejectItemDialog({
  open,
  onOpenChange,
  itemId,
  term,
  items,
  kind,
  strategyId,
  strategyName,
  onDone,
}: RejectItemDialogProps) {
  const isBulk = Array.isArray(items) && items.length > 1
  const effectiveItems =
    items && items.length > 0
      ? items
      : itemId && term
        ? [{ id: itemId, term }]
        : []
  const headerTerm = isBulk
    ? `${effectiveItems.length} ${kind === "keyword" ? "palavras-chave" : "tópicos"}`
    : (effectiveItems[0]?.term ?? "")
  const [note, setNote] = useState("")
  const [banEnabled, setBanEnabled] = useState(false)
  const [scope, setScope] = useState<BanScope>("strategy")

  useEffect(() => {
    if (!open) {
      setNote("")
      setBanEnabled(false)
      setScope("strategy")
    }
  }, [open])

  const kindLabel = isBulk
    ? kind === "keyword"
      ? "palavras-chave"
      : "tópicos"
    : kind === "keyword"
      ? "palavra-chave"
      : "tópico"

  const handleConfirm = () => {
    effectiveItems.forEach((it) => {
      rejectItem(it.id, {
        kind,
        term: it.term,
        note: note.trim() || undefined,
        ban: banEnabled ? scope : null,
        strategyId,
        strategyName,
      })
    })
    onOpenChange(false)
    onDone?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle>Reprovar {kindLabel}</DialogTitle>
          <DialogDescription>
            Sua nota ajuda a IA a entender o motivo e evitar sugestões parecidas no
            futuro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {isBulk
                ? `Reprovando ${kind === "keyword" ? "palavras-chave" : "tópicos"}`
                : kind === "keyword"
                  ? "Palavra-chave"
                  : "Tópico"}
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {headerTerm}
            </p>
            {isBulk && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {effectiveItems.map((i) => i.term).join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reject-note">
              Motivo{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="reject-note"
              placeholder="Ex: público não é compatível, custo alto, concorrência muito forte…"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border">
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Ban className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Banir {kindLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Impede que a IA sugira esse termo novamente.
                    </p>
                  </div>
                  <Switch
                    checked={banEnabled}
                    onCheckedChange={setBanEnabled}
                    aria-label={`Banir ${kindLabel}`}
                  />
                </div>

                {banEnabled && (
                  <RadioGroup
                    value={scope}
                    onValueChange={(v) => setScope(v as BanScope)}
                    className="mt-4 space-y-2"
                  >
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                        scope === "strategy"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <RadioGroupItem value="strategy" id="scope-strategy" className="mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          Apenas nesta estratégia
                          {strategyName && (
                            <span className="ml-1 font-normal text-muted-foreground">
                              ({strategyName})
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          A nota fica visível na aba "Banidas" da estratégia.
                        </p>
                      </div>
                    </label>

                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                        scope === "workspace"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <RadioGroupItem value="workspace" id="scope-workspace" className="mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          No workspace inteiro
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Vale para todas as estratégias. Gerencie em Configurações.
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="gap-2"
          >
            {banEnabled ? (
              <>
                <Ban className="h-4 w-4" />
                Reprovar e banir
              </>
            ) : (
              "Reprovar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
