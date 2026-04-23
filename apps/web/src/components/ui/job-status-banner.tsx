"use client"

import { AlertCircle, CheckCircle2, Loader2, RefreshCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { JobStatus } from "@/app/api/job-status/route"

const JOB_LABELS: Record<string, { running: string; completed: string }> = {
  keywords: {
    running: "IA está pesquisando keywords…",
    completed: "Keywords geradas com sucesso",
  },
  topics: {
    running: "IA está gerando tópicos…",
    completed: "Tópicos gerados com sucesso",
  },
}

interface JobStatusBannerProps {
  status: JobStatus
  /** "keywords" | "topics" — controls copy */
  jobLabel?: keyof typeof JOB_LABELS
  count?: number
  errorMessage?: string | null
  onRetry?: () => void
  /** Allow the user to dismiss a failed banner (e.g. stale error) */
  onDismiss?: () => void
  className?: string
}

export function JobStatusBanner({
  status,
  jobLabel = "keywords",
  count,
  errorMessage,
  onRetry,
  onDismiss,
  className,
}: JobStatusBannerProps) {
  const labels = JOB_LABELS[jobLabel] ?? JOB_LABELS.keywords

  if (status === "idle") return null

  // ── Running / Pending ───────────────────────────────────────────────────────
  if (status === "pending" || status === "running") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3",
          className,
        )}
      >
        {/* Pulsing dot (from prototype ProductionQueue pattern) */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">{labels.running}</p>
        <span className="ml-auto text-xs text-muted-foreground">
          {status === "pending" ? "Na fila" : "Processando"}
        </span>
      </div>
    )
  }

  // ── Completed ───────────────────────────────────────────────────────────────
  if (status === "completed") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3",
          className,
        )}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-800">
          {labels.completed}
          {count !== undefined && (
            <span className="ml-1 font-normal text-emerald-700">
              — {count} {jobLabel === "keywords" ? "keywords" : "tópicos"} no total
            </span>
          )}
        </p>
      </div>
    )
  }

  // ── Failed ──────────────────────────────────────────────────────────────────
  if (status === "failed") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3",
          className,
        )}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-destructive">
            Erro ao gerar {jobLabel}
          </p>
          {errorMessage && (
            <p className="mt-0.5 text-xs text-destructive/80">{errorMessage}</p>
          )}
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={onRetry}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 rounded p-1 text-destructive/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Dispensar"
            aria-label="Dispensar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return null
}
