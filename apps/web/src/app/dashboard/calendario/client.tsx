"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ContentCalendar } from "@/components/content-plan/content-calendar"
import {
  Calendar,
  LayoutList,
  Plus,
  Sparkles,
  ExternalLink,
  CalendarPlus,
  FileText,
  Clock,
} from "lucide-react"
import type { ArticleItem, Strategy, CalendarEvent } from "@/lib/strategies"

export function CalendarioClient({
  articles,
  strategies,
}: {
  articles: ArticleItem[]
  strategies: Strategy[]
}) {
  const [strategyFilter, setStrategyFilter] = useState<string>("all")

  // Generate calendar events dynamically from articles
  const events: CalendarEvent[] = useMemo(() => {
    return articles
      .filter((a) => a.scheduledAt)
      .map((a) => ({
        id: a.id,
        strategyId: a.strategyId,
        date: new Date(a.scheduledAt!).getTime(),
        title: a.title,
        status: a.status as "published" | "scheduled" | "draft",
      }))
  }, [articles])

  const filteredEvents = useMemo(() => {
    if (strategyFilter === "all") return events
    return events.filter((e) => e.strategyId === strategyFilter)
  }, [strategyFilter, events])

  const scheduled = useMemo(
    () =>
      articles.filter(
        (a) =>
          a.status === "scheduled" &&
          (strategyFilter === "all" || a.strategyId === strategyFilter),
      ),
    [articles, strategyFilter],
  )

  const unscheduled = useMemo(
    () =>
      articles.filter(
        (a) =>
          (a.status === "draft" || a.status === "review") &&
          (strategyFilter === "all" || a.strategyId === strategyFilter),
      ),
    [articles, strategyFilter],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calendário</h1>
          <p className="mt-1 text-muted-foreground">
            Visão única de tudo que está publicado, agendado ou esperando
            agendamento em todas as estratégias.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={strategyFilter} onValueChange={setStrategyFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrar por estratégia" />
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
          <Button asChild className="gap-2">
            <Link href="/dashboard/artigos/novo">
              <Plus className="h-4 w-4" />
              Novo artigo
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <QuickStat
          icon={Calendar}
          label="Agendados"
          value={scheduled.length}
          tint="text-blue-600"
        />
        <QuickStat
          icon={Clock}
          label="Aguardando agendamento"
          value={unscheduled.length}
          tint="text-amber-600"
        />
        <QuickStat
          icon={FileText}
          label="Publicados"
          value={
            articles.filter(
              (a) =>
                a.status === "published" &&
                (strategyFilter === "all" || a.strategyId === strategyFilter),
            ).length
          }
          tint="text-emerald-600"
        />
        <QuickStat
          icon={Sparkles}
          label="Em produção"
          value={
            articles.filter(
              (a) =>
                (a.status === "generating" || a.status === "queued") &&
                (strategyFilter === "all" || a.strategyId === strategyFilter),
            ).length
          }
          tint="text-primary"
        />
      </div>

      <Tabs defaultValue="calendar" className="space-y-5">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <LayoutList className="h-3.5 w-3.5" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="m-0">
          <ContentCalendar events={filteredEvents} />
        </TabsContent>

        <TabsContent value="list" className="m-0 space-y-6">
          <ArticleTableCard
            title="Agendados"
            description="Artigos já programados para publicação."
            icon={Calendar}
            articles={scheduled}
            strategies={strategies}
            variant="scheduled"
            emptyLabel="Nenhum artigo agendado por enquanto."
          />

          <ArticleTableCard
            title="Aguardando agendamento"
            description="Rascunhos e artigos em revisão sem data definida."
            icon={Clock}
            articles={unscheduled}
            strategies={strategies}
            variant="unscheduled"
            emptyLabel="Nenhum artigo esperando agendamento."
          />

          {/* Atalhos */}
          <Card>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Precisa de mais conteúdo?
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Gere novos artigos em massa a partir dos tópicos aprovados ou
                  abra a tela completa de artigos.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/dashboard/artigos/novo">
                    <Sparkles className="h-4 w-4" />
                    Gerar novos
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="gap-1.5">
                  <Link href="/dashboard/artigos">
                    Ver todos os artigos
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Calendar
  label: string
  value: number
  tint: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${tint}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ArticleTableCard({
  title,
  description,
  icon: Icon,
  articles,
  strategies,
  variant,
  emptyLabel,
}: {
  title: string
  description: string
  icon: typeof Calendar
  articles: ArticleItem[]
  strategies: Strategy[]
  variant: "scheduled" | "unscheduled"
  emptyLabel: string
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <Badge variant="secondary" className="font-normal">
              {articles.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Icon className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artigo</TableHead>
                <TableHead className="w-[200px]">Estratégia</TableHead>
                <TableHead className="w-[180px]">
                  {variant === "scheduled" ? "Data agendada" : "Status"}
                </TableHead>
                <TableHead className="w-[140px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => {
                const strategy = strategies.find(
                  (s) => s.id === article.strategyId,
                )
                return (
                  <TableRow key={article.id}>
                    <TableCell>
                      <p className="font-medium line-clamp-1 text-foreground">
                        {article.title}
                      </p>
                      {article.keywords.length > 0 && (
                        <p className="mt-0.5 text-xs line-clamp-1 text-muted-foreground">
                          {article.keywords.join(" · ")}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {strategy && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: strategy.color }}
                          />
                          <span className="line-clamp-1">{strategy.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {variant === "scheduled" ? (
                        <span className="flex items-center gap-1.5 text-sm text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-blue-600" />
                          {article.scheduledFor ?? "—"}
                        </span>
                      ) : article.status === "review" ? (
                        <Badge className="bg-amber-100 text-amber-700">
                          Em revisão
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant={variant === "scheduled" ? "ghost" : "outline"} className="gap-1.5">
                        <Link href={`/dashboard/artigos/${article.id}`}>
                          {variant !== "scheduled" && <CalendarPlus className="h-3.5 w-3.5" />}
                          {variant === "scheduled" ? "Abrir" : "Agendar"}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
