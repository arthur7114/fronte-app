"use client";

import Link from "next/link";
import type { Tables } from "@super/db";
import { ArrowRight, Globe, LayoutTemplate, Plus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SiteSetupPanelProps = {
  tenantName: string;
  site?: Tables<"sites"> | null;
  publishedPosts?: number;
};

export function SiteSetupPanel({
  tenantName,
  site,
  publishedPosts = 0,
}: SiteSetupPanelProps) {
  if (!site) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configurar Blog</CardTitle>
          <CardDescription>
            {tenantName} ainda nao possui um blog configurado. Crie seu blog para comecar a
            publicar conteudo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
            <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">Crie a identidade do seu blog</h4>
              <p className="text-sm text-muted-foreground">
                O endereco publico onde seus clientes encontrarao seu conteudo.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/onboarding/site">
              Comecar configuracao <ArrowRight className="ml-2 h-4 w-4" />
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
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Detalhes do Blog</CardTitle>
              <CardDescription>Seu conteudo esta disponivel online.</CardDescription>
            </div>
            <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
              Online
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Subdominio</span>
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
        <CardFooter className="flex justify-between gap-2 border-t bg-muted/20 pt-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/blog/${site.subdomain}`} target="_blank">
              Visitar Blog
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/configuracoes/site">
              <Settings className="mr-2 h-4 w-4" />
              Configuracoes
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Rapidas</CardTitle>
          <CardDescription>O que voce deseja fazer agora?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link
            href="/app/artigos/new"
            className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Criar Novo Artigo</span>
              <span className="text-xs text-muted-foreground">
                Escreva ou gere um novo post para seu blog.
              </span>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link
            href="/app/estrategias"
            className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Configurar Automacao</span>
              <span className="text-xs text-muted-foreground">
                Ajuste temas e calendario de publicacao.
              </span>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
