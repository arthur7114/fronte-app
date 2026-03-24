"use client";

import { useActionState, useEffect, useState } from "react";
import type { Tables } from "@super/db";
import { upsertSite, type SiteState } from "@/app/app/site/actions";
import {
  normalizeSiteSubdomain,
  SITE_LANGUAGE_OPTIONS,
} from "@/lib/site";

type SiteSetupPanelProps = {
  tenantName: string;
  site: Tables<"sites"> | null;
  flow?: "onboarding" | "settings";
};

const initialState: SiteState = {};

export function SiteSetupPanel({
  tenantName,
  site,
  flow = "settings",
}: SiteSetupPanelProps) {
  const [state, formAction, isPending] = useActionState(upsertSite, initialState);
  const [name, setName] = useState(site?.name ?? "");
  const [language, setLanguage] = useState(site?.language ?? "pt-BR");
  const [subdomain, setSubdomain] = useState(site?.subdomain ?? "");
  const [subdomainTouched, setSubdomainTouched] = useState(Boolean(site?.subdomain));

  useEffect(() => {
    if (!subdomainTouched) {
      setSubdomain(normalizeSiteSubdomain(name));
    }
  }, [name, subdomainTouched]);

  return (
    <section className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.88fr]">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="flow" value={flow} />
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Site
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">
              {site ? "Ajuste o site atual." : "Configure o primeiro site."}
            </h2>
            <p className="max-w-xl text-sm leading-7 text-black/62">
              Este bloco organiza o nome, o idioma e o subdominio do blog antes de
              qualquer personalizacao visual mais profunda.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Nome do site
            </span>
            <input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Super MVP"
              className="w-full border border-black/15 bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-black focus:shadow-[0_0_0_4px_rgba(17,17,17,0.06)]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Idioma
              </span>
              <select
                name="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full border border-black/15 bg-white px-4 py-4 text-base outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(17,17,17,0.06)]"
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
                Subdominio
              </span>
              <input
                name="subdomain"
                value={subdomain}
                onChange={(event) => {
                  setSubdomainTouched(true);
                  setSubdomain(normalizeSiteSubdomain(event.target.value));
                }}
                placeholder="super-mvp"
                className="w-full border border-black/15 bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-black focus:shadow-[0_0_0_4px_rgba(17,17,17,0.06)]"
              />
            </label>
          </div>

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

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center border border-black bg-black px-5 text-sm font-semibold uppercase tracking-[0.24em] text-white transition duration-200 hover:-translate-y-0.5"
            >
              {isPending
                ? "Salvando..."
                : flow === "onboarding"
                  ? "Criar site e entrar"
                  : site
                    ? "Salvar site"
                    : "Criar site"}
            </button>
          </div>
        </form>

        <aside className="space-y-4 border border-black/10 bg-[#fbf7f1] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Pre-visualizacao
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
              {name}
            </h3>
            <p className="mt-2 text-sm leading-7 text-black/62">
              Tenant: {tenantName}
            </p>
          </div>

          <div className="space-y-3 text-sm leading-7 text-black/65">
            <div className="border-t border-black/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Rotas
              </p>
              <p className="mt-2">Blog publico: /blog/{subdomain}</p>
              <p>Idioma: {language}</p>
            </div>
            <div className="border-t border-black/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                Estado
              </p>
              <p className="mt-2">
                O layout ja fica pronto para conectar temas, posts e publicacao.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
