"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Globe,
  Target,
  MapPin,
  Plus,
  ArrowUpRight,
  Sparkles,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

const filters = [
  { id: "global", label: "Global", icon: Globe },
  { id: "niche", label: "Nicho", icon: Target },
  { id: "local", label: "Local", icon: MapPin },
]

const trends = [
  {
    id: 1,
    topic: "Clareamento dental com carvão ativado",
    relevance: 92,
    category: "global",
    reason: "Pesquisas aumentaram 340% no último mês. Muitos usuários buscam alternativas naturais.",
    potentialTraffic: "2.1K",
    difficulty: "baixa",
    recommended: true,
  },
  {
    id: 2,
    topic: "Facetas de resina vs porcelana",
    relevance: 88,
    category: "niche",
    reason: "Comparativos de procedimentos estão em alta. Ideal para fase de consideração.",
    potentialTraffic: "1.8K",
    difficulty: "média",
    recommended: true,
  },
  {
    id: 3,
    topic: "Dentista emergência São Paulo",
    relevance: 85,
    category: "local",
    reason: "Alta demanda na sua região. Oportunidade de capturar tráfego local qualificado.",
    potentialTraffic: "890",
    difficulty: "baixa",
    recommended: true,
  },
  {
    id: 4,
    topic: "Aparelho autoligado vantagens",
    relevance: 78,
    category: "niche",
    reason: "Tecnologia em crescimento. Pacientes buscam opções mais modernas de ortodontia.",
    potentialTraffic: "1.2K",
    difficulty: "média",
    recommended: false,
  },
  {
    id: 5,
    topic: "Quanto tempo dura um implante",
    relevance: 75,
    category: "global",
    reason: "Dúvida frequente entre pacientes considerando implantes. Alto potencial de conversão.",
    potentialTraffic: "1.5K",
    difficulty: "baixa",
    recommended: false,
  },
  {
    id: 6,
    topic: "Lente de contato dental preço 2024",
    relevance: 72,
    category: "niche",
    reason: "Procedimento estético popular. Buscas por preços indicam intenção de compra.",
    potentialTraffic: "980",
    difficulty: "alta",
    recommended: false,
  },
]

const difficultyColors = {
  baixa: "bg-green-100 text-green-700",
  média: "bg-amber-100 text-amber-700",
  alta: "bg-red-100 text-red-700",
}

export default function TendenciasPage() {
  const [activeFilter, setActiveFilter] = useState("global")

  const filteredTrends = activeFilter === "global" 
    ? trends 
    : trends.filter(t => t.category === activeFilter)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Tendências
          </h1>
          <p className="mt-1 text-muted-foreground">
            Descubra novas oportunidades de conteúdo baseadas em dados atualizados.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Atualizado há 2 horas
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-border p-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Recommended Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Recomendados para você
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Baseado no seu perfil e histórico, estas tendências têm maior potencial de resultado:
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {filteredTrends.filter(t => t.recommended).map((trend) => (
              <div
                key={trend.id}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <Badge
                    variant="secondary"
                    className={difficultyColors[trend.difficulty as keyof typeof difficultyColors]}
                  >
                    {trend.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <TrendingUp className="h-4 w-4" />
                    {trend.relevance}%
                  </div>
                </div>
                <h3 className="font-medium text-foreground">{trend.topic}</h3>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {trend.reason}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    ~{trend.potentialTraffic}/mês
                  </span>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3 w-3" />
                    Adicionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Todas as tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrends.map((trend) => (
              <div
                key={trend.id}
                className="flex items-center justify-between rounded-xl border border-border p-5 transition-all hover:bg-muted/30"
              >
                <div className="flex items-start gap-4">
                  {/* Relevance Score */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted">
                    <span className="text-lg font-bold text-foreground">
                      {trend.relevance}
                    </span>
                    <span className="text-[10px] text-muted-foreground">score</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{trend.topic}</h3>
                      {trend.recommended && (
                        <Badge className="bg-primary/10 text-primary">
                          Recomendado
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {trend.reason}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <Badge
                        variant="secondary"
                        className={difficultyColors[trend.difficulty as keyof typeof difficultyColors]}
                      >
                        Dificuldade {trend.difficulty}
                      </Badge>
                      <span>~{trend.potentialTraffic} visitas/mês</span>
                      <span className="flex items-center gap-1">
                        {trend.category === "global" && <Globe className="h-3 w-3" />}
                        {trend.category === "niche" && <Target className="h-3 w-3" />}
                        {trend.category === "local" && <MapPin className="h-3 w-3" />}
                        {filters.find(f => f.id === trend.category)?.label}
                      </span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  Adicionar ao plano
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
