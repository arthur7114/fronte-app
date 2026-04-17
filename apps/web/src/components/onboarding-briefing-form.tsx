"use client";

import { useActionState, useState } from "react";
import { saveOnboardingBriefing, type OnboardingState } from "@/app/onboarding/actions";

type OnboardingBriefingFormProps = {
  tenantName: string;
  siteName: string;
};

const initialState: OnboardingState = {};

export function OnboardingBriefingForm({
  tenantName,
  siteName,
}: OnboardingBriefingFormProps) {
  const [state, formAction, isPending] = useActionState(saveOnboardingBriefing, initialState);
  const [businessName, setBusinessName] = useState(tenantName);
  const [segment, setSegment] = useState("");
  const [offerings, setOfferings] = useState("");
  const [customerProfile, setCustomerProfile] = useState("");
  const [location, setLocation] = useState("");
  const [desiredKeywords, setDesiredKeywords] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [keywordMotivation, setKeywordMotivation] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <section className="dashboard-surface rounded-lg p-6 sm:p-8">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <form action={formAction} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Etapa 3 de 3
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
              Explique a intencao do negocio.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">
              O briefing guia keywords, temas, artigos e o restante da experiencia. Onde o
              prototipo nao detalha comportamento interno, esta etapa completa o contexto com
              dados reais.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Nome do negocio
              </span>
              <input
                name="business_name"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Segmento
              </span>
              <input
                name="segment"
                value={segment}
                onChange={(event) => setSegment(event.target.value)}
                placeholder="Ex.: Clinica odontologica, SaaS B2B, e-commerce"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              O que voce vende
            </span>
            <textarea
              name="offerings"
              rows={4}
              value={offerings}
              onChange={(event) => setOfferings(event.target.value)}
              placeholder="Descreva servicos, produtos, ticket, prioridades comerciais e foco principal."
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Cliente ideal
            </span>
            <textarea
              name="customer_profile"
              rows={4}
              value={customerProfile}
              onChange={(event) => setCustomerProfile(event.target.value)}
              placeholder="Explique quem compra, quais dores aparecem e como o negocio resolve isso."
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Localizacao
              </span>
              <input
                name="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Cidade, regiao ou abrangencia"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Site atual
              </span>
              <input
                value={siteName}
                readOnly
                className="w-full rounded-lg border border-border bg-[#f8fafc] px-4 py-4 text-base text-black/55 outline-none"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Keywords iniciais
              </span>
              <textarea
                name="desired_keywords"
                rows={4}
                value={desiredKeywords}
                onChange={(event) => setDesiredKeywords(event.target.value)}
                placeholder="seo local, dor no joelho, automacao de marketing"
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
                value={competitors}
                onChange={(event) => setCompetitors(event.target.value)}
                placeholder="dominio-a.com, dominio-b.com"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Motivacao das keywords
            </span>
            <textarea
              name="keyword_motivation"
              rows={3}
              value={keywordMotivation}
              onChange={(event) => setKeywordMotivation(event.target.value)}
              placeholder="Explique por que essas buscas importam para o negocio."
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Notas adicionais
            </span>
            <textarea
              name="notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Preferencias editoriais, restricoes ou observacoes internas."
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          {state.error ? (
            <p className="border border-[#b3422f]/20 bg-[#b3422f]/8 px-4 py-3 text-sm text-[#b3422f]">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {isPending ? "Finalizando..." : "Concluir onboarding"}
          </button>
        </form>

        <div className="rounded-lg border border-border bg-secondary/35 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            O que esta etapa define
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-black/68">
            <li>Intencao editorial do produto.</li>
            <li>Prioridade de temas e palavras para pesquisa.</li>
            <li>Contexto minimo para a IA operar sem distorcer o prototipo.</li>
          </ul>
          <div className="mt-6 border-t border-black/10 pt-4 text-sm text-black/52">
            Ao concluir, o produto entra no dashboard canônico com dados reais quando houver e
            estados vazios quando ainda nao houver integracao.
          </div>
        </div>
      </div>
    </section>
  );
}
