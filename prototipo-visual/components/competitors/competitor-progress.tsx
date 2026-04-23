"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, label: "Coletando canais", duration: 900 },
  { id: 2, label: "Classificando temas", duration: 1100 },
  { id: 3, label: "Comparando frequência", duration: 900 },
  { id: 4, label: "Detectando oportunidades", duration: 900 },
]

export function CompetitorProgress({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [pct, setPct] = useState(6)

  useEffect(() => {
    let cancelled = false
    const total = STEPS.reduce((a, s) => a + s.duration, 0)
    let elapsed = 0

    ;(async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (cancelled) return
        setStep(i)
        const start = elapsed
        const end = elapsed + STEPS[i].duration
        const tickCount = 10
        for (let t = 1; t <= tickCount; t++) {
          await new Promise((r) => setTimeout(r, STEPS[i].duration / tickCount))
          if (cancelled) return
          const current = start + (STEPS[i].duration * t) / tickCount
          setPct(Math.round((current / total) * 100))
        }
        elapsed = end
      }
      if (!cancelled) {
        setStep(STEPS.length)
        setPct(100)
        setTimeout(onDone, 250)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [onDone])

  return (
    <Card>
      <CardContent className="space-y-5 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Analisando concorrentes
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Isso costuma levar 20 a 40 segundos. Você pode navegar enquanto
              rodamos.
            </p>
          </div>
          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {pct}%
          </span>
        </div>

        <Progress value={pct} />

        <ul className="grid gap-2.5 sm:grid-cols-2">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <li
                key={s.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm",
                  active && "border-primary/30 bg-primary/5",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-border" />
                )}
                <span
                  className={cn(
                    "text-muted-foreground",
                    (done || active) && "text-foreground",
                  )}
                >
                  {s.label}
                </span>
              </li>
            )
          })}
        </ul>

        {/* Skeletons imitando os próximos cards */}
        <div className="grid gap-3 pt-2 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              </div>
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-3/4" />
              <div className="flex gap-1.5 pt-1">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
