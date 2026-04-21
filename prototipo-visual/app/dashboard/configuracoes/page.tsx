"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Building2,
  Link2,
  BarChart3,
  Code2,
  Zap,
  Check,
  AlertCircle,
  Crown,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WorkspaceBannedCard } from "@/components/content-plan/workspace-banned"

const integrations = [
  {
    id: "ga4",
    name: "Google Analytics 4",
    description: "Conecte seu GA4 para métricas detalhadas",
    icon: BarChart3,
    status: "connected",
  },
  {
    id: "gtm",
    name: "Google Tag Manager",
    description: "Gerencie tags e pixels de forma centralizada",
    icon: Code2,
    status: "connected",
  },
  {
    id: "meta",
    name: "Meta Pixel",
    description: "Rastreamento de conversões do Facebook/Instagram",
    icon: Zap,
    status: "disconnected",
  },
  {
    id: "capi",
    name: "Conversions API",
    description: "Envio server-side de eventos para Meta",
    icon: Link2,
    status: "disconnected",
  },
]

const planLimits = {
  name: "Profissional",
  articlesUsed: 18,
  articlesLimit: 30,
  features: [
    { name: "Artigos por mês", value: "30", included: true },
    { name: "Palavras-chave monitoradas", value: "500", included: true },
    { name: "Análise de concorrentes", value: "5", included: true },
    { name: "Suporte prioritário", value: "Sim", included: true },
    { name: "API Access", value: "Não", included: false },
    { name: "White label", value: "Não", included: false },
  ],
}

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Configurações
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie seu perfil, integrações e limites do plano.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Informações do Negócio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nome da empresa
                  </label>
                  <input
                    type="text"
                    defaultValue="Clínica Dental São Paulo"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Website
                  </label>
                  <input
                    type="text"
                    defaultValue="clinicadental.com.br"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Segmento
                  </label>
                  <input
                    type="text"
                    defaultValue="Saúde - Odontologia"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Localização
                  </label>
                  <input
                    type="text"
                    defaultValue="São Paulo - SP"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Descrição do negócio
                </label>
                <textarea
                  rows={3}
                  defaultValue="Clínica odontológica especializada em tratamentos estéticos e implantes dentários, atendendo a região sul de São Paulo há mais de 15 anos."
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div className="flex justify-end">
                <Button>Salvar alterações</Button>
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="h-5 w-5 text-primary" />
                Integrações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Conecte suas ferramentas de marketing para melhorar a análise de dados.
              </p>

              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <integration.icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {integration.name}
                          </p>
                          {integration.status === "connected" && (
                            <Badge className="bg-green-100 text-green-700">
                              <Check className="mr-1 h-3 w-3" />
                              Conectado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={integration.status === "connected" ? "outline" : "default"}
                    >
                      {integration.status === "connected" ? "Gerenciar" : "Conectar"}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-xs text-blue-700">
                  As integrações ajudam a entender melhor o comportamento dos seus visitantes e otimizar suas campanhas de marketing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Banidos do workspace */}
          <WorkspaceBannedCard />
        </div>

        {/* Plan Sidebar */}
        <div className="space-y-6">
          {/* Current Plan */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-primary" />
                Seu Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary text-sm px-3 py-1">
                  {planLimits.name}
                </Badge>
                <Button variant="link" className="h-auto p-0 text-sm">
                  Mudar plano
                </Button>
              </div>

              {/* Usage */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Artigos este mês</span>
                  <span className="font-medium text-foreground">
                    {planLimits.articlesUsed}/{planLimits.articlesLimit}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(planLimits.articlesUsed / planLimits.articlesLimit) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Renova em 15 dias
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {planLimits.features.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span
                      className={cn(
                        feature.included ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {feature.name}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        feature.included ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {feature.value}
                    </span>
                  </div>
                ))}
              </div>

              <Button className="mt-6 w-full gap-2">
                <Crown className="h-4 w-4" />
                Fazer upgrade
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-medium text-foreground">Precisa de ajuda?</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Nossa equipe está pronta para ajudar com qualquer dúvida.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Central de ajuda
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Falar com suporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
