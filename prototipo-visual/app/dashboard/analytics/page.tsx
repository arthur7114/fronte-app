"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  Quote,
  Bot,
  Link2,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// SEO Data
const trafficData = [
  { name: "Jan", visits: 2400 },
  { name: "Fev", visits: 3200 },
  { name: "Mar", visits: 4100 },
  { name: "Abr", visits: 5800 },
  { name: "Mai", visits: 7200 },
  { name: "Jun", visits: 9100 },
  { name: "Jul", visits: 11200 },
  { name: "Ago", visits: 12400 },
]

const ctrData = [
  { name: "Jan", ctr: 2.1 },
  { name: "Fev", ctr: 2.4 },
  { name: "Mar", ctr: 2.8 },
  { name: "Abr", ctr: 3.1 },
  { name: "Mai", ctr: 3.4 },
  { name: "Jun", ctr: 3.2 },
  { name: "Jul", ctr: 3.6 },
  { name: "Ago", ctr: 3.8 },
]

const topKeywords = [
  { keyword: "dentista são paulo zona sul", position: 2, change: "+3", visits: "1.2K" },
  { keyword: "clareamento dental preço", position: 3, change: "+5", visits: "980" },
  { keyword: "implante dentário valor", position: 5, change: "-1", visits: "850" },
  { keyword: "dor de dente o que fazer", position: 4, change: "+2", visits: "720" },
  { keyword: "quanto custa um canal", position: 6, change: "+4", visits: "580" },
]

const topPages = [
  { page: "10 Dicas para Cuidar dos Dentes", visits: "2.3K", ctr: "4.2%" },
  { page: "Quanto Custa um Implante Dentário", visits: "1.8K", ctr: "3.8%" },
  { page: "Clareamento Dental: Vale a Pena?", visits: "1.2K", ctr: "3.5%" },
  { page: "Guia Completo do Aparelho Invisível", visits: "980", ctr: "4.1%" },
]

const lowPerforming = [
  { page: "História da Odontologia", visits: "45", issue: "Tema muito amplo" },
  { page: "Tipos de Anestesia", visits: "89", issue: "Falta de palavras-chave" },
]

// GEO Data
const geoMentionsData = [
  { name: "Jan", mentions: 12 },
  { name: "Fev", mentions: 28 },
  { name: "Mar", mentions: 45 },
  { name: "Abr", mentions: 72 },
  { name: "Mai", mentions: 118 },
  { name: "Jun", mentions: 164 },
  { name: "Jul", mentions: 241 },
  { name: "Ago", mentions: 312 },
]

const aiEngines = [
  { name: "ChatGPT", mentions: 142, share: 45, change: "+18", color: "bg-emerald-500" },
  { name: "Google Gemini", mentions: 89, share: 28, change: "+12", color: "bg-blue-500" },
  { name: "Perplexity", mentions: 54, share: 17, change: "+24", color: "bg-purple-500" },
  { name: "Claude", mentions: 27, share: 10, change: "+8", color: "bg-amber-500" },
]

const aiPrompts = [
  {
    prompt: "melhor clareamento dental em são paulo",
    engine: "ChatGPT",
    position: "Citado #1",
    articles: 2,
  },
  {
    prompt: "quanto custa implante dentário",
    engine: "Gemini",
    position: "Citado #2",
    articles: 1,
  },
  {
    prompt: "dentista que aceita convênio",
    engine: "Perplexity",
    position: "Citado #1",
    articles: 3,
  },
  {
    prompt: "clareamento caseiro funciona",
    engine: "ChatGPT",
    position: "Citado #3",
    articles: 1,
  },
]

const citedArticles = [
  { title: "Clareamento Dental: Caseiro ou Consultório?", citations: 48, engines: 4 },
  { title: "10 Dicas para Cuidar dos Dentes", citations: 36, engines: 3 },
  { title: "Guia Completo do Implante Dentário", citations: 29, engines: 4 },
  { title: "Sensibilidade Dental: Causas e Tratamentos", citations: 22, engines: 2 },
]

export default function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<"seo" | "geo">("seo")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe a performance do seu conteúdo de forma simples.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode("seo")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                viewMode === "seo"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="h-4 w-4" />
              SEO
            </button>
            <button
              onClick={() => setViewMode("geo")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                viewMode === "geo"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-4 w-4" />
              GEO (IA)
            </button>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* GEO Info Banner */}
      {viewMode === "geo" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">O que é GEO?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                GEO (Generative Engine Optimization) mostra como seu conteúdo aparece em
                IAs como ChatGPT, Gemini, Perplexity e Claude. É o novo SEO para a era da
                inteligência artificial.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {viewMode === "seo" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Eye className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +23%
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">12.4K</p>
              <p className="text-sm text-muted-foreground">Visitas orgânicas</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <MousePointerClick className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +0.4%
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">3.8%</p>
              <p className="text-sm text-muted-foreground">Taxa de cliques (CTR)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +12
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">156</p>
              <p className="text-sm text-muted-foreground">Palavras no Top 10</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <BarChart3 className="h-5 w-5 text-primary" />
                <Badge className="bg-red-100 text-red-700">
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                  -2
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">4.2</p>
              <p className="text-sm text-muted-foreground">Posição média</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Quote className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +62%
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">312</p>
              <p className="text-sm text-muted-foreground">Citações em IA</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Bot className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +8%
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">24%</p>
              <p className="text-sm text-muted-foreground">Share of Voice em IA</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <MessageSquare className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +15
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">47</p>
              <p className="text-sm text-muted-foreground">Prompts que citam você</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Link2 className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +31%
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">1.8K</p>
              <p className="text-sm text-muted-foreground">Cliques via IA</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {viewMode === "seo" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  Tráfego Orgânico
                  <button className="ml-auto text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Visitantes que chegaram pelo Google nos últimos 8 meses
                </p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="visits"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  Taxa de Cliques (CTR)
                  <button className="ml-auto text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Porcentagem de pessoas que clicam no seu resultado no Google
                </p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ctrData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="ctr" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Quote className="h-5 w-5 text-primary" />
                  Citações em IAs ao longo do tempo
                  <button className="ml-auto text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Quantas vezes seu conteúdo foi citado por IAs generativas
                </p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={geoMentionsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mentions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-primary" />
                  Distribuição por IA
                  <button className="ml-auto text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Em quais motores de IA você mais aparece
                </p>
                <div className="space-y-4">
                  {aiEngines.map((engine) => (
                    <div key={engine.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", engine.color)} />
                          <span className="font-medium text-foreground">
                            {engine.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {engine.mentions} citações
                          </span>
                          <Badge className="bg-green-100 text-green-700 text-[11px]">
                            <ArrowUpRight className="mr-0.5 h-2.5 w-2.5" />
                            {engine.change}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", engine.color)}
                          style={{ width: `${engine.share * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tables */}
      {viewMode === "seo" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Principais palavras-chave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topKeywords.map((kw, index) => (
                  <div
                    key={kw.keyword}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{kw.keyword}</p>
                        <p className="text-xs text-muted-foreground">{kw.visits} visitas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">#{kw.position}</span>
                      <Badge
                        className={
                          kw.change.startsWith("+")
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {kw.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Páginas mais visitadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPages.map((page) => (
                  <div
                    key={page.page}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{page.page}</p>
                      <p className="text-xs text-muted-foreground">CTR: {page.ctr}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {page.visits}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Prompts que te mencionam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Perguntas reais que usuários fazem e mostram seu conteúdo
              </p>
              <div className="space-y-3">
                {aiPrompts.map((item) => (
                  <div
                    key={item.prompt}
                    className="rounded-lg border border-border p-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {'"'}
                      {item.prompt}
                      {'"'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Bot className="mr-1 h-3 w-3" />
                        {item.engine}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary text-xs">
                        {item.position}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.articles} {item.articles === 1 ? "artigo" : "artigos"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Quote className="h-5 w-5 text-primary" />
                Artigos mais citados por IAs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Seus conteúdos que mais aparecem em respostas de IA
              </p>
              <div className="space-y-3">
                {citedArticles.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.engines} IAs diferentes citam este conteúdo
                      </p>
                    </div>
                    <div className="ml-3 flex flex-col items-end">
                      <span className="text-lg font-semibold text-foreground">
                        {item.citations}
                      </span>
                      <span className="text-xs text-muted-foreground">citações</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low Performing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-amber-600" />
            {viewMode === "seo"
              ? "Conteúdos que precisam de atenção"
              : "Oportunidades para aparecer mais em IAs"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {viewMode === "seo"
              ? "Estes artigos podem melhorar com algumas otimizações sugeridas pela IA:"
              : "Estes artigos têm potencial para serem mais citados por IAs generativas:"}
          </p>
          <div className="space-y-3">
            {lowPerforming.map((page) => (
              <div
                key={page.page}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{page.page}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {page.visits} {viewMode === "seo" ? "visitas/mês" : "citações"}
                    </span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      {viewMode === "seo" ? page.issue : "Falta estrutura FAQ"}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Ver sugestões
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
