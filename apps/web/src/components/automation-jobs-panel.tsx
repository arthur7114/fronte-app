import Link from "next/link";
import type { Tables } from "@super/db";
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS } from "@/lib/automation";

type AutomationJobsPanelProps = {
  jobs: Tables<"automation_jobs">[];
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getJobStatusClass(status: string) {
  switch (status) {
    case "completed":
      return "border-[#2f6b4f] bg-[#edf7ef] text-[#2f6b4f]";
    case "failed":
      return "border-[#b3422f] bg-[#fff0ec] text-[#b3422f]";
    case "running":
      return "border-[#8b5b13] bg-[#fff4df] text-[#8b5b13]";
    case "cancelled":
      return "border-[#475569]/20 bg-[#f8fafc] text-[#475569]";
    default:
      return "border-[#2563eb]/15 bg-[#eff6ff] text-[#1d4ed8]";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getResultSummary(job: Tables<"automation_jobs">) {
  const result = asRecord(job.result_json);

  if (!result) {
    return "Sem resultado ainda.";
  }

  const topicIds = Array.isArray(result.topic_candidate_ids)
    ? result.topic_candidate_ids.filter((item): item is string => typeof item === "string")
    : [];
  const contentBriefId =
    typeof result.content_brief_id === "string" ? result.content_brief_id : null;
  const postId = typeof result.post_id === "string" ? result.post_id : null;

  if (topicIds.length > 0) {
    return `Topics criados: ${topicIds.length}`;
  }

  if (contentBriefId) {
    return `Brief criado: ${contentBriefId}`;
  }

  if (postId) {
    return `Post relacionado: ${postId}`;
  }

  return "Resultado recebido.";
}

function getEntityLink(job: Tables<"automation_jobs">) {
  const result = asRecord(job.result_json);
  const payload = asRecord(job.payload_json);

  const topicIds = Array.isArray(result?.topic_candidate_ids)
    ? result?.topic_candidate_ids.filter((item): item is string => typeof item === "string")
    : [];
  const contentBriefId =
    typeof result?.content_brief_id === "string" ? result.content_brief_id : null;
  const postId =
    typeof result?.post_id === "string"
      ? result.post_id
      : typeof payload?.post_id === "string"
        ? payload.post_id
        : null;

  if (topicIds.length > 0) {
    return {
      href: "/app/automation/topics",
      label: `${topicIds.length} topics`,
    };
  }

  if (contentBriefId) {
    return {
      href: "/app/automation/briefs",
      label: contentBriefId,
    };
  }

  if (postId) {
    return {
      href: `/app/posts/${postId}`,
      label: postId,
    };
  }

  return null;
}

export function AutomationJobsPanel({ jobs }: AutomationJobsPanelProps) {
  const runningCount = jobs.filter((job) => job.status === "running").length;
  const failedCount = jobs.filter((job) => job.status === "failed").length;
  const scheduledPublishCount = jobs.filter(
    (job) => job.type === "publish_post" && job.status === "pending",
  ).length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Jobs
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
            Acompanhe o pipeline real do worker por tenant.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">
            O painel agora cobre o ciclo inteiro do MVP, incluindo publicacao automatica por
            job e leitura melhor dos horarios e falhas.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="border border-black/10 bg-[#fbf7f1] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Rodando
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">{runningCount}</p>
            </div>
            <div className="border border-black/10 bg-[#fbf7f1] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Falhos
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">{failedCount}</p>
            </div>
            <div className="border border-black/10 bg-[#fbf7f1] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Publicacoes agendadas
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">{scheduledPublishCount}</p>
            </div>
          </div>
        </article>

        <aside className="space-y-4 border border-black/12 bg-[#fbf7f1] p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Leitura do painel
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
              Cada linha mostra tipo, janela e destino do processamento.
            </h3>
            <p className="mt-2 text-sm leading-7 text-black/62">
              Use os horarios para entender o ciclo do worker e os detalhes para chegar em
              temas, briefings ou posts relacionados.
            </p>
          </div>

          <div className="space-y-3 border-t border-black/10 pt-4 text-sm leading-7 text-black/65">
            <p>1. `research_topics` cria temas.</p>
            <p>2. `generate_brief` cria briefings.</p>
            <p>3. `generate_post` cria drafts.</p>
            <p>4. `publish_post` fecha a publicacao agendada.</p>
          </div>
        </aside>
      </div>

      <div className="overflow-hidden border border-black/12 bg-[rgba(255,255,255,0.84)] shadow-[0_24px_80px_rgba(17,17,17,0.08)]">
        <div className="grid grid-cols-[1fr_0.8fr_0.72fr_0.95fr_0.9fr_1.4fr] border-b border-black/10 bg-[#fbf7f1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
          <span>Tipo</span>
          <span>Status</span>
          <span>Tentativas</span>
          <span>Agendamento</span>
          <span>Vinculo</span>
          <span>Detalhe</span>
        </div>

        {jobs.length === 0 ? (
          <div className="px-4 py-6 text-sm leading-7 text-black/62">
            Nenhum job foi registrado ainda para este tenant.
          </div>
        ) : (
          jobs.map((job) => {
            const entityLink = getEntityLink(job);

            return (
              <article
                key={job.id}
                className="grid grid-cols-[1fr_0.8fr_0.72fr_0.95fr_0.9fr_1.4fr] border-b border-black/8 px-4 py-4 text-sm last:border-b-0"
              >
                <div className="space-y-1 pr-3">
                  <p className="font-semibold text-black">
                    {JOB_TYPE_LABELS[job.type as keyof typeof JOB_TYPE_LABELS] ?? job.type}
                  </p>
                  <p className="text-black/54">Prioridade {job.priority}</p>
                </div>
                <div>
                  <span
                    className={`inline-flex border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${getJobStatusClass(
                      job.status,
                    )}`}
                  >
                    {JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] ?? job.status}
                  </span>
                </div>
                <div className="text-black/65">
                  {job.attempts}/{job.max_attempts}
                </div>
                <div className="space-y-1 pr-2 text-black/60">
                  <p>Programado: {formatDateTime(job.scheduled_for)}</p>
                  <p>Inicio: {formatDateTime(job.started_at)}</p>
                  <p>Fim: {formatDateTime(job.finished_at)}</p>
                </div>
                <div className="text-black/60">
                  {entityLink ? (
                    <Link
                      href={entityLink.href}
                      className="underline decoration-black/25 underline-offset-4"
                    >
                      {entityLink.label}
                    </Link>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="space-y-1 pr-2 text-black/60">
                  <p>{getResultSummary(job)}</p>
                  <p>Atualizado: {formatDateTime(job.updated_at)}</p>
                  {job.error_message ? <p className="text-[#b3422f]">{job.error_message}</p> : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
