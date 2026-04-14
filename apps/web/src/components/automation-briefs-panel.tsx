"use client";

import { useActionState } from "react";
import type { Tables } from "@super/db";
import {
  enqueueDraftGeneration,
  type BriefDraftState,
} from "@/app/app/automation/actions";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type AutomationBriefsPanelProps = {
  briefs: Tables<"content_briefs">[];
};

const initialState: BriefDraftState = {};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
    new Date(value),
  );
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
        <Badge className="gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Zap className="h-3.5 w-3.5" />
          Draft gerado
        </Badge>
      );
    default:
      return (
        <Badge className="gap-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100">
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
                        "rounded-xl border border-border p-5 transition-all hover:shadow-sm",
                        isReady && "border-green-200 bg-green-50/30",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            {statusBadge(brief.status)}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(brief.created_at)}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-foreground">
                            {brief.topic}
                          </h3>
                        </div>
                      </div>

                      {/* Angle + Keywords */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Ângulo editorial
                          </p>
                          <p className="text-sm text-foreground">
                            {brief.angle ?? (
                              <span className="italic text-muted-foreground">
                                Sem ângulo definido
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Palavras-chave
                          </p>
                          {brief.keywords && brief.keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {brief.keywords.map((kw) => (
                                <span
                                  key={kw}
                                  className="rounded-full bg-background px-2.5 py-0.5 text-xs text-foreground ring-1 ring-border"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm italic text-muted-foreground">
                              Sem keywords
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Feedback */}
                      {feedbackMsg?.error && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <p className="text-sm text-red-700">{feedbackMsg.error}</p>
                        </div>
                      )}
                      {feedbackMsg?.success && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <p className="text-sm text-green-700">{feedbackMsg.success}</p>
                        </div>
                      )}

                      {/* Action */}
                      {isReady && (
                        <div className="mt-4 border-t border-border pt-4">
                          <Button type="submit" disabled={isPending} className="gap-2">
                            <Zap className="h-4 w-4" />
                            Gerar draft
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
