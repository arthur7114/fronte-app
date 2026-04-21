"use client";

import { AlertCircle, Check, Globe, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const integrations = [
  { id: "wordpress", name: "WordPress", description: "Conecte seu blog WordPress existente", icon: "W" },
  { id: "webflow", name: "Webflow", description: "Integre com seu site Webflow", icon: "Wf" },
  { id: "custom", name: "API Personalizada", description: "Use nossa API REST para integracao customizada", icon: "</>" },
];

export function BlogSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Configuracoes de Dominio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-foreground">Endereco do blog</h3>
          <p className="mt-1 text-xs text-muted-foreground">Escolha onde seu blog sera publicado</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Subdominio gratuito</p>
                  <p className="text-xs text-muted-foreground">clinicadental.contentai.com.br</p>
                </div>
              </div>
              <Badge className="gap-1 bg-green-100 text-green-700">
                <Check className="h-3 w-3" />
                Ativo
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dominio personalizado</p>
                  <p className="text-xs text-muted-foreground">blog.clinicadental.com.br</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Integracoes CMS</h3>
          <p className="mb-4 text-xs text-muted-foreground">Conecte com sua plataforma de conteudo existente (opcional)</p>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-mono text-sm font-bold text-muted-foreground">
                    {integration.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Conectar
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              Nao se preocupe se voce nao tem um blog ainda. O ContentAI pode criar e hospedar seu blog gratuitamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
