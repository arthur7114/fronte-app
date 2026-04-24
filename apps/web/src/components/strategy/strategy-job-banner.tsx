"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { getActiveStrategyJobs } from "@/app/dashboard/estrategias/actions"

export function StrategyJobBanner({ strategyId }: { strategyId: string }) {
  const router = useRouter()
  const previousCountRef = useRef<number | null>(null)
  const [activeJobsCount, setActiveJobsCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const checkJobs = async () => {
      try {
        const result = await getActiveStrategyJobs(strategyId)
        if (result.error || cancelled) return

        const count = result.count || 0
        const previousCount = previousCountRef.current

        if (previousCount !== null && previousCount > 0 && count === 0) {
          toast.success("Processamento de IA concluido.")
          router.refresh()
        }

        previousCountRef.current = count
        setActiveJobsCount(count)
      } catch {
        // The banner is best-effort; the job-specific banners still show errors.
      }
    }

    checkJobs()
    const intervalId = window.setInterval(checkJobs, activeJobsCount > 0 ? 3000 : 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [strategyId, router, activeJobsCount])

  if (activeJobsCount === 0) return null

  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <span className="absolute h-2 w-2 animate-ping rounded-full bg-primary/40" />
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">IA trabalhando nesta estrategia</p>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {activeJobsCount} tarefa{activeJobsCount > 1 ? "s" : ""} em andamento. A tela sera atualizada quando terminar.
        </p>
      </div>
    </div>
  )
}
