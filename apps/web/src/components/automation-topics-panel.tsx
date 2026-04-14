"use client";

import { useActionState } from "react";
import type { Tables } from "@super/db";
import {
  moderateTopicCandidate,
  type TopicModerationState,
} from "@/app/app/automation/actions";
import { TOPIC_STATUS_LABELS } from "@/lib/automation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AutomationTopicsPanelProps = {
  topics: Tables<"topic_candidates">[];
};

const initialState: TopicModerationState = {};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="gap-1.5 bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprovado
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="gap-1.5 bg-red-100 text-red-700 hover:bg-red-100">
          <XCircle className="h-3.5 w-3.5" />
          Rejeitado
        </Badge>
      );
    default:
      return (
        <Badge className="gap-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="h-3.5 w-3.5" />
          Pendente
        </Badge>
      );
  }
}

function scoreLabel(score: number | null): { label: string; cls: string } {
  if (score === null) return { label: "—", cls: "text-muted-foreground" };
  if (score >= 80) return { label: `${score}`, cls: "text-green-600 font-semibold" };
  if (score >= 50) return { label: `${score}`, cls: "text-amber-600 font-semibold" };
  return { label: `${score}`, cls: "text-red-500 font-semibold" };
}

export function AutomationTopicsPanel({ topics }: AutomationTopicsPanelProps) {
  const [state, formAction, isPending] = useActionState(
    moderateTopicCandidate,
    initialState,
  );

  const pendingCount = topics.filter((t) => t.status === "pending").length;
  const approvedCount = topics.filter((t) => t.status === "approved").length;
  const rejectedCount = topics.filter((t) => t.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Aguardando curadoria
            </p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {pendingCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Aprovados
            </p>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {approvedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rejeitados
            </p>
            <p className="mt-2 text-3xl font-semibold text-muted-foreground">
              {rejectedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Topics list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
              Tópicos Sugeridos pela IA
            </CardTitle>
            {pendingCount > 0 && (
              <Badge className="gap-1.5 bg-amber-100 text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Tópicos gerados automaticamente com base no briefing e nas automações. Edite o
            texto antes de aprovar. Cada aprovação cria um briefing de conteúdo.
          </p>

          {topics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum tópico gerado ainda. Acesse{" "}
                <strong className="text-foreground">Automação</strong> para iniciar uma
                pesquisa.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => {
                const feedbackMsg = state.topicId === topic.id ? state : null;
                const score = scoreLabel(topic.score);
                const isPending_ = topic.status === "pending";

                return (
                  <form key={topic.id} action={formAction}>
                    <input type="hidden" name="topic_id" value={topic.id} />

                    <div
                      className={cn(
                        "rounded-xl border border-border p-5 transition-all hover:shadow-sm",
                        topic.status === "approved" && "border-green-200 bg-green-50/30",
                        topic.status === "rejected" && "opacity-60",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          {/* Status + date */}
                          <div className="mb-3 flex items-center gap-2">
                            {statusBadge(topic.status)}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(topic.created_at)}
                            </span>
                            {topic.source && (
                              <span className="text-xs text-muted-foreground">
                                · {topic.source}
                              </span>
                            )}
                          </div>

                          {/* Editable topic title */}
                          {isPending_ ? (
                            <textarea
                              name="topic"
                              defaultValue={topic.topic}
                              rows={2}
                              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-base font-medium text-foreground outline-none transition-colors focus:border-primary"
                            />
                          ) : (
                            <>
                              <input type="hidden" name="topic" value={topic.topic} />
                              <h3 className="text-base font-medium text-foreground">
                                {topic.topic}
                              </h3>
                            </>
                          )}
                        </div>

                        {/* Score */}
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className={cn("text-lg", score.cls)}>{score.label}</p>
                        </div>
                      </div>

                      {/* Feedback messages */}
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

                      {/* Actions — only show for pending */}
                      {isPending_ && (
                        <div className="mt-4 flex gap-2 border-t border-border pt-4">
                          <Button
                            type="submit"
                            name="intent"
                            value="approve"
                            disabled={isPending}
                            className="gap-1.5"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Aprovar e gerar briefing
                          </Button>
                          <Button
                            type="submit"
                            name="intent"
                            value="reject"
                            variant="outline"
                            disabled={isPending}
                            className="gap-1.5"
                          >
                            <XCircle className="h-4 w-4" />
                            Rejeitar
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
