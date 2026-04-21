"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, Circle, MapPin, Sparkles, Target, Users } from "lucide-react";

const profileSections = [
  { id: "business", label: "Negocio", icon: Building2, value: "Clinica Odontologica", completed: true },
  { id: "location", label: "Localizacao", icon: MapPin, value: "Sao Paulo - SP", completed: true },
  { id: "audience", label: "Publico-alvo", icon: Users, value: "Adultos 25-55 anos", completed: true },
  { id: "services", label: "Servicos", icon: Target, value: null, completed: false },
];

const suggestedKeywords = [
  { keyword: "dentista sao paulo", volume: "2.4K" },
  { keyword: "clareamento dental preco", volume: "1.8K" },
  { keyword: "implante dentario valor", volume: "3.2K" },
];

const competitors = [
  { name: "Odonto Excellence", domain: "odontoexcellence.com.br" },
  { name: "Sorriso Perfeito", domain: "sorrisoperfeito.com.br" },
];

export function StrategySidebar() {
  const completedCount = profileSections.filter((section) => section.completed).length;
  const progress = (completedCount / profileSections.length) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            Perfil do Negocio
            <Badge variant="secondary" className="font-normal">
              {completedCount}/{profileSections.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-3">
            {profileSections.map((section) => (
              <div key={section.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{section.label}</p>
                  {section.value ? (
                    <p className="truncate text-sm font-medium text-foreground">{section.value}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nao informado</p>
                  )}
                </div>
                {section.completed ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Palavras-chave sugeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Com base no seu perfil, identificamos estas oportunidades:
          </p>
          <div className="space-y-2">
            {suggestedKeywords.map((keyword) => (
              <div key={keyword.keyword} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-sm text-foreground">{keyword.keyword}</span>
                <span className="text-xs text-muted-foreground">{keyword.volume}/mes</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Concorrentes identificados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Analisamos estes concorrentes na sua regiao:
          </p>
          <div className="space-y-2">
            {competitors.map((competitor) => (
              <div key={competitor.domain} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                  {competitor.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{competitor.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{competitor.domain}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full gap-2" size="lg">
        <Sparkles className="h-4 w-4" />
        Gerar Estrategia
      </Button>
    </div>
  );
}
