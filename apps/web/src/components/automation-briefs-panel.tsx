"use client";

import { useActionState } from "react";
import type { Tables } from "@super/db";
import {
  enqueueDraftGeneration,
  type BriefDraftState,
} from "@/app/app/automation/actions";
import { BRIEF_STATUS_LABELS } from "@/lib/automation";

type AutomationBriefsPanelProps = {
  briefs: Tables<"content_briefs">[];
};

const initialState: BriefDraftState = {};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function compactList(values: string[] | null | undefined) {
  if (!values || values.length === 0) {
    return "Sem keywords";
  }

  return values.join(" - ");
}

export function AutomationBriefsPanel({ briefs }: AutomationBriefsPanelProps) {
  const [state, formAction, isPending] = useActionState(
    enqueueDraftGeneration,
    initialState,
  );
  const readyCount = briefs.filter((brief) => brief.status === "approved").length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
        <article className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Briefings
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
            Gere drafts reais a partir dos briefings aprovados.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">
            Cada clique enfileira um job de geracao de post. O resultado final aparece
            em Posts como rascunho.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="border border-black/10 bg-[#fbf7f1] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Briefings prontos
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">{readyCount}</p>
            </div>
            <div className="border border-black/10 bg-[#fbf7f1] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Saida esperada
              </p>
              <p className="mt-2 text-lg font-medium text-black">Posts em rascunho</p>
            </div>
          </div>
        </article>

        <aside className="space-y-4 border border-black/12 bg-[#fbf7f1] p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Leitura rapida
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
              Um bom briefing reduz reescrita no draft.
            </h3>
            <p className="mt-2 text-sm leading-7 text-black/62">
              Valide se o angulo e as keywords estao claros antes de disparar a proxima
              etapa do worker.
            </p>
          </div>

          <div className="space-y-3 border-t border-black/10 pt-4 text-sm leading-7 text-black/65">
            <p>1. O tema ja deve ter sido aprovado em Temas.</p>
            <p>2. As keywords ajudam o draft sem engessar a narrativa.</p>
            <p>3. Depois do job, confira o resultado em Posts e Jobs.</p>
          </div>
        </aside>
      </div>

      <div className="space-y-4">
        {briefs.length === 0 ? (
          <div className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-6 text-sm leading-7 text-black/62 shadow-[0_24px_80px_rgba(17,17,17,0.08)]">
            Nenhum briefing foi gerado ainda. Aprove um tema para liberar essa etapa.
          </div>
        ) : (
          briefs.map((brief) => {
            const rowMessage = state.briefId === brief.id ? state : null;

            return (
              <form
                key={brief.id}
                action={formAction}
                className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8"
              >
                <input type="hidden" name="brief_id" value={brief.id} />

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
                    Briefing
                  </p>
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-black">
                    {brief.topic}
                  </h3>
                  <p className="text-sm leading-7 text-black/62">
                    {BRIEF_STATUS_LABELS[brief.status as keyof typeof BRIEF_STATUS_LABELS] ??
                      brief.status}{" "}
                    - {formatDateTime(brief.created_at)}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="border border-black/10 bg-[#fbf7f1] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                      Angulo
                    </p>
                    <p className="mt-2 text-sm leading-7 text-black/68">
                      {brief.angle ?? "Sem angulo definido"}
                    </p>
                  </div>
                  <div className="border border-black/10 bg-[#fbf7f1] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                      Keywords
                    </p>
                    <p className="mt-2 text-sm leading-7 text-black/68">
                      {compactList(brief.keywords)}
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
                    disabled={isPending}
                    className="inline-flex h-11 items-center justify-center border border-black bg-black px-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                  >
                    Gerar draft
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
