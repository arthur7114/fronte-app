"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Target,
  Users,
  MapPin,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react"

const profileSections = [
  {
    id: "business",
    label: "Negócio",
    icon: Building2,
    value: "Clínica Odontológica",
    completed: true,
  },
  {
    id: "location",
    label: "Localização",
    icon: MapPin,
    value: "São Paulo - SP",
    completed: true,
  },
  {
    id: "audience",
    label: "Público-alvo",
    icon: Users,
    value: "Adultos 25-55 anos",
    completed: true,
  },
  {
    id: "services",
    label: "Serviços",
    icon: Target,
    value: null,
    completed: false,
  },
]

const suggestedKeywords = [
  { keyword: "dentista são paulo", difficulty: "média", volume: "2.4K" },
  { keyword: "clareamento dental preço", difficulty: "baixa", volume: "1.8K" },
  { keyword: "implante dentário valor", difficulty: "alta", volume: "3.2K" },
]

const competitors = [
  { name: "Odonto Excellence", domain: "odontoexcellence.com.br" },
  { name: "Sorriso Perfeito", domain: "sorrisoperfeito.com.br" },
]

export function StrategySidebar() {
  const completedCount = profileSections.filter((s) => s.completed).length
  const progress = (completedCount / profileSections.length) * 100

  return (
    <div className="space-y-4">
      {/* Profile Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            Perfil do Negócio
            <Badge variant="secondary" className="font-normal">
              {completedCount}/{profileSections.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Profile Items */}
          <div className="space-y-3">
            {profileSections.map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{section.label}</p>
                  {section.value ? (
                    <p className="truncate text-sm font-medium text-foreground">
                      {section.value}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não informado</p>
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

      {/* Keywords Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Palavras-chave sugeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Com base no seu perfil, identificamos estas oportunidades:
          </p>
          <div className="space-y-2">
            {suggestedKeywords.map((kw) => (
              <div
                key={kw.keyword}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
              >
                <span className="text-sm text-foreground">{kw.keyword}</span>
                <span className="text-xs text-muted-foreground">{kw.volume}/mês</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Concorrentes identificados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Analisamos estes concorrentes na sua região:
          </p>
          <div className="space-y-2">
            {competitors.map((comp) => (
              <div
                key={comp.domain}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                  {comp.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{comp.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{comp.domain}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Strategy Button */}
      <Button className="w-full gap-2" size="lg">
        <Sparkles className="h-4 w-4" />
        Gerar Estratégia
      </Button>
    </div>
  )
}
