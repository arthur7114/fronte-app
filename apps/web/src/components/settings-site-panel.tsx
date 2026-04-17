"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import { saveSiteSettings, type SettingsState } from "@/app/app/configuracoes/actions";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { SettingsSubmitButton } from "@/components/settings-submit-button";
import {
  DEFAULT_SITE_THEME_ID,
  normalizeSiteSubdomain,
  SITE_LANGUAGE_OPTIONS,
} from "@/lib/site";

type SettingsSitePanelProps = {
  tenantName: string;
  site: Tables<"sites"> | null;
};

const initialState: SettingsState = {};

export function SettingsSitePanel({ tenantName, site }: SettingsSitePanelProps) {
  const [state, formAction, pending] = useActionState(saveSiteSettings, initialState);
  const [name, setName] = useState(site?.name ?? tenantName);
  const [language, setLanguage] = useState(site?.language ?? "pt-BR");
  const [subdomain, setSubdomain] = useState(site?.subdomain ?? "");

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <SettingsSectionCard
        eyebrow="Site"
        title={site ? "Ajuste o blog atual" : "Configure o primeiro site"}
        description="Nome, idioma e subdominio definem a entrada publica do blog e o contexto do CMS."
      >
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                Nome do site
              </span>
              <input
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Super MVP"
                className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                Idioma
              </span>
              <select
                name="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
              >
                {SITE_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
              Subdominio
            </span>
            <input
              name="subdomain"
              value={subdomain}
              onChange={(event) => setSubdomain(normalizeSiteSubdomain(event.target.value))}
              placeholder="super-mvp"
              className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
            />
          </label>

          <SettingsFeedback state={state} />

          <SettingsSubmitButton
            pending={pending}
            label={site ? "Salvar site" : "Criar site"}
            pendingLabel={site ? "Salvando..." : "Criando..."}
          />
        </form>
      </SettingsSectionCard>

      <div className="space-y-4">
        <SettingsSectionCard
          eyebrow="Publico"
          title="Rota do blog"
          description="O caminho publico fica pronto para abrir o blog sem depender de tema."
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p>
              Blog publico:{" "}
              <span className="font-semibold text-[#0f172a]">/blog/{subdomain || "slug"}</span>
            </p>
            <p>
              O site atual usa o tema padrao{" "}
              <span className="font-semibold text-[#0f172a]">{DEFAULT_SITE_THEME_ID}</span>.
            </p>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Contexto"
          title="Situacao atual"
          description="Esta area pode criar ou atualizar o site sem mudar o fluxo de posts."
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p>
              Workspace: <span className="font-semibold text-[#0f172a]">{tenantName}</span>
            </p>
            <p>
              Idioma escolhido: <span className="font-semibold text-[#0f172a]">{language}</span>
            </p>
            <p>O formulario valida o subdominio antes de enviar para o banco.</p>
          </div>
        </SettingsSectionCard>
      </div>
    </section>
  );
}

