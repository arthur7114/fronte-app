"use client";

import { useState } from "react";
import Link from "next/link";
import type { Tables } from "@super/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Eye,
  Edit2,
  MoreHorizontal,
  Clock,
  Sparkles,
  LayoutList,
  Grid3X3,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PostsBoardProps = {
  posts: Tables<"posts">[];
  site: Tables<"sites">;
};

type FilterTab = "all" | "draft" | "in_review" | "approved" | "scheduled" | "published";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  draft: {
    label: "Rascunho",
    icon: FileText,
    color: "bg-muted text-muted-foreground",
  },
  in_review: {
    label: "Em revisão",
    icon: AlertCircle,
    color: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Aprovado",
    icon: CheckCircle2,
    color: "bg-blue-100 text-blue-700",
  },
  rejected: {
    label: "Rejeitado",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
  scheduled: {
    label: "Agendado",
    icon: Calendar,
    color: "bg-purple-100 text-purple-700",
  },
  published: {
    label: "Publicado",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "draft", label: "Rascunhos" },
  { key: "in_review", label: "Em revisão" },
  { key: "approved", label: "Aprovados" },
  { key: "scheduled", label: "Agendados" },
  { key: "published", label: "Publicados" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
    new Date(value),
  );
}

export function PostsBoard({ posts, site }: PostsBoardProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.status === filter);

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const reviewCount = posts.filter((p) => p.status === "in_review").length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Publicados
            </p>
            <p className="mt-2 text-3xl font-semibold text-green-600">{publishedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Em revisão
            </p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{reviewCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rascunhos
            </p>
            <p className="mt-2 text-3xl font-semibold text-muted-foreground">
              {draftCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const count = tab.key === "all" ? posts.length : posts.filter((p) => p.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                      filter === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

          <Button asChild className="gap-2">
            <Link href="/dashboard/artigos/novo">
              <Sparkles className="h-4 w-4" />
              Novo artigo
            </Link>
          </Button>
        </div>
      </div>

      {/* Articles */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              {filter === "all"
                ? "Nenhum artigo ainda. Crie um novo para iniciar o fluxo editorial."
                : `Nenhum artigo com status "${FILTER_TABS.find((t) => t.key === filter)?.label}".`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            "gap-4",
            viewMode === "grid"
              ? "grid sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3",
          )}
        >
          {filtered.map((post) => {
            const statusCfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.draft;
            const StatusIcon = statusCfg.icon;

            return (
              <Card
                key={post.id}
                className="group transition-all hover:shadow-md"
              >
                <CardContent className={cn("p-5", viewMode === "list" && "flex gap-6")}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Badge className={cn("mb-2 gap-1", statusCfg.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                        <Link href={`/dashboard/artigos/${post.id}`}>
                          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                      </div>

                      {/* Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/artigos/${post.id}`} className="flex items-center gap-2">
                              <Edit2 className="h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          {post.published_at && (
                            <DropdownMenuItem asChild>
                              <a
                                href={`/blog/${site.subdomain}/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Visualizar no blog
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Slug pill */}
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      /{post.slug}
                    </p>

                    {/* Meta */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Atualizado {formatDate(post.updated_at)}
                      </span>
                      {post.published_at && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Publicado {formatDate(post.published_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

