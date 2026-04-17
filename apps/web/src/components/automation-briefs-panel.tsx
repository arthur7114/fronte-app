"use client";

import { useActionState } from "react";
import type { Tables } from "@super/db";
import {
  enqueueDraftGeneration,
  type BriefDraftState,
} from "@/app/app/estrategias/actions";
import { BRIEF_STATUS_LABELS } from "@/lib/automation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
  Check,
  Target,
  Compass,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AutomationBriefsPanelProps = {
  briefs: (Tables<"content_briefs"> & {
    justification?: string | null;
    journey_stage?: string | null;
  })[];
};


const initialState: BriefDraftState = {};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
    new Date(value),
  );
}

function stageBadge(stage?: string | null) {
  const s = stage?.toLowerCase() || "awareness";
  switch (s) {
    case "awareness":
      return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Consciência</Badge>;
    case "consideration":
      return <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">Consideração</Badge>;
    case "evaluation":
      return <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">Avaliação</Badge>;
    case "decision":
      return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Decisão</Badge>;
    default:
      return <Badge variant="outline">{s}</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="gap-1.5 bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Pronto para gerar
        </Badge>
      );
    case "draft_generated":
      return (
        <Badge className="gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
          <Zap className="h-3.5 w-3.5" />
          Rascunho Criado
        </Badge>
      );
    default:
      return (
        <Badge className="gap-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
          <Clock className="h-3.5 w-3.5" />
          {BRIEF_STATUS_LABELS[status as keyof typeof BRIEF_STATUS_LABELS] ?? status}
        </Badge>
      );
  }
}


export function AutomationBriefsPanel({ briefs }: AutomationBriefsPanelProps) {
  const [state, formAction, isPending] = useActionState(
    enqueueDraftGeneration,
    initialState,
  );

  const readyCount = briefs.filter((b) => b.status === "approved").length;
  const draftedCount = briefs.filter((b) => b.status === "draft_generated").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Prontos para gerar
            </p>
            <p className="mt-2 text-3xl font-semibold text-green-600">{readyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Drafts gerados
            </p>
            <p className="mt-2 text-3xl font-semibold text-primary">{draftedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Briefs list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Briefings de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Cada briefing aprovado em Tópicos aparece aqui. Clique em{" "}
            <strong className="text-foreground">Gerar draft</strong> para disparar a
            criação do artigo. O resultado aparece em Posts como rascunho.
          </p>

          {briefs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum briefing encontrado. Aprove um tópico para liberar esta etapa.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {briefs.map((brief) => {
                const feedbackMsg = state.briefId === brief.id ? state : null;
                const isReady = brief.status === "approved";

                return (
                  <form key={brief.id} action={formAction}>
                    <input type="hidden" name="brief_id" value={brief.id} />

                    <div
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md",
                        isReady && "border-green-100/50 bg-green-50/10",
                      )}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {statusBadge(brief.status)}
                            {stageBadge(brief.journey_stage)}
                            <Badge variant="secondary" className="bg-muted/50 text-xs font-normal">
                              {formatDate(brief.created_at)}
                            </Badge>
                          </div>
                          
                          <h3 className="text-xl font-bold tracking-tight text-foreground">
                            {brief.topic}
                          </h3>

                          {brief.justification && (
                            <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-4 text-sm text-primary/80 ring-1 ring-primary/10">
                              <Compass className="mt-0.5 h-4 w-4 shrink-0" />
                              <p className="leading-relaxed">
                                <span className="font-semibold text-primary">Diretriz de Produção:</span> {brief.justification}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors group-hover:bg-muted/30">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Layout className="h-3.5 w-3.5" />
                            Ã‚ngulo Editorial
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {brief.angle ?? (
                              <span className="italic text-muted-foreground">AGUARDANDO ORIENTAÃ‡ÒO...</span>
                            )}
                          </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors group-hover:bg-muted/30">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Target className="h-3.5 w-3.5" />
                            Foco de Palavras-chave
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {brief.keywords && brief.keywords.length > 0 ? (
                              brief.keywords.map((kw) => (
                                <Badge
                                  key={kw}
                                  variant="secondary"
                                  className="bg-background/80 text-[10px] font-medium ring-1 ring-border/50"
                                >
                                  {kw}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm italic text-muted-foreground">Nenhuma palavra-chave especificada</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      {feedbackMsg?.error && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {feedbackMsg.error}
                        </div>
                      )}
                      {feedbackMsg?.success && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700 ring-1 ring-green-100">
                          <Check className="h-4 w-4 shrink-0" />
                          {feedbackMsg.success}
                        </div>
                      )}

                      {/* Action */}
                      {isReady && (
                        <div className="mt-6 flex items-center justify-end border-t border-border/50 pt-6">
                          <Button 
                            type="submit" 
                            disabled={isPending} 
                            className="bg-primary px-8 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                          >
                            <Zap className="mr-2 h-4 w-4 fill-current" />
                            Gerar Primeiro Rascunho
                          </Button>
                        </div>
                      )}
                    </div>

                  </form>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

