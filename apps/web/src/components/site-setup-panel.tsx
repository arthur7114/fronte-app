"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Settings, Plus, LayoutTemplate, Globe } from "lucide-react";

type SiteSetupPanelProps = {
  tenantName: string;
  site?: any;
  publishedPosts?: number;
  flow?: string;
};

export function SiteSetupPanel({ tenantName, site, publishedPosts = 0, flow }: SiteSetupPanelProps) {
  if (!site) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configurar Blog</CardTitle>
          <CardDescription>
            {tenantName} ainda não possui um blog configurado. Crie seu blog para começar a publicar seu conteúdo gerado por IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/50">
            <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">Crie a identidade do seu blog</h4>
              <p className="text-sm text-muted-foreground">O endereço público onde seus clientes encontrarão seu conteúdo.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/onboarding/site">
              Começar configuração <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Detalhes do Blog</CardTitle>
              <CardDescription>
                Seu conteúdo está disponível online.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Online
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Subdomínio</span>
            </div>
            <span className="text-sm">{site.subdomain}.antigravity.blog</span>
          </div>
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Nome do Blog</span>
            </div>
            <span className="text-sm">{site.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Posts Publicados</span>
            <Badge variant="secondary">{publishedPosts}</Badge>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 border-t pt-6 bg-muted/20">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/blog/${site.subdomain}`} target="_blank">
              Visitar Blog
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/settings/site">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>O que você deseja fazer agora?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/app/posts/new" className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted transition">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Criar Novo Artigo</span>
              <span className="text-xs text-muted-foreground">Escreva ou gere um novo post para seu blog.</span>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href="/app/automation" className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted transition">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Configurar Automação</span>
              <span className="text-xs text-muted-foreground">Ajuste os temas e calendário de publicação.</span>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
