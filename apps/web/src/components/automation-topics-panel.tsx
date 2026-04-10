"use client";

import { useActionState } from "react";
import type { Tables } from "@super/db";
import {
  moderateTopicCandidate,
  type TopicModerationState,
} from "@/app/app/automation/actions";
import { TOPIC_STATUS_LABELS } from "@/lib/automation";

type AutomationTopicsPanelProps = {
  topics: Tables<"topic_candidates">[];
};

const initialState: TopicModerationState = {};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTopicStatusClass(status: string) {
  switch (status) {
    case "approved":
      return "border-success/20 bg-success/10 text-success";
    case "rejected":
      return "border-danger/20 bg-danger/10 text-danger";
    default:
      return "border-warning/20 bg-warning/10 text-warning";
  }
}

export function AutomationTopicsPanel({ topics }: AutomationTopicsPanelProps) {
  const [state, formAction, isPending] = useActionState(
    moderateTopicCandidate,
    initialState,
  );
  const pendingCount = topics.filter((topic) => topic.status === "pending").length;
  const approvedCount = topics.filter((topic) => topic.status === "approved").length;
  const rejectedCount = topics.filter((topic) => topic.status === "rejected").length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
        <article className="dashboard-surface rounded-lg p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Curadoria
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
            Revise, edite e aprove os temas gerados pelo worker.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">
            Cada aprovacao cria um job real de briefing. Rejeitar encerra o fluxo atual
            sem apagar o historico do tenant.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-secondary/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Pendentes
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">{pendingCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Aprovados
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">{approvedCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Rejeitados
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">{rejectedCount}</p>
            </div>
          </div>
        </article>

        <aside className="dashboard-surface rounded-lg p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Criterio de triagem
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
              Aprove o que faz sentido para o tenant agora.
            </h3>
            <p className="mt-2 text-sm leading-7 text-black/62">
              O foco deste bloco e transformar temas pendentes em briefings usaveis, sem
              automatizar a curadoria.
            </p>
          </div>

          <div className="space-y-3 border-t border-black/10 pt-4 text-sm leading-7 text-black/65">
            <p>1. Edite o texto do tema antes de aprovar, se precisar.</p>
            <p>2. Use rejeicao para manter o historico sem seguir para briefing.</p>
            <p>3. Depois da aprovacao, acompanhe o job em /app/jobs.</p>
          </div>
        </aside>
      </div>

      <div className="space-y-4">
        {topics.length === 0 ? (
          <div className="dashboard-surface rounded-lg p-6 text-sm leading-7 text-black/62">
            Nenhum tema foi gerado ainda. Volte em Automacao para enfileirar uma nova
            pesquisa.
          </div>
        ) : (
          topics.map((topic) => {
            const rowMessage = state.topicId === topic.id ? state : null;

            return (
              <form
                key={topic.id}
                action={formAction}
                className="dashboard-surface rounded-lg p-6 sm:p-8"
              >
                <input type="hidden" name="topic_id" value={topic.id} />

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
                      Tema pendente
                    </p>
                    <textarea
                      name="topic"
                      defaultValue={topic.topic}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-white px-4 py-4 text-xl font-semibold tracking-[-0.03em] text-black outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
                    />
                    <p className="text-sm leading-7 text-black/62">
                      {topic.source ?? "Sem origem"} - {formatDateTime(topic.created_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${getTopicStatusClass(
                      topic.status,
                    )}`}
                  >
                    {TOPIC_STATUS_LABELS[topic.status as keyof typeof TOPIC_STATUS_LABELS] ??
                      topic.status}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-secondary/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                      Pontuacao
                    </p>
                    <p className="mt-2 text-lg font-medium text-black">
                      {topic.score ?? "Sem score"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                      Origem
                    </p>
                    <p className="mt-2 text-lg font-medium text-black">{topic.source ?? "-"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                      Status atual
                    </p>
                    <p className="mt-2 text-lg font-medium text-black">
                      {TOPIC_STATUS_LABELS[topic.status as keyof typeof TOPIC_STATUS_LABELS] ??
                        topic.status}
                    </p>
                  </div>
                </div>

                {rowMessage?.error ? (
                  <p className="mt-4 border border-[#b3422f]/20 bg-[#b3422f]/8 px-4 py-3 text-sm text-[#b3422f]">
                    {rowMessage.error}
                  </p>
                ) : null}
                {rowMessage?.success ? (
                  <p className="mt-4 border border-[#2f6b4f]/20 bg-[#edf7ef] px-4 py-3 text-sm text-[#2f6b4f]">
                    {rowMessage.success}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    name="intent"
                    value="approve"
                    disabled={isPending}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                  >
                    Aprovar e gerar briefing
                  </button>
                  <button
                    type="submit"
                    name="intent"
                    value="reject"
                    disabled={isPending}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-black transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                  >
                    Rejeitar
                  </button>
                </div>
              </form>
            );
          })
        )}
      </div>
    </section>
  );
}
