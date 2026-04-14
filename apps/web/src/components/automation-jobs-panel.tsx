import Link from "next/link";
import type { Tables } from "@super/db";
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS } from "@/lib/automation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  Ban,
  Loader2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AutomationJobsPanelProps = {
  jobs: Tables<"automation_jobs">[];
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getResultSummary(job: Tables<"automation_jobs">) {
  const result = asRecord(job.result_json);
  if (!result) return null;

  const topicIds = Array.isArray(result.topic_candidate_ids)
    ? result.topic_candidate_ids.filter((i): i is string => typeof i === "string")
    : [];
  const contentBriefId =
    typeof result.content_brief_id === "string" ? result.content_brief_id : null;
  const postId = typeof result.post_id === "string" ? result.post_id : null;

  if (topicIds.length > 0) return `${topicIds.length} tópicos criados`;
  if (contentBriefId) return `Brief criado`;
  if (postId) return `Rascunho criado`;
  return "Resultado registrado";
}

function getEntityLink(job: Tables<"automation_jobs">) {
  const result = asRecord(job.result_json);
  const payload = asRecord(job.payload_json);

  const topicIds = Array.isArray(result?.topic_candidate_ids)
    ? result.topic_candidate_ids.filter((i): i is string => typeof i === "string")
    : [];
  const contentBriefId =
    typeof result?.content_brief_id === "string" ? result.content_brief_id : null;
  const postId =
    typeof result?.post_id === "string"
      ? result.post_id
      : typeof payload?.post_id === "string"
        ? payload.post_id
        : null;

  if (topicIds.length > 0) return { href: "/app/automation/topics", label: "Ver tópicos" };
  if (contentBriefId) return { href: "/app/automation/briefs", label: "Ver briefing" };
  if (postId) return { href: `/app/posts/${postId}`, label: "Ver post" };
  return null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; badgeClass: string; rowClass: string }
> = {
  running: {
    label: "Em execução",
    icon: Loader2,
    badgeClass: "bg-amber-100 text-amber-700",
    rowClass: "border-l-2 border-l-amber-400",
  },
  failed: {
    label: "Falhou",
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-700",
    rowClass: "border-l-2 border-l-red-400",
  },
  completed: {
    label: "Concluído",
    icon: CheckCircle2,
    badgeClass: "bg-green-100 text-green-700",
    rowClass: "",
  },
  pending: {
    label: "Pendente",
    icon: Clock,
    badgeClass: "bg-muted text-muted-foreground",
    rowClass: "",
  },
  cancelled: {
    label: "Cancelado",
    icon: Ban,
    badgeClass: "bg-muted text-muted-foreground",
    rowClass: "",
  },
};

export function AutomationJobsPanel({ jobs }: AutomationJobsPanelProps) {
  const runningCount = jobs.filter((j) => j.status === "running").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;
  const scheduledPublishCount = jobs.filter(
    (j) => j.type === "publish_post" && j.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Em execução
              </p>
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{runningCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Falhos
              </p>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-red-600">{failedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Publicações agendadas
              </p>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-muted-foreground">
              {scheduledPublishCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Activity className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum job registrado ainda. O worker inicia os primeiros jobs após a configuração da automação.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const entityLink = getEntityLink(job);
            const resultSummary = getResultSummary(job);

            return (
              <Card key={job.id} className={cn("overflow-hidden", cfg.rowClass)}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left: type + badge */}
                    <div className="flex items-center gap-3">
                      <Badge className={cn("gap-1 shrink-0", cfg.badgeClass)}>
                        <StatusIcon
                          className={cn(
                            "h-3 w-3",
                            job.status === "running" && "animate-spin",
                          )}
                        />
                        {cfg.label}
                      </Badge>
                      <div>
                        <p className="font-semibold text-foreground">
                          {JOB_TYPE_LABELS[job.type as keyof typeof JOB_TYPE_LABELS] ?? job.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Prioridade {job.priority} · Tentativas {job.attempts}/{job.max_attempts}
                        </p>
                      </div>
                    </div>

                    {/* Right: entity link */}
                    {entityLink && (
                      <Link
                        href={entityLink.href}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {entityLink.label}
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  {/* Timestamps + Result */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    {formatDateTime(job.scheduled_for) && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Agendado: {formatDateTime(job.scheduled_for)}
                      </span>
                    )}
                    {formatDateTime(job.started_at) && (
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Iniciado: {formatDateTime(job.started_at)}
                      </span>
                    )}
                    {formatDateTime(job.finished_at) && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Finalizado: {formatDateTime(job.finished_at)}
                      </span>
                    )}
                    {resultSummary && (
                      <span className="text-foreground">{resultSummary}</span>
                    )}
                  </div>

                  {/* Error message */}
                  {job.error_message && (
                    <div className="mt-3 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{job.error_message}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
