"use client"

import { useMemo, useState, useTransition } from "react"
import type { KeyboardEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Tables } from "@super/db"
import { normalizeCandidateStatus } from "@super/shared"
import {
  Archive,
  ArrowLeft,
  ClipboardList,
  Copy,
  FileText,
  Hash,
  Lightbulb,
  MapPin,
  MessageSquare,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { KeywordsTable } from "@/components/content-plan/keywords-table"
import { TopicsTable } from "@/components/content-plan/topics-table"
import { StrategyAssistant } from "@/components/strategy/strategy-assistant"
import { StrategyBriefing } from "@/components/strategy/strategy-briefing"
import { StrategyJobBanner } from "@/components/strategy/strategy-job-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { KeywordItem, Strategy, TopicItem } from "@/lib/strategies"
import type { StrategyStatsMap } from "../client"
import { archiveStrategy, duplicateStrategy } from "../actions"

type StrategyTab = "briefing" | "chat" | "keywords" | "topics"
type KeywordCandidate = Tables<"keyword_candidates">
type TopicCandidate = Tables<"topic_candidates">

const TYPE_META: Record<
  Strategy["type"],
  { label: string; icon: typeof Sparkles; accent: string }
> = {
  seo: { label: "SEO", icon: TrendingUp, accent: "bg-primary/10 text-primary" },
  local: { label: "Local", icon: MapPin, accent: "bg-emerald-100 text-emerald-700" },
  blog: { label: "Blog", icon: FileText, accent: "bg-amber-100 text-amber-700" },
  conversao: { label: "Conversão", icon: Zap, accent: "bg-orange-100 text-orange-700" },
}

const STAGE_LABELS: Record<string, TopicItem["stage"]> = {
  awareness: "Consciência",
  consciencia: "Consciência",
  "consciência": "Consciência",
  consideration: "Consideração",
  consideracao: "Consideração",
  "consideração": "Consideração",
  decision: "Decisão",
  decisao: "Decisão",
  "decisão": "Decisão",
}

function statusBadge(status: Strategy["status"]) {
  if (status === "ativa") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Ativa</Badge>
  }
  if (status === "pausada") {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pausada</Badge>
  }
  return <Badge variant="secondary">Rascunho</Badge>
}

function normalizeStage(stage: string | null | undefined): TopicItem["stage"] {
  if (!stage) return "Consciência"
  return STAGE_LABELS[stage.toLowerCase()] ?? "Consciência"
}

function normalizeTopicStatus(status: string): TopicItem["status"] {
  return normalizeCandidateStatus(status)
}

function getPriority(score: number | null): TopicItem["priority"] {
  if (score == null) return "média"
  if (score >= 80) return "alta"
  if (score >= 50) return "média"
  return "baixa"
}

function adaptKeyword(row: KeywordCandidate): KeywordItem {
  return {
    id: row.id,
    strategyId: row.strategy_id ?? "",
    keyword: row.keyword,
    difficulty: row.difficulty ?? "baixa",
    traffic: row.search_volume ?? undefined,
    search_volume: row.search_volume ?? undefined,
    search_volume_int: row.search_volume_int,
    cpc: row.cpc,
    competition_level: row.competition_level,
    search_intent: row.search_intent,
    source: row.source,
    estimated_potential: row.estimated_potential ?? undefined,
    stage: normalizeStage(row.journey_stage),
    type: row.tail_type,
    status: normalizeCandidateStatus(row.status),
  }
}

function adaptTopic(row: TopicCandidate): TopicItem {
  return {
    id: row.id,
    strategyId: row.strategy_id ?? "",
    title: row.topic,
    keywords: row.source ? [row.source] : [],
    stage: normalizeStage(row.journey_stage),
    priority: getPriority(row.score),
    estimatedTraffic: row.score == null ? "—" : String(row.score),
    status: normalizeTopicStatus(row.status),
  }
}

interface StrategyDetailClientProps {
  strategy: Strategy
  stats: StrategyStatsMap[string]
  keywords: KeywordCandidate[]
  topics: TopicCandidate[]
  postsCount: number
  initialTab?: string
  openSuggestTopics?: boolean
}

export function StrategyDetailClient({
  strategy,
  stats,
  keywords,
  topics,
  postsCount,
  initialTab,
  openSuggestTopics = false,
}: StrategyDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<StrategyTab>(
    initialTab === "chat" || initialTab === "keywords" || initialTab === "topics" ? initialTab : "briefing",
  )

  const keywordItems = useMemo(() => keywords.map(adaptKeyword), [keywords])
  const topicItems = useMemo(() => topics.map(adaptTopic), [topics])
  const meta = TYPE_META[strategy.type] || TYPE_META.seo
  const Icon = meta.icon
  const approvedTopics = topicItems.filter((topic) => topic.status === "approved").length

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateStrategy(strategy.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.success)
      if (result.strategyId) {
        router.push(`/dashboard/estrategias/${result.strategyId}`)
      }
    })
  }

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveStrategy(strategy.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.success)
      router.push("/dashboard/estrategias")
    })
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 gap-1.5 text-muted-foreground"
        onClick={() => router.push("/dashboard/estrategias")}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Estratégias
      </Button>

      <header className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              meta.accent,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {strategy.name}
              </h1>
              {statusBadge(strategy.status)}
              <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider">
                {meta.label}
              </Badge>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {strategy.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {postsCount > 0 && (
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/dashboard/artigos?strategy=${strategy.id}`}>
                <FileText className="h-4 w-4" />
                Ver artigos desta estratégia
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mais ações">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                {strategy.status === "ativa" ? (
                  <>
                    <PauseCircle className="h-4 w-4" />
                    Pausar estratégia
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Ativar estratégia
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onSelect={handleDuplicate} disabled={isPending}>
                <Copy className="h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onSelect={handleArchive}
                disabled={isPending}
              >
                <Archive className="h-4 w-4" />
                Arquivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Stat
          label="Palavras-chave"
          value={stats.keywords}
          hint={`${keywordItems.filter((keyword) => keyword.status === "approved").length} aprovadas`}
          onClick={() => setActiveTab("keywords")}
        />
        <Stat
          label="Tópicos"
          value={stats.topics}
          hint={`${approvedTopics} prontos`}
          onClick={() => setActiveTab("topics")}
        />
      </dl>

      <StrategyJobBanner strategyId={strategy.id} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as StrategyTab)}
        className="space-y-5"
      >
        <TabsList>
          <TabsTrigger value="briefing" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" />
            Briefing
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Conversar com IA
          </TabsTrigger>
          <TabsTrigger value="keywords" className="gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            Palavras-chave
            <span className="ml-1 text-xs text-muted-foreground">{keywordItems.length}</span>
          </TabsTrigger>
          <TabsTrigger value="topics" className="gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" />
            Tópicos
            <span className="ml-1 text-xs text-muted-foreground">{topicItems.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="briefing" className="m-0">
          <StrategyBriefing
            strategy={strategy}
            keywords={keywordItems}
            topics={topicItems}
          />
        </TabsContent>

        <TabsContent value="chat" className="m-0">
          <StrategyAssistant strategy={strategy} />
        </TabsContent>

        <TabsContent value="keywords" className="m-0">
          <KeywordsTable
            keywords={keywordItems}
            strategyId={strategy.id}
            strategyName={strategy.name}
          />
        </TabsContent>

        <TabsContent value="topics" className="m-0">
          <TopicsTable
            topics={topicItems}
            keywords={keywordItems}
            strategyId={strategy.id}
            strategyName={strategy.name}
            initialSuggestOpen={openSuggestTopics}
          />
        </TabsContent>

      </Tabs>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  accent = false,
  onClick,
}: {
  label: string
  value: number | string
  hint?: string
  accent?: boolean
  onClick?: () => void
}) {
  const interactiveProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onClick()
          }
        },
      }
    : {}

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 border-l border-border pl-4 first:border-l-0 first:pl-0 sm:pl-6",
        onClick && "cursor-pointer rounded-md py-1 transition-colors hover:bg-muted/50",
      )}
      {...interactiveProps}
    >
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-2xl font-semibold tabular-nums text-foreground",
          accent && "text-primary",
        )}
      >
        {value}
      </dd>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
