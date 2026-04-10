"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Sparkles,
  HelpCircle,
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

export default function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<"seo" | "geo">("seo")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Analytics
          </h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe a performance do seu conteúdo de forma simples.
          </p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button variant="outline">Últimos 30 dias</Button>
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
                GEO (Generative Engine Optimization) mostra como seu conteúdo aparece em IAs como ChatGPT e Gemini. 
                É o novo SEO para a era da inteligência artificial.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Chart */}
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
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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

        {/* CTR Chart */}
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

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Keywords */}
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

        {/* Top Pages */}
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
                  <span className="text-sm font-semibold text-foreground">{page.visits}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Performing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-amber-600" />
            Conteúdos que precisam de atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Estes artigos podem melhorar com algumas otimizações sugeridas pela IA:
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
                    <span className="text-muted-foreground">{page.visits} visitas/mês</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      {page.issue}
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
