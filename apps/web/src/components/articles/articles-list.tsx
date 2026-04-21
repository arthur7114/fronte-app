"use client";

import { AlertCircle, Calendar, CheckCircle2, Clock, Edit2, Eye, FileText, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const articles = [
  { id: "1", title: "10 Dicas para Manter os Dentes Brancos em Casa", excerpt: "Descubra tecnicas simples e eficazes para manter o brilho do seu sorriso sem sair de casa...", status: "published", createdAt: "5 Abr 2026", views: "2.3K", keywords: ["clareamento dental", "dentes brancos"] },
  { id: "2", title: "Quanto Custa um Implante Dentario em 2024", excerpt: "Um guia completo sobre valores, procedimentos e o que esperar ao fazer um implante dentario...", status: "published", createdAt: "2 Abr 2026", views: "1.8K", keywords: ["implante dentario", "preco implante"] },
  { id: "3", title: "Clareamento Dental: Caseiro ou no Consultorio?", excerpt: "Entenda as diferencas entre os metodos de clareamento e qual e o melhor para voce...", status: "review", createdAt: "Hoje", views: null, keywords: ["clareamento dental", "clareamento caseiro"] },
  { id: "4", title: "Por Que Meus Dentes Doem com Frio?", excerpt: "Sensibilidade dental pode ter varias causas. Veja o que pode estar acontecendo...", status: "draft", createdAt: "Hoje", views: null, keywords: ["sensibilidade dental", "dor de dente"] },
  { id: "5", title: "Guia Completo do Aparelho Invisivel", excerpt: "Tudo o que voce precisa saber sobre alinhadores transparentes e como funcionam...", status: "scheduled", scheduledFor: "15 Abr 2026", createdAt: "8 Abr 2026", views: null, keywords: ["aparelho invisivel", "invisalign"] },
];

const statusConfig = {
  draft: { label: "Rascunho", icon: FileText, color: "bg-muted text-muted-foreground" },
  review: { label: "Em revisao", icon: AlertCircle, color: "bg-amber-100 text-amber-700" },
  scheduled: { label: "Agendado", icon: Calendar, color: "bg-blue-100 text-blue-700" },
  published: { label: "Publicado", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
};

type ArticlesListProps = {
  viewMode: "list" | "grid";
  onSelectArticle: (id: string) => void;
};

export function ArticlesList({ viewMode, onSelectArticle }: ArticlesListProps) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {["Todos", "Rascunhos", "Em revisao", "Agendados", "Publicados"].map((filter, index) => (
          <Button key={filter} variant={index === 0 ? "secondary" : "ghost"} size="sm" className="rounded-full">
            {filter}
          </Button>
        ))}
      </div>

      <div className={cn("gap-4", viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "space-y-4")}>
        {articles.map((article) => {
          const status = statusConfig[article.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          return (
            <Card key={article.id} className="cursor-pointer transition-all hover:shadow-md" onClick={() => onSelectArticle(article.id)}>
              <CardContent className={cn("p-5", viewMode === "list" && "flex gap-6")}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className={cn("mb-2", status.color)}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                      <h3 className="line-clamp-2 font-medium text-foreground">{article.title}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit2 className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {article.keywords.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{keyword}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.createdAt}</span>
                    {article.views ? <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views} visualizacoes</span> : null}
                    {article.scheduledFor ? <span className="flex items-center gap-1 text-blue-600"><Calendar className="h-3 w-3" />Agendado para {article.scheduledFor}</span> : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
