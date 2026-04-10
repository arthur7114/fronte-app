"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  MoreHorizontal,
  Calendar,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const articles = [
  {
    id: "1",
    title: "10 Dicas para Manter os Dentes Brancos em Casa",
    excerpt: "Descubra técnicas simples e eficazes para manter o brilho do seu sorriso sem sair de casa...",
    status: "published",
    createdAt: "5 Abr 2026",
    views: "2.3K",
    keywords: ["clareamento dental", "dentes brancos"],
  },
  {
    id: "2",
    title: "Quanto Custa um Implante Dentário em 2024",
    excerpt: "Um guia completo sobre valores, procedimentos e o que esperar ao fazer um implante dentário...",
    status: "published",
    createdAt: "2 Abr 2026",
    views: "1.8K",
    keywords: ["implante dentário", "preço implante"],
  },
  {
    id: "3",
    title: "Clareamento Dental: Caseiro ou no Consultório?",
    excerpt: "Entenda as diferenças entre os métodos de clareamento e qual é o melhor para você...",
    status: "review",
    createdAt: "Hoje",
    views: null,
    keywords: ["clareamento dental", "clareamento caseiro"],
  },
  {
    id: "4",
    title: "Por Que Meus Dentes Doem com Frio?",
    excerpt: "Sensibilidade dental pode ter várias causas. Veja o que pode estar acontecendo...",
    status: "draft",
    createdAt: "Hoje",
    views: null,
    keywords: ["sensibilidade dental", "dor de dente"],
  },
  {
    id: "5",
    title: "Guia Completo do Aparelho Invisível",
    excerpt: "Tudo o que você precisa saber sobre alinhadores transparentes e como funcionam...",
    status: "scheduled",
    scheduledFor: "15 Abr 2026",
    createdAt: "8 Abr 2026",
    views: null,
    keywords: ["aparelho invisível", "invisalign"],
  },
]

const statusConfig = {
  draft: {
    label: "Rascunho",
    icon: FileText,
    color: "bg-muted text-muted-foreground",
  },
  review: {
    label: "Em revisão",
    icon: AlertCircle,
    color: "bg-amber-100 text-amber-700",
  },
  scheduled: {
    label: "Agendado",
    icon: Calendar,
    color: "bg-blue-100 text-blue-700",
  },
  published: {
    label: "Publicado",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
}

type ArticlesListProps = {
  viewMode: "list" | "grid"
  onSelectArticle: (id: string) => void
}

export function ArticlesList({ viewMode, onSelectArticle }: ArticlesListProps) {
  return (
    <div>
      {/* Status Filters */}
      <div className="mb-6 flex items-center gap-2">
        <Button variant="secondary" size="sm" className="rounded-full">
          Todos
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full">
          Rascunhos
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full">
          Em revisão
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full">
          Agendados
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full">
          Publicados
        </Button>
      </div>

      {/* Articles */}
      <div
        className={cn(
          "gap-4",
          viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"
        )}
      >
        {articles.map((article) => {
          const status = statusConfig[article.status as keyof typeof statusConfig]
          const StatusIcon = status.icon

          return (
            <Card
              key={article.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => onSelectArticle(article.id)}
            >
              <CardContent className={cn("p-5", viewMode === "list" && "flex gap-6")}>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className={cn("mb-2", status.color)}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                      <h3 className="font-medium text-foreground line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>

                  {/* Keywords */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {article.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.createdAt}
                    </span>
                    {article.views && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views} visualizações
                      </span>
                    )}
                    {article.scheduledFor && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Calendar className="h-3 w-3" />
                        Agendado para {article.scheduledFor}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
