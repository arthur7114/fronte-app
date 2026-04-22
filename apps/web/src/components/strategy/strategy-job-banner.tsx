"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getActiveStrategyJobs } from "@/app/dashboard/estrategias/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function StrategyJobBanner({ strategyId }: { strategyId: string }) {
  const router = useRouter()
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0)
  const [isFirstCheck, setIsFirstCheck] = useState(true)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const checkJobs = async () => {
      try {
        const result = await getActiveStrategyJobs(strategyId)
        if (result.error) {
          console.error("Erro ao verificar status dos jobs:", result.error)
          return
        }

        const count = result.count || 0

        setActiveJobsCount((prev) => {
          // Se não é a primeira checagem, e tínhamos jobs rodando, e agora zerou:
          if (!isFirstCheck && prev > 0 && count === 0) {
            toast.success("Processamento de Inteligência Artificial concluído!")
            // Atualiza a página para mostrar os novos dados gerados (topics, briefs, posts, etc)
            router.refresh()
          }
          return count
        })

        setIsFirstCheck(false)
      } catch (err) {
        console.error("Falha silenciosa no polling de jobs:", err)
      }
    }

    // Checagem imediata
    checkJobs()

    // Polling interval changes based on jobs count
    // 3 seconds if jobs are running, 5 seconds if idle
    const intervalTime = activeJobsCount > 0 ? 3000 : 5000
    intervalId = setInterval(checkJobs, intervalTime)

    return () => clearInterval(intervalId)
  }, [strategyId, router, isFirstCheck, activeJobsCount])

  if (activeJobsCount === 0) {
    return null
  }

  return (
    <Alert className="mb-6 border-indigo-200 bg-indigo-50 text-indigo-900 shadow-sm animate-in fade-in slide-in-from-top-2">
      <Sparkles className="h-5 w-5 text-indigo-600" />
      <AlertTitle className="flex items-center gap-2 font-semibold text-indigo-800">
        A Inteligência Artificial está trabalhando
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
      </AlertTitle>
      <AlertDescription className="text-indigo-700/90">
        Existem {activeJobsCount} tarefa{activeJobsCount > 1 ? "s" : ""} em processamento no background para esta estratégia. Você pode continuar usando a plataforma normalmente, avisaremos quando terminar.
      </AlertDescription>
    </Alert>
  )
}
