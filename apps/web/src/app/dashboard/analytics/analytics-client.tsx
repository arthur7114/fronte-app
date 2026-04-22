"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Target,
  Zap,
  MessageCircle,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Database,
  Loader2,
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { AnalyticsData } from "@/lib/analytics-server"
import { seedAnalyticsDataAction } from "@/actions/analytics-seed"

// ─── GEO Mock Data (placeholder until external API integration) ────────────

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



const aiPrompts = [
  { prompt: "melhor clareamento dental em são paulo", engine: "ChatGPT", position: "Citado #1", articles: 2 },
  { prompt: "quanto custa implante dentário", engine: "Gemini", position: "Citado #2", articles: 1 },
  { prompt: "dentista que aceita convênio", engine: "Perplexity", position: "Citado #1", articles: 3 },
  { prompt: "clareamento caseiro funciona", engine: "ChatGPT", position: "Citado #3", articles: 1 },
]

const citedArticles = [
  { title: "Clareamento Dental: Caseiro ou Consultório?", citations: 48, engines: 4 },
  { title: "10 Dicas para Cuidar dos Dentes", citations: 36, engines: 3 },
  { title: "Guia Completo do Implante Dentário", citations: 29, engines: 4 },
  { title: "Sensibilidade Dental: Causas e Tratamentos", citations: 22, engines: 2 },
]

const integrations = [
  { name: "Meta Pixel", connected: true, description: "Rastreamento de eventos do Facebook/Instagram" },
  { name: "Google Analytics 4", connected: true, description: "Eventos customizados GA4" },
  { name: "Google Ads", connected: false, description: "Conversões do Google Ads" },
  { name: "TikTok Pixel", connected: false, description: "Eventos da plataforma TikTok" },
]

const CTA_OPTIONS = [
  { value: "formulario", label: "Lead via formulário", icon: MessageCircle },
  { value: "whatsapp", label: "Clique no WhatsApp", icon: MessageSquare },
  { value: "compra", label: "Compra concluída", icon: ShoppingBag },
  { value: "agendamento", label: "Agendamento", icon: Calendar },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatK(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function changeLabel(pct: number): string {
  return pct >= 0 ? `+${pct}%` : `${pct}%`
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  data: AnalyticsData
  hasData: boolean
}

export default function AnalyticsDashboardClient({ data, hasData }: Props) {
  const [viewMode, setViewMode] = useState<"seo" | "geo" | "conversoes">("seo")
  const [selectedCTA, setSelectedCTA] = useState<string>("formulario")
  const [isPending, startTransition] = useTransition()
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  const { seo, conversions, geo } = data

  // Calcula aiEngines dinâmico a partir do GA4 Mestre
  const totalGeoSessions = geo?.trafficSources.reduce((acc, curr) => acc + curr.sessions, 0) || 0
  const colorMap: Record<string, string> = {
    chatgpt: "bg-emerald-500",
    perplexity: "bg-violet-500",
    claude: "bg-amber-500",
    gemini: "bg-blue-500",
    outros: "bg-slate-500"
  }
  const displayNameMap: Record<string, string> = {
    chatgpt: "ChatGPT",
    perplexity: "Perplexity",
    claude: "Claude",
    gemini: "Google Gemini",
    outros: "Outros Bots"
  }
  
  const aiEngines = (geo?.trafficSources || []).map(s => ({
    name: displayNameMap[s.dimension] || s.dimension,
    mentions: s.sessions,
    share: totalGeoSessions > 0 ? Math.round((s.sessions / totalGeoSessions) * 100) : 0,
    change: "—", // placeholder para evolução
    color: colorMap[s.dimension] || "bg-slate-500"
  })).sort((a,b) => b.mentions - a.mentions)

  const handleSeed = () => {
    startTransition(async () => {
      try {
        const result = await seedAnalyticsDataAction()
        setSeedMessage(result.message)
        // Reload after seed to see fresh data
        if (result.success) {
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch (err: any) {
        setSeedMessage(`Erro: ${err.message}`)
      }
    })
  }

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
            <button
              onClick={() => setViewMode("conversoes")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                viewMode === "conversoes"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Target className="h-4 w-4" />
              Conversões
            </button>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Empty state / Seed prompt */}
      {!hasData && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Database className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Sem dados de analytics ainda</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Nenhum dado de tráfego foi registrado. Você pode gerar dados de exemplo para visualizar o dashboard.
              </p>
              {seedMessage && (
                <p className="mt-2 text-sm font-medium text-primary">{seedMessage}</p>
              )}
            </div>
            <Button onClick={handleSeed} disabled={isPending} className="shrink-0">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Gerar dados de exemplo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

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
              <Badge variant="secondary" className="mt-2 text-xs bg-green-100 text-green-800 hover:bg-green-100">
                Conectado ao GA4 (Tempo Real)
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversões Controls */}
      {viewMode === "conversoes" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Rastreamento de conversões</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Acompanhe CTAs que geram resultado real — leads, WhatsApp, compras e agendamentos.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-medium text-foreground">CTA:</span>
              <Select value={selectedCTA} onValueChange={setSelectedCTA}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CTA_OPTIONS.map((cta) => (
                    <SelectItem key={cta.value} value={cta.value}>
                      {cta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── KPI Cards ──────────────────────────────────────────────────────── */}

      {viewMode === "seo" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Eye className="h-5 w-5 text-primary" />
                <Badge className={seo.kpis.viewsChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {seo.kpis.viewsChange >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                  {changeLabel(seo.kpis.viewsChange)}
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{formatK(seo.kpis.totalViews)}</p>
              <p className="text-sm text-muted-foreground">Visualizações totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <MousePointerClick className="h-5 w-5 text-primary" />
                <Badge className={seo.kpis.clicksChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {seo.kpis.clicksChange >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                  {changeLabel(seo.kpis.clicksChange)}
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{seo.kpis.avgCtr}%</p>
              <p className="text-sm text-muted-foreground">Taxa de cliques (CTR)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  {formatK(seo.kpis.totalClicks)}
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{formatK(seo.kpis.totalClicks)}</p>
              <p className="text-sm text-muted-foreground">Cliques totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <BarChart3 className="h-5 w-5 text-primary" />
                <Badge className={seo.kpis.avgPosition <= 10 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                  #{seo.kpis.avgPosition || "—"}
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{seo.kpis.avgPosition || "—"}</p>
              <p className="text-sm text-muted-foreground">Posição média</p>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "geo" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Quote className="h-5 w-5 text-primary" />
                <Badge className="bg-muted text-muted-foreground">
                  —
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{totalGeoSessions}</p>
              <p className="text-sm text-muted-foreground">Visitas de IAs (GA4)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Bot className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />+8%
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
                  <ArrowUpRight className="mr-1 h-3 w-3" />+15
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
                  <ArrowUpRight className="mr-1 h-3 w-3" />+31%
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">1.8K</p>
              <p className="text-sm text-muted-foreground">Cliques via IA</p>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "conversoes" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Target className="h-5 w-5 text-primary" />
                <Badge className={conversions.kpis.conversionsChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {conversions.kpis.conversionsChange >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                  {changeLabel(conversions.kpis.conversionsChange)}
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{conversions.kpis.totalConversions}</p>
              <p className="text-sm text-muted-foreground">Conversões totais</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Zap className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  {conversions.kpis.conversionRate}%
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{conversions.kpis.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Taxa de conversão</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <MessageCircle className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  {conversions.kpis.qualifiedLeads}
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{conversions.kpis.qualifiedLeads}</p>
              <p className="text-sm text-muted-foreground">Leads qualificados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Calendar className="h-5 w-5 text-primary" />
                <Badge className="bg-muted text-muted-foreground">
                  —
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">—</p>
              <p className="text-sm text-muted-foreground">Custo por conversão</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Charts ─────────────────────────────────────────────────────────── */}

      {viewMode === "seo" && (
        <div className="grid gap-6 lg:grid-cols-2">
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
                Visualizações reais por mês nos últimos 8 meses
              </p>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seo.trafficOverTime.map(d => ({ name: d.name, visits: d.value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
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
                Porcentagem de cliques sobre visualizações
              </p>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seo.ctrOverTime.map(d => ({ name: d.name, ctr: d.value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
        </div>
      )}

      {viewMode === "geo" && (
        <div className="grid gap-6 lg:grid-cols-2">
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
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="mentions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
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
                Tráfego detectado por sessão (GA4 Data API)
              </p>
              <div className="space-y-4">
                {aiEngines.length > 0 ? aiEngines.map((engine) => (
                  <div key={engine.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", engine.color)} />
                        <span className="font-medium text-foreground">{engine.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{engine.mentions} visitas</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", engine.color)} style={{ width: `${engine.share}%` }} />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Nenhum tráfego de IA detectado nos últimos 30 dias.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "conversoes" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Evolução das conversões
                <button className="ml-auto text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Total de conversões registradas nos últimos 8 meses
              </p>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conversions.conversionOverTime.map(d => ({ name: d.name, conversoes: d.value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="conversoes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Por fonte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                De onde vêm suas conversões
              </p>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conversions.conversionBySource}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {conversions.conversionBySource.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1.5">
                {conversions.conversionBySource.map((source) => (
                  <div key={source.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="text-foreground">{source.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{source.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Tables ─────────────────────────────────────────────────────────── */}

      {viewMode === "seo" && seo.topPosts.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Páginas mais visitadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seo.topPosts.map((post, index) => (
                  <div key={post.slug} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.title}</p>
                        <p className="text-xs text-muted-foreground">CTR: {post.ctr}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatK(post.views)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {seo.lowPerforming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                  Conteúdos que precisam de atenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Estes artigos podem melhorar com algumas otimizações:
                </p>
                <div className="space-y-3">
                  {seo.lowPerforming.map((page) => (
                    <div key={page.slug} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium text-foreground">{page.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">{formatK(page.views)} visitas</span>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            CTR baixo ({page.ctr})
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Ver sugestões</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {viewMode === "geo" && (
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
                  <div key={item.prompt} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">
                      {'"'}{item.prompt}{'"'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Bot className="mr-1 h-3 w-3" />{item.engine}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary text-xs">{item.position}</Badge>
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
                  <div key={item.title} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.engines} IAs diferentes citam este conteúdo
                      </p>
                    </div>
                    <div className="ml-3 flex flex-col items-end">
                      <span className="text-lg font-semibold text-foreground">{item.citations}</span>
                      <span className="text-xs text-muted-foreground">citações</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversion Events Table + Integrations */}
      {viewMode === "conversoes" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Últimos eventos de conversão
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {conversions.recentEvents.length} eventos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Origem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Usuário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversions.recentEvents.map((event, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30">
                        <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">{event.date}</td>
                        <td className="px-6 py-3">
                          <span className="text-sm font-medium text-foreground">{event.type}</span>
                        </td>
                        <td className="px-6 py-3 text-xs text-muted-foreground font-mono">{event.origin}</td>
                        <td className="px-6 py-3 text-xs text-muted-foreground">{event.user}</td>
                        <td className="px-6 py-3">
                          {event.status === "confirmado" ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[11px]">
                              <CheckCircle2 className="mr-1 h-3 w-3" />Confirmado
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[11px]">
                              <AlertCircle className="mr-1 h-3 w-3" />Pendente
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Integrações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Conecte plataformas para rastrear conversões com eventos customizados.
              </p>
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.name} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{integration.name}</p>
                        {integration.connected && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0">
                            <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />Ativo
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{integration.description}</p>
                    </div>
                    <Button variant={integration.connected ? "outline" : "default"} size="sm" className="shrink-0 text-xs">
                      {integration.connected ? "Gerenciar" : "Conectar"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
