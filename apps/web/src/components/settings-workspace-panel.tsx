"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import {
  saveWorkspaceSettings,
  type SettingsState,
} from "@/app/app/settings/actions";
import { normalizeWorkspaceSlug } from "@/app/app/settings/validation";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { SettingsSubmitButton } from "@/components/settings-submit-button";

type SettingsWorkspacePanelProps = {
  tenant: Tables<"tenants">;
};

const initialState: SettingsState = {};

export function SettingsWorkspacePanel({ tenant }: SettingsWorkspacePanelProps) {
  const [state, formAction, pending] = useActionState(saveWorkspaceSettings, initialState);
  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <SettingsSectionCard
        eyebrow="Workspace"
        title="Identidade do tenant"
        description="Atualize o nome e o slug do espaco que organiza blog, posts e automacao."
      >
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                Nome do workspace
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
                Slug interno
              </span>
              <input
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlug(normalizeWorkspaceSlug(event.target.value));
                }}
                placeholder="super-mvp"
                className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
              />
            </label>
          </div>

          <SettingsFeedback state={state} />

          <SettingsSubmitButton
            pending={pending}
            label="Salvar workspace"
            pendingLabel="Salvando..."
          />
        </form>
      </SettingsSectionCard>

      <div className="space-y-4">
        <SettingsSectionCard
          eyebrow="Uso"
          title="Como o slug aparece"
          description="O slug identifica o workspace em telas internas e precisa ser unico."
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p>Slug atual: <span className="font-semibold text-[#0f172a]">{tenant.slug}</span></p>
            <p>Esse valor nao muda a URL publica do blog, mas organiza o contexto interno do painel.</p>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Dica"
          title="Padrao de nome"
          description="Use um nome curto, reconhecivel e consistente com a marca principal."
        >
          <div className="text-sm leading-7 text-[#475569]">
            O painel esta pronto para varios blocos de conteudo, entao a leitura rapida do
            workspace ajuda na operacao do dia a dia.
          </div>
        </SettingsSectionCard>
      </div>
    </section>
  );
}
