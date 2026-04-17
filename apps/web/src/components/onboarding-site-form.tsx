"use client";

import { useActionState, useState } from "react";
import { createOnboardingSite, type OnboardingState } from "@/app/onboarding/actions";
import { SITE_LANGUAGE_OPTIONS, normalizeSiteSubdomain } from "@/lib/site";

type OnboardingSiteFormProps = {
  tenantName: string;
};

const initialState: OnboardingState = {};

export function OnboardingSiteForm({ tenantName }: OnboardingSiteFormProps) {
  const [state, formAction, isPending] = useActionState(createOnboardingSite, initialState);
  const [name, setName] = useState(tenantName);
  const [subdomain, setSubdomain] = useState("");
  const [language, setLanguage] = useState("pt-BR");

  return (
    <section className="dashboard-surface rounded-lg p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Etapa 2 de 3
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
              Defina o primeiro site.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-black/62">
              O site conecta publicacao, blog e conteudo. Esta etapa cria a base publica do
              produto sem depender da arquitetura antiga.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Nome do site
              </span>
              <input
                name="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Blog da marca"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Idioma
                </span>
                <select
                  name="language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
                >
                  {SITE_LANGUAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Subdominio inicial
                </span>
                <div className="flex items-center rounded-lg border border-border bg-white px-4 py-1 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]">
                  <input
                    name="subdomain"
                    type="text"
                    required
                    value={subdomain}
                    onChange={(event) => setSubdomain(normalizeSiteSubdomain(event.target.value))}
                    placeholder="minha-marca"
                    className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-black/30"
                  />
                  <span className="text-sm text-black/45">.antigravity.blog</span>
                </div>
              </label>
            </div>

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
              {isPending ? "Criando site..." : "Salvar e seguir"}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-secondary/35 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            O que entra aqui
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-black/68">
            <li>Nome editorial do blog.</li>
            <li>Idioma padrao da operacao.</li>
            <li>Subdominio inicial para preview e publicacao.</li>
          </ul>
          <div className="mt-6 border-t border-black/10 pt-4 text-sm text-black/52">
            Branding detalhado fica para a fase seguinte. Aqui entra a estrutura real do produto.
          </div>
        </div>
      </div>
    </section>
  );
}
