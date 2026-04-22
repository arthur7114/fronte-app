"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
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
import { ArticlesList } from "@/components/articles/articles-list"
import { ArticleEditor } from "@/components/articles/article-editor"
import { ProductionQueue } from "@/components/articles/production-queue"
import { StrategyAssistant } from "@/components/strategy/strategy-assistant"
import { StrategyJobBanner } from "@/components/strategy/strategy-job-banner"
import { StrategyForm, type StrategyDraft, type OperationMode } from "@/components/strategy/strategy-form"
import { StrategyPreview } from "@/components/strategy/strategy-preview"
import { CompetitorsView } from "@/components/content-plan/competitors-view"
import type { Tables } from "@super/db"
import {
  Archive,
  ArrowLeft,
  Copy,
  FileText,
  MapPin,
  MessageSquare,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Zap,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Strategy } from "@/lib/strategies"
import type { StrategyStatsMap } from "../client"
import { archiveStrategy, duplicateStrategy, updateStrategy } from "../actions"
import { OPERATION_MODE_HELP, OPERATION_MODE_LABELS } from "@/lib/automation"

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

interface StrategyDetailClientProps {
  strategy: Strategy
  stats: StrategyStatsMap[string]
  keywords: any[]
  topics: any[]
  articles: any[]
  competitors?: any[]
  automationConfig: Tables<"automation_configs"> | null
}

export function StrategyDetailClient({
  strategy,
  stats,
  keywords,
  topics,
  articles,
  competitors = [],
  automationConfig,
}: StrategyDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [activeTab, setActiveTab] = useState<
    "chat" | "keywords" | "topics" | "articles" | "competitors" | "settings"
  >("chat")
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)

  // Draft state for Strategy Settings
  const [draft, setDraft] = useState<StrategyDraft>({
    name: strategy.name,
    type: strategy.type,
    goal: strategy.goal || "",
    description: strategy.description,
    audience: strategy.audience || "",
    tone: strategy.tone || "",
    cadence: strategy.cadence || 8,
    operation_mode: strategy.operation_mode || "manual",
  })
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  const handleUpdateSettings = async () => {
    setIsSavingDraft(true)
    const res = await updateStrategy(strategy.id, draft)
    setIsSavingDraft(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Configurações da estratégia atualizadas!")
  }

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateStrategy(strategy.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        if (result.strategyId) {
          router.push(`/app/estrategias/${result.strategyId}`)
        }
      }
    })
  }

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveStrategy(strategy.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        router.push("/app/estrategias")
      }
    })
  }

  const meta = TYPE_META[strategy.type] || TYPE_META.seo
  const Icon = meta.icon
  const inProduction = articles.filter(
    (a) => a.status === "generating" || a.status === "queued" || a.status === "in_progress",
  )

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
        onClick={() => router.push("/app/estrategias")}
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
              <h1 className="text-xl font-semibold text-foreground md:text-2xl tracking-tight">
                {strategy.name}
              </h1>
              {statusBadge(strategy.status)}
              <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider">
                {meta.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild className="gap-2">
            <Link href={`/dashboard/artigos/novo?strategyId=${strategy.id}`}>
              <Sparkles className="h-4 w-4" />
              Gerar artigo
            </Link>
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
              <DropdownMenuItem className="gap-2" onSelect={handleDuplicate} disabled={isPending}>
                <Copy className="h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onSelect={handleArchive} disabled={isPending}>
                <Archive className="h-4 w-4" />
                Arquivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* KPI strip */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Stat label="Palavras-chave" value={stats.keywords} hint={`${keywords.filter((k) => k.status === "approved").length} aprovadas`} />
        <Stat label="Tópicos" value={stats.topics} hint={`${topics.filter((t) => t.status === "approved").length} prontos`} />
        <Stat label="Em produção" value={inProduction.length} hint={`${stats.drafts} rascunhos`} accent />
        <Stat label="Publicados" value={stats.published} hint="últimos 30 dias" />
      </dl>

      {inProduction.length > 0 && (
        <ProductionQueue
          items={inProduction}
          title="Em produção nesta estratégia"
          description="Artigos sendo gerados pela IA ou aguardando na fila."
          showStrategy={false}
        />
      )}

      <StrategyJobBanner strategyId={strategy.id} />

      <div className="rounded-xl border border-border bg-card px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Modo do workspace</p>
            <p className="text-sm font-medium text-foreground">
              {OPERATION_MODE_LABELS[(automationConfig?.operation_mode as keyof typeof OPERATION_MODE_LABELS) || "assisted"]}
            </p>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {OPERATION_MODE_HELP[(automationConfig?.operation_mode as keyof typeof OPERATION_MODE_LABELS) || "assisted"]}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="space-y-5"
      >
        <TabsList>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Conversar com IA
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
          <TabsTrigger value="competitors" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Concorrência
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5 ml-auto">
            <Settings className="h-3.5 w-3.5" />
            Configurações Mestres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="m-0">
          <StrategyAssistant strategy={strategy} keywords={keywords} topics={topics} />
        </TabsContent>

        <TabsContent value="keywords" className="m-0">
          <KeywordsTable
            keywords={keywords as any}
            strategyId={strategy.id}
            strategyName={strategy.name}
          />
        </TabsContent>

        <TabsContent value="topics" className="m-0">
          <TopicsTable
            topics={topics as any}
            strategyId={strategy.id}
            strategyName={strategy.name}
          />
        </TabsContent>

        <TabsContent value="articles" className="m-0 space-y-4">
          <ArticlesList
            articles={articles as any}
            viewMode="list"
            onSelectArticle={setSelectedArticle}
            emptyLabel={`Nenhum artigo em ${strategy.name} ainda.`}
          />
        </TabsContent>

        <TabsContent value="competitors" className="m-0">
          <CompetitorsView competitors={competitors} />
        </TabsContent>

        <TabsContent value="settings" className="m-0">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Editor */}
            <div className="min-w-0 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <StrategyForm value={draft} onChange={setDraft} />
              </div>
            </div>

            {/* Sidebar: preview + AI context */}
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <StrategyPreview
                draft={draft}
                onSubmit={handleUpdateSettings}
                canSubmit={
                  draft.name.trim().length > 2 &&
                  !!draft.type &&
                  draft.audience.trim().length > 2 &&
                  draft.tone.trim().length > 0
                }
                isEditing={true}
                isPending={isSavingDraft}
              />

              {/* AI Context Badge */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Contexto da IA</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">O assistente de IA usa estas informações para gerar sugestões relevantes:</p>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-2">
                    <span className={draft.goal ? "text-green-600" : "text-muted-foreground/50"}>{draft.goal ? "✓" : "○"}</span>
                    <span className={draft.goal ? "text-foreground" : "text-muted-foreground"}>Objetivo{draft.goal ? ": " + draft.goal.slice(0, 40) + (draft.goal.length > 40 ? "…" : "") : " não definido"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={draft.audience ? "text-green-600" : "text-muted-foreground/50"}>{draft.audience ? "✓" : "○"}</span>
                    <span className={draft.audience ? "text-foreground" : "text-muted-foreground"}>Público{draft.audience ? ": " + draft.audience.slice(0, 40) : " não definido"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={draft.tone ? "text-green-600" : "text-muted-foreground/50"}>{draft.tone ? "✓" : "○"}</span>
                    <span className={draft.tone ? "text-foreground" : "text-muted-foreground"}>Tom: {draft.tone || "não definido"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-foreground">{keywords.length} keywords · {topics.length} tópicos</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
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
}: {
  label: string
  value: number | string
  hint?: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 border-l border-border pl-4 first:border-l-0 first:pl-0 sm:pl-6">
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
    </div>
  )
}
