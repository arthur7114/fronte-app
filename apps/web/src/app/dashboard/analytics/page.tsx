"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Eye,
  HelpCircle,
  Link2,
  MessageSquare,
  MousePointerClick,
  Quote,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";

const trafficData = [
  { name: "Jan", visits: 2400 },
  { name: "Fev", visits: 3200 },
  { name: "Mar", visits: 4100 },
  { name: "Abr", visits: 5800 },
  { name: "Mai", visits: 7200 },
  { name: "Jun", visits: 9100 },
  { name: "Jul", visits: 11200 },
  { name: "Ago", visits: 12400 },
];

const ctrData = [
  { name: "Jan", ctr: 2.1 },
  { name: "Fev", ctr: 2.4 },
  { name: "Mar", ctr: 2.8 },
  { name: "Abr", ctr: 3.1 },
  { name: "Mai", ctr: 3.4 },
  { name: "Jun", ctr: 3.2 },
  { name: "Jul", ctr: 3.6 },
  { name: "Ago", ctr: 3.8 },
];

const geoMentionsData = [
  { name: "Jan", mentions: 12 },
  { name: "Fev", mentions: 28 },
  { name: "Mar", mentions: 45 },
  { name: "Abr", mentions: 72 },
  { name: "Mai", mentions: 118 },
  { name: "Jun", mentions: 164 },
  { name: "Jul", mentions: 241 },
  { name: "Ago", mentions: 312 },
];

const topKeywords = [
  { keyword: "dentista sao paulo zona sul", position: 2, change: "+3", visits: "1.2K" },
  { keyword: "clareamento dental preco", position: 3, change: "+5", visits: "980" },
  { keyword: "implante dentario valor", position: 5, change: "-1", visits: "850" },
  { keyword: "dor de dente o que fazer", position: 4, change: "+2", visits: "720" },
  { keyword: "quanto custa um canal", position: 6, change: "+4", visits: "580" },
];

const topPages = [
  { page: "10 Dicas para Cuidar dos Dentes", visits: "2.3K", ctr: "4.2%" },
  { page: "Quanto Custa um Implante Dentario", visits: "1.8K", ctr: "3.8%" },
  { page: "Clareamento Dental: Vale a Pena?", visits: "1.2K", ctr: "3.5%" },
  { page: "Guia Completo do Aparelho Invisivel", visits: "980", ctr: "4.1%" },
];

const aiEngines = [
  { name: "ChatGPT", mentions: 142, share: 45, change: "+18", color: "bg-emerald-500" },
  { name: "Google Gemini", mentions: 89, share: 28, change: "+12", color: "bg-blue-500" },
  { name: "Perplexity", mentions: 54, share: 17, change: "+24", color: "bg-orange-500" },
  { name: "Claude", mentions: 27, share: 10, change: "+8", color: "bg-amber-500" },
];

const aiPrompts = [
  { prompt: "melhor clareamento dental em sao paulo", engine: "ChatGPT", position: "Citado #1", articles: 2 },
  { prompt: "quanto custa implante dentario", engine: "Gemini", position: "Citado #2", articles: 1 },
  { prompt: "dentista que aceita convenio", engine: "Perplexity", position: "Citado #1", articles: 3 },
  { prompt: "clareamento caseiro funciona", engine: "ChatGPT", position: "Citado #3", articles: 1 },
];

const citedArticles = [
  { title: "Clareamento Dental: Caseiro ou Consultorio?", citations: 48, engines: 4 },
  { title: "10 Dicas para Cuidar dos Dentes", citations: 36, engines: 3 },
  { title: "Guia Completo do Implante Dentario", citations: 29, engines: 4 },
  { title: "Sensibilidade Dental: Causas e Tratamentos", citations: 22, engines: 2 },
];

const lowPerforming = [
  { page: "Historia da Odontologia", visits: "45", issue: "Tema muito amplo" },
  { page: "Tipos de Anestesia", visits: "89", issue: "Falta de palavras-chave" },
];

function MetricCard({
  icon: Icon,
  value,
  label,
  change,
  trend = "up",
}: {
  icon: typeof Eye;
  value: string;
  label: string;
  change: string;
  trend?: "up" | "down";
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-primary" />
          <Badge className={trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
            {trend === "up" ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
            {change}
          </Badge>
        </div>
        <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function chartTooltipStyle() {
  return {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  };
}

export default function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<"seo" | "geo">("seo");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Acompanhe a performance do seu conteudo de forma simples.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-border p-1">
            <button
              type="button"
              onClick={() => setViewMode("seo")}
              className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors", viewMode === "seo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <Search className="h-4 w-4" />
              SEO
            </button>
            <button
              type="button"
              onClick={() => setViewMode("geo")}
              className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors", viewMode === "geo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <Sparkles className="h-4 w-4" />
              GEO (IA)
            </button>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {viewMode === "geo" ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">O que e GEO?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                GEO mostra como seu conteudo aparece em IAs como ChatGPT, Gemini, Perplexity e Claude.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {viewMode === "seo" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Eye} value="12.4K" label="Visitas organicas" change="+23%" />
          <MetricCard icon={MousePointerClick} value="3.8%" label="Taxa de cliques (CTR)" change="+0.4%" />
          <MetricCard icon={TrendingUp} value="156" label="Palavras no Top 10" change="+12" />
          <MetricCard icon={BarChart3} value="4.2" label="Posicao media" change="-2" trend="down" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Quote} value="312" label="Citacoes em IA" change="+62%" />
          <MetricCard icon={Bot} value="24%" label="Share of Voice em IA" change="+8%" />
          <MetricCard icon={MessageSquare} value="47" label="Prompts que citam voce" change="+15" />
          <MetricCard icon={Link2} value="1.8K" label="Cliques via IA" change="+31%" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {viewMode === "seo" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  Trafego Organico
                  <button className="ml-auto text-muted-foreground hover:text-foreground"><HelpCircle className="h-4 w-4" /></button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Visitantes que chegaram pelo Google nos ultimos 8 meses</p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={chartTooltipStyle()} />
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
                  <button className="ml-auto text-muted-foreground hover:text-foreground"><HelpCircle className="h-4 w-4" /></button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Porcentagem de pessoas que clicam no seu resultado no Google</p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ctrData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={chartTooltipStyle()} />
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
                <CardTitle className="flex items-center gap-2 text-lg"><Quote className="h-5 w-5 text-primary" />Citacoes em IAs ao longo do tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Quantas vezes seu conteudo foi citado por IAs generativas</p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={geoMentionsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={chartTooltipStyle()} />
                      <Line type="monotone" dataKey="mentions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Bot className="h-5 w-5 text-primary" />Distribuicao por IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Em quais motores de IA voce mais aparece</p>
                <div className="space-y-4">
                  {aiEngines.map((engine) => (
                    <div key={engine.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><div className={cn("h-2 w-2 rounded-full", engine.color)} /><span className="font-medium text-foreground">{engine.name}</span></div>
                        <div className="flex items-center gap-3"><span className="text-muted-foreground">{engine.mentions} citacoes</span><Badge className="bg-green-100 text-[11px] text-green-700"><ArrowUpRight className="mr-0.5 h-2.5 w-2.5" />{engine.change}</Badge></div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", engine.color)} style={{ width: `${engine.share * 2}%` }} /></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {viewMode === "seo" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Principais palavras-chave</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topKeywords.map((keyword, index) => (
                  <div key={keyword.keyword} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">{index + 1}</span>
                      <div><p className="text-sm font-medium text-foreground">{keyword.keyword}</p><p className="text-xs text-muted-foreground">{keyword.visits} visitas</p></div>
                    </div>
                    <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">#{keyword.position}</span><Badge className={keyword.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{keyword.change}</Badge></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Paginas mais visitadas</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPages.map((page) => (
                  <div key={page.page} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div><p className="text-sm font-medium text-foreground">{page.page}</p><p className="text-xs text-muted-foreground">CTR: {page.ctr}</p></div>
                    <span className="text-sm font-semibold text-foreground">{page.visits}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-5 w-5 text-primary" />Prompts que te mencionam</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiPrompts.map((item) => (
                  <div key={item.prompt} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">&quot;{item.prompt}&quot;</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2"><Badge variant="secondary" className="text-xs"><Bot className="mr-1 h-3 w-3" />{item.engine}</Badge><Badge className="bg-primary/10 text-xs text-primary">{item.position}</Badge><span className="text-xs text-muted-foreground">{item.articles} {item.articles === 1 ? "artigo" : "artigos"}</span></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Quote className="h-5 w-5 text-primary" />Artigos mais citados por IAs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {citedArticles.map((item) => (
                  <div key={item.title} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.engines} IAs diferentes citam este conteudo</p></div>
                    <div className="ml-3 flex flex-col items-end"><span className="text-lg font-semibold text-foreground">{item.citations}</span><span className="text-xs text-muted-foreground">citacoes</span></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-amber-600" />
            {viewMode === "seo" ? "Conteudos que precisam de atencao" : "Oportunidades para aparecer mais em IAs"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {viewMode === "seo" ? "Estes artigos podem melhorar com otimizacoes sugeridas pela IA:" : "Estes artigos tem potencial para serem mais citados por IAs generativas:"}
          </p>
          <div className="space-y-3">
            {lowPerforming.map((page) => (
              <div key={page.page} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">{page.page}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{page.visits} {viewMode === "seo" ? "visitas/mes" : "citacoes"}</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">{viewMode === "seo" ? page.issue : "Falta estrutura FAQ"}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">Ver sugestoes</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
