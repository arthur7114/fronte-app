"use client"

import { useMemo, useState } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KeywordsTable } from "@/components/content-plan/keywords-table"
import { TopicsTable } from "@/components/content-plan/topics-table"
import { ArticlesTable } from "@/components/articles/articles-table"
import { ArticleEditor } from "@/components/articles/article-editor"
import { GenerateArticleDialog } from "@/components/articles/generate-article-dialog"
import { ProductionQueue } from "@/components/articles/production-queue"
import { StrategyAssistant } from "@/components/strategy/strategy-assistant"
import { StrategyBriefing } from "@/components/strategy/strategy-briefing"
import { CompetitorResearch } from "@/components/competitors/competitor-research"
import {
  ArrowLeft,
  ClipboardList,
  Copy,
  FileText,
  Gauge,
  MapPin,
  MessageSquare,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Sparkles,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getArticlesByStrategy,
  getKeywordsByStrategy,
  getStrategy,
  getStrategyStats,
  getTopicsByStrategy,
  type Strategy,
} from "@/lib/strategies"
import {
  getInsightsFor,
  useCompetitorsStore,
} from "@/lib/competitors-store"
import {
  getPendingSuggestions,
  useBriefingStore,
} from "@/lib/strategy-briefing"

const TYPE_META: Record<
  Strategy["type"],
  { label: string; icon: typeof Sparkles; accent: string }
> = {
  seo: { label: "SEO", icon: TrendingUp, accent: "bg-primary/10 text-primary" },
  local: { label: "Local", icon: MapPin, accent: "bg-emerald-100 text-emerald-700" },
  blog: { label: "Blog", icon: FileText, accent: "bg-amber-100 text-amber-700" },
  conversao: { label: "Conversão", icon: Zap, accent: "bg-orange-100 text-orange-700" },
}

function statusBadge(status: Strategy["status"]) {
  if (status === "ativa") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Ativa
      </Badge>
    )
  }
  if (status === "pausada") {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        Pausada
      </Badge>
    )
  }
  return <Badge variant="secondary">Rascunho</Badge>
}

export default function StrategyDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const strategy = useMemo(() => (id ? getStrategy(id) : undefined), [id])

  const [activeTab, setActiveTab] = useState<
    "briefing" | "chat" | "competitors" | "keywords" | "topics" | "articles"
  >("briefing")
  const [articlesFilter, setArticlesFilter] = useState<
    "all" | "draft" | "review" | "scheduled" | "published"
  >("all")
  useCompetitorsStore()
  useBriefingStore()
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)

  if (!strategy) {
    if (typeof window !== "undefined") {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-medium text-foreground">
            Estratégia não encontrada
          </p>
          <Button asChild>
            <Link href="/dashboard/estrategias">Ver todas as estratégias</Link>
          </Button>
        </div>
      )
    }
    notFound()
  }

  const meta = TYPE_META[strategy.type]
  const Icon = meta.icon
  const stats = getStrategyStats(strategy.id)
  const keywords = getKeywordsByStrategy(strategy.id)
  const topics = getTopicsByStrategy(strategy.id)
  const articles = getArticlesByStrategy(strategy.id)
  const inProduction = articles.filter(
    (a) => a.status === "generating" || a.status === "queued",
  )
  const competitorInsights = getInsightsFor(strategy.id)
  const pendingBriefings = getPendingSuggestions(strategy.id)

  if (selectedArticle) {
    return (
      <ArticleEditor
        articleId={selectedArticle}
        isNew={selectedArticle === "new"}
        onBack={() => setSelectedArticle(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 gap-1.5 text-muted-foreground"
        onClick={() => router.push("/dashboard/estrategias")}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Estratégias
      </Button>

      {/* Compact Header */}
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
              <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                {strategy.name}
              </h1>
              {statusBadge(strategy.status)}
              <Badge variant="outline" className="text-[11px] font-normal">
                {meta.label}
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {strategy.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button className="gap-2" onClick={() => setGenerateOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Gerar artigo
          </Button>
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
              <DropdownMenuItem className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* KPI strip — linha horizontal, cliques levam para aba correspondente */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Stat
          label="Palavras-chave"
          value={stats.keywords}
          hint={`${keywords.filter((k) => k.status === "approved").length} aprovadas`}
          onClick={() => setActiveTab("keywords")}
        />
        <Stat
          label="Tópicos"
          value={stats.topics}
          hint={`${topics.filter((t) => t.status === "approved").length} prontos`}
          onClick={() => setActiveTab("topics")}
        />
        <Stat
          label="Em revisão"
          value={articles.filter((a) => a.status === "review").length}
          hint={`${stats.drafts} rascunho${stats.drafts === 1 ? "" : "s"}`}
          accent={articles.some((a) => a.status === "review")}
          onClick={() => {
            setArticlesFilter("review")
            setActiveTab("articles")
          }}
        />
        <Stat
          label="Publicados"
          value={stats.published}
          hint="últimos 30 dias"
          onClick={() => {
            setArticlesFilter("published")
            setActiveTab("articles")
          }}
        />
      </dl>

      {inProduction.length > 0 && (
        <ProductionQueue
          items={inProduction}
          title="Em produção nesta estratégia"
          description="Artigos sendo gerados pela IA ou aguardando na fila."
          showStrategy={false}
        />
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="space-y-5"
      >
        <TabsList>
          <TabsTrigger value="briefing" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" />
            Briefing
            {pendingBriefings.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
                {pendingBriefings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Conversar com IA
          </TabsTrigger>
          <TabsTrigger value="competitors" className="gap-1.5">
            <Gauge className="h-3.5 w-3.5" />
            Concorrentes
            {competitorInsights.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
                {competitorInsights.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="keywords">
            Palavras-chave
            <span className="ml-1.5 text-xs text-muted-foreground">
              {keywords.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="topics">
            Tópicos
            <span className="ml-1.5 text-xs text-muted-foreground">
              {topics.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="articles">
            Artigos
            <span className="ml-1.5 text-xs text-muted-foreground">
              {articles.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="briefing" className="m-0">
          <StrategyBriefing strategyId={strategy.id} />
        </TabsContent>

        <TabsContent value="chat" className="m-0">
          <StrategyAssistant strategy={strategy} />
        </TabsContent>

        <TabsContent value="competitors" className="m-0">
          <CompetitorResearch
            strategy={strategy}
            onContinueToTopics={() => setActiveTab("topics")}
          />
        </TabsContent>

        <TabsContent value="keywords" className="m-0">
          <KeywordsTable
            keywords={keywords}
            strategyId={strategy.id}
            strategyName={strategy.name}
          />
        </TabsContent>

        <TabsContent value="topics" className="m-0">
          <TopicsTable
            topics={topics}
            strategyId={strategy.id}
            strategyName={strategy.name}
            onGenerateArticle={() => setGenerateOpen(true)}
          />
        </TabsContent>

        <TabsContent value="articles" className="m-0 space-y-4">
          <ArticlesTable
            articles={articles}
            onSelectArticle={setSelectedArticle}
            initialFilter={articlesFilter}
            emptyLabel={`Nenhum artigo em ${strategy.name} ainda.`}
          />
        </TabsContent>
      </Tabs>

      <GenerateArticleDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onGenerated={(articleId) => {
          setGenerateOpen(false)
          setSelectedArticle(articleId)
        }}
      />
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
  const content = (
    <>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "text-2xl font-semibold tabular-nums text-foreground",
          accent && "text-primary",
        )}
      >
        {value}
      </dd>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </>
  )
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex flex-col gap-0.5 border-l border-border pl-4 text-left first:border-l-0 first:pl-0 sm:pl-6 hover:[&_dd]:text-primary"
      >
        {content}
      </button>
    )
  }
  return (
    <div className="flex flex-col gap-0.5 border-l border-border pl-4 first:border-l-0 first:pl-0 sm:pl-6">
      {content}
    </div>
  )
}
