"use client";

import { useActionState, useMemo } from "react";
import type { Tables } from "@super/db";
import {
  saveBusinessBriefing,
  type BusinessBriefingState,
} from "@/app/app/briefing/actions";
import { stringifyBriefingList } from "@/lib/business-briefing";

type BusinessBriefingPanelProps = {
  briefing: Tables<"business_briefings"> | null;
  tenantName: string;
  siteName: string;
};

const initialState: BusinessBriefingState = {};

export function BusinessBriefingPanel({
  briefing,
  tenantName,
  siteName,
}: BusinessBriefingPanelProps) {
  const [state, formAction, isPending] = useActionState(
    saveBusinessBriefing,
    initialState,
  );
  const desiredKeywords = useMemo(
    () => stringifyBriefingList(briefing?.desired_keywords),
    [briefing?.desired_keywords],
  );
  const competitors = useMemo(
    () => stringifyBriefingList(briefing?.competitors),
    [briefing?.competitors],
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <form action={formAction} className="dashboard-surface rounded-lg p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Briefing do negocio
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">
            Transforme contexto em direcao editorial.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-black/62">
            Este briefing e o ponto de partida para keywords, temas, plano editorial e
            artigos. Comece simples; a estrategia melhora quando o contexto fica claro.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Nome do negocio
            </span>
            <input
              name="business_name"
              defaultValue={briefing?.business_name ?? tenantName}
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Segmento
              </span>
              <input
                name="segment"
                defaultValue={briefing?.segment ?? ""}
                placeholder="clinica estetica, contabilidade, escola de idiomas"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Localizacao
              </span>
              <input
                name="location"
                defaultValue={briefing?.location ?? ""}
                placeholder="Sao Paulo, Brasil ou atendimento nacional"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Servicos ou produtos
            </span>
            <textarea
              name="offerings"
              rows={4}
              defaultValue={briefing?.offerings ?? ""}
              placeholder="Descreva o que a empresa vende, quais ofertas importam mais e o que precisa aparecer no conteudo."
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Perfil de clientes
            </span>
            <textarea
              name="customer_profile"
              rows={4}
              defaultValue={briefing?.customer_profile ?? ""}
              placeholder="Explique quem compra, principais dores, objecoes e nivel de maturidade."
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Palavras desejadas
              </span>
              <textarea
                name="desired_keywords"
                rows={4}
                defaultValue={desiredKeywords}
                placeholder="Separe por virgula ou linha"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Concorrentes
              </span>
              <textarea
                name="competitors"
                rows={4}
                defaultValue={competitors}
                placeholder="Separe por virgula ou linha"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Por que essas palavras importam?
            </span>
            <textarea
              name="keyword_motivation"
              rows={3}
              defaultValue={briefing?.keyword_motivation ?? ""}
              placeholder="Conte se elas vieram de clientes, vendas, servicos prioritarios ou intuicao do time."
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Observacoes estrategicas
            </span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={briefing?.notes ?? ""}
              placeholder="Inclua restricoes, tom desejado, temas sensiveis ou oportunidades."
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          {state.error ? (
            <p className="border border-[#b3422f]/20 bg-[#b3422f]/8 px-4 py-3 text-sm text-[#b3422f]">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="border border-[#2f6b4f]/20 bg-[#edf7ef] px-4 py-3 text-sm text-[#2f6b4f]">
              {state.success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {isPending ? "Salvando..." : "Salvar briefing"}
          </button>
        </div>
      </form>

      <aside className="dashboard-surface rounded-lg p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Status
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
            {briefing ? "Briefing salvo" : "Briefing pendente"}
          </h3>
          <p className="mt-2 text-sm leading-7 text-black/62">
            Projeto atual: {siteName}
          </p>
        </div>

        <div className="space-y-3 border-t border-black/10 pt-4 text-sm leading-7 text-black/65">
          <p>1. O briefing concentra contexto do negocio.</p>
          <p>2. As keywords continuam em automacao por enquanto.</p>
          <p>3. A proxima etapa conecta este briefing a estrategia.</p>
        </div>

        {briefing?.summary ? (
          <div className="border-t border-black/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Resumo consolidado
            </p>
            <p className="mt-3 text-sm leading-7 text-black/68">{briefing.summary}</p>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
