"use client"

import { useActionState, useState } from "react"
import type { Tables } from "@super/db"
import {
  saveBlogDomain,
  saveSiteIntegration,
  type SiteState,
} from "@/app/app/blog/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Check, Globe, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

const integrations = [
  {
    id: "wordpress",
    name: "WordPress",
    description: "Conecte seu blog WordPress existente",
    icon: "W",
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Integre com seu site Webflow",
    icon: "Wf",
  },
  {
    id: "custom",
    name: "API Personalizada",
    description: "Use nossa API REST para integracao customizada",
    icon: "</>",
  },
]

const initialState: SiteState = {}

type SiteIntegration = Omit<Tables<"site_integrations">, "config"> & {
  config: Record<string, unknown>
}

type BlogSettingsProps = {
  site: Tables<"sites">
  integrations: SiteIntegration[]
}

function statusLabel(status: string) {
  if (status === "active") return "Ativo"
  if (status === "pending_dns") return "Aguardando DNS"
  if (status === "error") return "Erro"
  return "Nao configurado"
}

function IntegrationDialog({
  integration,
  current,
}: {
  integration: (typeof integrations)[number]
  current?: SiteIntegration
}) {
  const [state, formAction, pending] = useActionState(saveSiteIntegration, initialState)
  const config = current?.config ?? {}

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {current?.status === "configured" ? "Gerenciar" : "Conectar"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{integration.name}</DialogTitle>
          <DialogDescription>
            Salve a configuracao usada pela publicacao automatica em APIs externas.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="provider" value={integration.id} />
          <div className="space-y-2">
            <Label htmlFor={`${integration.id}-endpoint`}>URL ou endpoint</Label>
            <Input
              id={`${integration.id}-endpoint`}
              name="endpoint"
              defaultValue={String(config.endpoint ?? "")}
              placeholder="https://cliente.com.br"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${integration.id}-api-key`}>Chave/API token</Label>
            <Input
              id={`${integration.id}-api-key`}
              name="api_key"
              type="password"
              placeholder={config.has_api_key ? "Chave ja informada" : "Opcional"}
            />
            <p className="text-xs text-muted-foreground">
              Se ja houver uma chave salva, deixe em branco para mante-la.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${integration.id}-notes`}>Notas</Label>
            <Textarea
              id={`${integration.id}-notes`}
              name="notes"
              defaultValue={String(config.notes ?? "")}
              placeholder="Contexto interno da integracao"
            />
          </div>

          {(state.error || state.success) && (
            <p className={cn("text-sm", state.error ? "text-destructive" : "text-green-700")}>
              {state.error || state.success}
            </p>
          )}

          <Button disabled={pending}>{pending ? "Salvando..." : "Salvar integracao"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function BlogSettings({ site, integrations: savedIntegrations }: BlogSettingsProps) {
  const [state, formAction, pending] = useActionState(saveBlogDomain, initialState)
  const [subdomain, setSubdomain] = useState(site.subdomain)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Configuracoes de Dominio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="rounded-xl border border-border p-6">
          <input type="hidden" name="language" value={site.language} />
          <h3 className="text-sm font-medium text-foreground">Endereco do blog</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Escolha onde seu blog sera publicado
          </p>
          
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blog-name">Nome do blog</Label>
              <Input id="blog-name" name="name" defaultValue={site.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-subdomain">Subdominio gratuito</Label>
              <Input
                id="blog-subdomain"
                name="subdomain"
                value={subdomain}
                onChange={(event) => setSubdomain(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Subdominio gratuito</p>
                  <p className="text-xs text-muted-foreground">/blog/{subdomain || "slug"}</p>
                </div>
              </div>
              <Badge className="gap-1 bg-green-100 text-green-700">
                <Check className="h-3 w-3" />
                Ativo
              </Badge>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Dominio personalizado</p>
                    <p className="text-xs text-muted-foreground">
                      Recomendado: blog.cliente.com.br via CNAME
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{statusLabel(site.custom_domain_status)}</Badge>
              </div>
              <Input
                name="custom_domain"
                defaultValue={site.custom_domain ?? ""}
                placeholder="blog.cliente.com.br"
                className="mt-4"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Ao salvar, o dominio fica como pending_dns ate a verificacao do CNAME.
              </p>
            </div>
          </div>

          {(state.error || state.success) && (
            <p className={cn("mt-4 text-sm", state.error ? "text-destructive" : "text-green-700")}>
              {state.error || state.success}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <Button disabled={pending}>{pending ? "Salvando..." : "Salvar dominio"}</Button>
          </div>
        </form>

        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Integracoes CMS</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Conecte com sua plataforma de conteudo existente (opcional)
          </p>

          <div className="space-y-3">
            {integrations.map((integration) => {
              const current = savedIntegrations.find((item) => item.provider === integration.id)
              return (
                <div
                  key={integration.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-mono text-sm font-bold text-muted-foreground">
                      {integration.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{integration.name}</p>
                        {current?.status === "configured" && (
                          <Badge className="bg-green-100 text-green-700">Configurado</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <IntegrationDialog integration={integration} current={current} />
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              Posts agendados usam a integracao configurada quando o cron de publicacao estiver ativo.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
