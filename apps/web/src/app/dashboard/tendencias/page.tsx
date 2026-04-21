"use client";

import { useState } from "react";
import { ArrowUpRight, Filter, Globe, MapPin, Plus, Sparkles, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const filters = [
  { id: "global", label: "Global", icon: Globe },
  { id: "niche", label: "Nicho", icon: Target },
  { id: "local", label: "Local", icon: MapPin },
];

const trends = [
  { id: 1, topic: "Clareamento dental com carvao ativado", relevance: 92, category: "global", reason: "Pesquisas aumentaram 340% no ultimo mes. Muitos usuarios buscam alternativas naturais.", potentialTraffic: "2.1K", difficulty: "baixa", recommended: true },
  { id: 2, topic: "Facetas de resina vs porcelana", relevance: 88, category: "niche", reason: "Comparativos de procedimentos estao em alta. Ideal para fase de consideracao.", potentialTraffic: "1.8K", difficulty: "media", recommended: true },
  { id: 3, topic: "Dentista emergencia Sao Paulo", relevance: 85, category: "local", reason: "Alta demanda na sua regiao. Oportunidade de capturar trafego local qualificado.", potentialTraffic: "890", difficulty: "baixa", recommended: true },
  { id: 4, topic: "Aparelho autoligado vantagens", relevance: 78, category: "niche", reason: "Tecnologia em crescimento. Pacientes buscam opcoes mais modernas de ortodontia.", potentialTraffic: "1.2K", difficulty: "media", recommended: false },
  { id: 5, topic: "Quanto tempo dura um implante", relevance: 75, category: "global", reason: "Duvida frequente entre pacientes considerando implantes. Alto potencial de conversao.", potentialTraffic: "1.5K", difficulty: "baixa", recommended: false },
  { id: 6, topic: "Lente de contato dental preco 2024", relevance: 72, category: "niche", reason: "Procedimento estetico popular. Buscas por precos indicam intencao de compra.", potentialTraffic: "980", difficulty: "alta", recommended: false },
];

const difficultyColors = {
  baixa: "bg-green-100 text-green-700",
  media: "bg-amber-100 text-amber-700",
  alta: "bg-red-100 text-red-700",
};

export default function TendenciasPage() {
  const [activeFilter, setActiveFilter] = useState("global");
  const filteredTrends = activeFilter === "global" ? trends : trends.filter((trend) => trend.category === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tendencias</h1>
          <p className="mt-1 text-muted-foreground">
            Descubra novas oportunidades de conteudo baseadas em dados atualizados.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Atualizado ha 2 horas
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-lg border border-border p-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeFilter === filter.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
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

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Recomendados para voce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Baseado no seu perfil e historico, estas tendencias tem maior potencial de resultado:
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {filteredTrends.filter((trend) => trend.recommended).map((trend) => (
              <div key={trend.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <Badge variant="secondary" className={difficultyColors[trend.difficulty as keyof typeof difficultyColors]}>
                    {trend.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <TrendingUp className="h-4 w-4" />
                    {trend.relevance}%
                  </div>
                </div>
                <h3 className="font-medium text-foreground">{trend.topic}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{trend.reason}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">~{trend.potentialTraffic}/mes</span>
                  <Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Adicionar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Todas as tendencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrends.map((trend) => (
              <div key={trend.id} className="flex flex-col gap-4 rounded-xl border border-border p-5 transition-all hover:bg-muted/30 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted">
                    <span className="text-lg font-bold text-foreground">{trend.relevance}</span>
                    <span className="text-[10px] text-muted-foreground">score</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-foreground">{trend.topic}</h3>
                      {trend.recommended ? <Badge className="bg-primary/10 text-primary">Recomendado</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{trend.reason}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <Badge variant="secondary" className={difficultyColors[trend.difficulty as keyof typeof difficultyColors]}>Dificuldade {trend.difficulty}</Badge>
                      <span>~{trend.potentialTraffic} visitas/mes</span>
                      <span className="flex items-center gap-1">
                        {trend.category === "global" ? <Globe className="h-3 w-3" /> : null}
                        {trend.category === "niche" ? <Target className="h-3 w-3" /> : null}
                        {trend.category === "local" ? <MapPin className="h-3 w-3" /> : null}
                        {filters.find((filter) => filter.id === trend.category)?.label}
                      </span>
                      <span className="flex items-center gap-1 text-primary"><ArrowUpRight className="h-3 w-3" />crescendo</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="shrink-0 gap-2"><Plus className="h-4 w-4" />Adicionar ao plano</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
