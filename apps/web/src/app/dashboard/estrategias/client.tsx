"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Lightbulb,
  Plus,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Target,
  FileText,
  Hash,
  Sparkles,
  TrendingUp,
  MapPin,
  Zap,
  ArrowRight,
  Archive,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Strategy, StrategyStatus } from "@/lib/strategies"
import { archiveStrategy, duplicateStrategy } from "./actions"

const TYPE_META: Record<
  Strategy["type"],
  { label: string; icon: typeof Sparkles; accent: string }
> = {
  seo: { label: "SEO", icon: TrendingUp, accent: "bg-primary/10 text-primary" },
  local: { label: "Local", icon: MapPin, accent: "bg-emerald-100 text-emerald-700" },
  blog: { label: "Blog", icon: FileText, accent: "bg-amber-100 text-amber-700" },
  conversao: { label: "Conversão", icon: Zap, accent: "bg-orange-100 text-orange-700" },
}

function statusBadge(status: StrategyStatus) {
  if (status === "ativa") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Ativa</Badge>
  }
  if (status === "pausada") {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pausada</Badge>
  }
  return <Badge variant="secondary">Rascunho</Badge>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export type StrategyStatsMap = Record<
  string,
  {
    keywords: number
    topics: number
    articles: number
    inProduction: number
    published: number
    drafts: number
    scheduled: number
  }
>

interface EstrategiasListClientProps {
  initialStrategies: Strategy[]
  statsMap: StrategyStatsMap
}

export function EstrategiasListClient({
  initialStrategies,
  statsMap,
}: EstrategiasListClientProps) {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const result = await duplicateStrategy(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        router.refresh()
      }
    })
  }

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const result = await archiveStrategy(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        setStrategies((prev) => prev.filter((s) => s.id !== id))
        router.refresh()
      }
    })
  }

  const aggregate = strategies.reduce(
    (acc, s) => {
      const stats = statsMap[s.id] || { keywords: 0, articles: 0 }
      acc.keywords += stats.keywords
      acc.articles += stats.articles
      return acc
    },
    { keywords: 0, articles: 0 },
  )
  const activeCount = strategies.filter((s) => s.status === "ativa").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Estratégias</h1>
          <p className="mt-1 text-muted-foreground">
            Cada estratégia tem suas próprias palavras-chave, tópicos e artigos.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/app/estrategias/nova">
            <Plus className="h-4 w-4" />
            Nova estratégia
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Lightbulb className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Total
              </Badge>
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">{strategies.length}</p>
            <p className="text-sm text-muted-foreground">
              {activeCount} {activeCount === 1 ? "ativa" : "ativas"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Hash className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Agregado
              </Badge>
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">{aggregate.keywords}</p>
            <p className="text-sm text-muted-foreground">Palavras-chave monitoradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <FileText className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Publicados
              </Badge>
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">{aggregate.articles}</p>
            <p className="text-sm text-muted-foreground">Artigos entre todas as estratégias</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy list */}
      {strategies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Lightbulb className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Nenhuma estratégia ainda</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Crie sua primeira estratégia para começar a planejar conteúdo.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/app/estrategias/nova">
                <Plus className="h-4 w-4" />
                Criar estratégia
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {strategies.map((strategy) => {
            const meta = TYPE_META[strategy.type] || TYPE_META.seo
            const Icon = meta.icon
            const stats = statsMap[strategy.id] || { keywords: 0, topics: 0, articles: 0 }
            const href = `/app/estrategias/${strategy.id}`
            return (
              <Card
                key={strategy.id}
                className="group relative transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={href} className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          meta.accent,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                          {strategy.name}
                        </CardTitle>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="text-[11px]">
                            {meta.label}
                          </Badge>
                          {statusBadge(strategy.status)}
                        </div>
                      </div>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={href} className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Abrir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleDuplicate(strategy.id)}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => handleArchive(strategy.id)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Archive className="h-4 w-4" />
                          Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {strategy.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <Stat label="Keywords" value={stats.keywords} />
                    <Stat label="Tópicos" value={stats.topics} />
                    <Stat label="Artigos" value={stats.articles} />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      <span>{strategy.tone}</span>
                    </div>
                    <span>Atualizado {formatDate(strategy.lastUpdated)}</span>
                  </div>

                  <Button asChild className="w-full gap-2">
                    <Link href={href}>
                      Abrir estratégia
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
