"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Mail,
  Sparkles,
  Users,
  TrendingUp,
  Eye,
  Save,
  Zap,
  MousePointerClick,
  LayoutGrid,
  LayoutPanelLeft,
  Clock,
  ArrowUpRight,
  Copy,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Placement = "inline" | "popup" | "sticky-bottom"
type Trigger = "scroll" | "time" | "exit-intent"

const placements: {
  value: Placement
  label: string
  description: string
  icon: typeof LayoutGrid
}[] = [
  {
    value: "inline",
    label: "Inline no artigo",
    description: "Aparece dentro do conteúdo, após X parágrafos",
    icon: LayoutPanelLeft,
  },
  {
    value: "popup",
    label: "Popup centralizado",
    description: "Janela modal que aparece sobre o conteúdo",
    icon: LayoutGrid,
  },
  {
    value: "sticky-bottom",
    label: "Barra fixa inferior",
    description: "Barra discreta fixada no rodapé da página",
    icon: MousePointerClick,
  },
]

const triggers: {
  value: Trigger
  label: string
  description: string
}[] = [
  { value: "scroll", label: "Rolagem de página", description: "Exibe após o usuário rolar X% do artigo" },
  { value: "time", label: "Tempo na página", description: "Exibe após X segundos no artigo" },
  { value: "exit-intent", label: "Intenção de saída", description: "Exibe quando o usuário tenta fechar a aba" },
]

const performanceStats = [
  { label: "Impressões (30d)", value: "24.8K", icon: Eye, trend: "+18%" },
  { label: "Leads capturados", value: "187", icon: Users, trend: "+43%" },
  { label: "Taxa de conversão", value: "0.75%", icon: TrendingUp, trend: "+0.2%" },
  { label: "Total de leads", value: "1.3K", icon: Mail, trend: "" },
]

export default function NewsletterPage() {
  const [enabled, setEnabled] = useState(true)
  const [title, setTitle] = useState("Receba nossas dicas semanais")
  const [description, setDescription] = useState(
    "Conteúdo exclusivo sobre saúde bucal direto no seu e-mail. Zero spam.",
  )
  const [ctaLabel, setCtaLabel] = useState("Quero receber")
  const [successMessage, setSuccessMessage] = useState(
    "Pronto! Confirme seu e-mail na caixa de entrada para começar.",
  )
  const [placement, setPlacement] = useState<Placement>("inline")
  const [trigger, setTrigger] = useState<Trigger>("scroll")
  const [triggerValue, setTriggerValue] = useState("50")
  const [askName, setAskName] = useState(true)
  const [privacyConsent, setPrivacyConsent] = useState(true)
  const [incentive, setIncentive] = useState(true)
  const [incentiveText, setIncentiveText] = useState("Ganhe o e-book gratuito 'Sorriso Perfeito em 7 passos'")
  const [copiedScript, setCopiedScript] = useState(false)

  const embedScript = `<script src="https://cdn.flowly.app/embed.js" data-site="clinica-sorriso" async></script>`

  const copyScript = async () => {
    await navigator.clipboard.writeText(embedScript)
    setCopiedScript(true)
    setTimeout(() => setCopiedScript(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure o widget de captação de leads que aparece no seu blog.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="enabled" className="cursor-pointer text-sm font-medium">
              {enabled ? "Widget ativo" : "Widget desativado"}
            </Label>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Salvar alterações
          </Button>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {performanceStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-primary" />
                {stat.trend && (
                  <Badge className="bg-green-100 text-green-700">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Configuration */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="conteudo" className="space-y-4">
            <TabsList>
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              <TabsTrigger value="exibicao">Exibição</TabsTrigger>
              <TabsTrigger value="integracao">Integração</TabsTrigger>
            </TabsList>

            <TabsContent value="conteudo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Textos do widget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Receba nossas novidades"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Breve descrição do que o visitante vai receber..."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cta">Texto do botão</Label>
                      <Input
                        id="cta"
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="success">Mensagem de sucesso</Label>
                      <Input
                        id="success"
                        value={successMessage}
                        onChange={(e) => setSuccessMessage(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Campos e incentivo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="space-y-1">
                      <Label htmlFor="ask-name" className="cursor-pointer text-sm font-medium">
                        Solicitar nome do lead
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Recomendado. Permite personalizar envios futuros.
                      </p>
                    </div>
                    <Switch id="ask-name" checked={askName} onCheckedChange={setAskName} />
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="space-y-1">
                      <Label htmlFor="consent" className="cursor-pointer text-sm font-medium">
                        Exigir consentimento LGPD
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Adiciona checkbox de consentimento antes do envio.
                      </p>
                    </div>
                    <Switch id="consent" checked={privacyConsent} onCheckedChange={setPrivacyConsent} />
                  </div>

                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="incentive" className="cursor-pointer text-sm font-medium">
                          Oferecer incentivo (lead magnet)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Aumenta a taxa de conversão em até 3x.
                        </p>
                      </div>
                      <Switch id="incentive" checked={incentive} onCheckedChange={setIncentive} />
                    </div>
                    {incentive && (
                      <Input
                        value={incentiveText}
                        onChange={(e) => setIncentiveText(e.target.value)}
                        placeholder="Ex: Ganhe o e-book gratuito sobre..."
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exibicao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posicionamento no blog</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {placements.map((p) => {
                      const Icon = p.icon
                      const isActive = placement === p.value
                      return (
                        <button
                          key={p.value}
                          onClick={() => setPlacement(p.value)}
                          className={cn(
                            "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors",
                            isActive
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 hover:bg-muted/50",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                              isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{p.label}</p>
                            <p className="text-sm text-muted-foreground">{p.description}</p>
                          </div>
                          {isActive && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gatilho de exibição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quando mostrar o widget</Label>
                    <Select value={trigger} onValueChange={(v) => setTrigger(v as Trigger)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {triggers.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {triggers.find((t) => t.value === trigger)?.description}
                    </p>
                  </div>

                  {trigger !== "exit-intent" && (
                    <div className="space-y-2">
                      <Label htmlFor="trigger-value">
                        {trigger === "scroll" ? "Percentual de rolagem (%)" : "Segundos na página"}
                      </Label>
                      <Input
                        id="trigger-value"
                        type="number"
                        value={triggerValue}
                        onChange={(e) => setTriggerValue(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      O widget só aparece uma vez por visitante a cada 7 dias para não ser invasivo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integracao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Código de instalação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Se você hospeda o blog fora do Flowly, cole este script antes da tag
                    <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">{"</body>"}</code>
                    do seu site. Blogs gerados pelo Flowly já vêm com o widget integrado.
                  </p>

                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs text-foreground">
                      <code>{embedScript}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={copyScript}
                      className="absolute right-2 top-2"
                    >
                      {copiedScript ? (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Destino dos leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">Flowly Leads</p>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">
                            Ativo
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Todos os leads ficam disponíveis em /dashboard/leads
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Mailchimp, RD Station, ActiveCampaign</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Sincronize leads em tempo real com sua ferramenta de e-mail marketing.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      Conectar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  Preview ao vivo
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {placements.find((p) => p.value === placement)?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border bg-muted/30 p-5">
                {/* Fake blog article preview */}
                <div className="space-y-3">
                  <div className="h-2 w-24 rounded bg-muted-foreground/20" />
                  <div className="h-4 w-3/4 rounded bg-muted-foreground/30" />
                  <div className="space-y-1.5">
                    <div className="h-2 w-full rounded bg-muted-foreground/15" />
                    <div className="h-2 w-[95%] rounded bg-muted-foreground/15" />
                    <div className="h-2 w-[88%] rounded bg-muted-foreground/15" />
                  </div>
                </div>

                {/* Widget preview */}
                <div className="mt-6 rounded-xl border border-primary/30 bg-card p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {title || "Título do widget"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {description || "Descrição do widget"}
                      </p>
                    </div>
                  </div>

                  {incentive && incentiveText && (
                    <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2">
                      <p className="text-xs font-medium text-primary">
                        {incentiveText}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {askName && (
                      <div className="rounded-md border border-border bg-background px-3 py-2">
                        <p className="text-xs text-muted-foreground">Seu nome</p>
                      </div>
                    )}
                    <div className="rounded-md border border-border bg-background px-3 py-2">
                      <p className="text-xs text-muted-foreground">seu@email.com</p>
                    </div>
                    <Button size="sm" className="w-full">
                      {ctaLabel || "Quero receber"}
                    </Button>
                    {privacyConsent && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Ao continuar, você concorda com nossa Política de Privacidade. Sem spam, cancele quando quiser.
                      </p>
                    )}
                  </div>
                </div>

                {/* More fake content below */}
                <div className="mt-6 space-y-1.5">
                  <div className="h-2 w-full rounded bg-muted-foreground/15" />
                  <div className="h-2 w-[92%] rounded bg-muted-foreground/15" />
                  <div className="h-2 w-[85%] rounded bg-muted-foreground/15" />
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-lg bg-primary/5 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O preview reflete sua configuração atual. As mudanças só aparecem no blog ao vivo depois de salvar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
