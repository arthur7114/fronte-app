"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import { saveAccountSettings, type SettingsState } from "@/app/app/configuracoes/actions";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsLogoutButton } from "@/components/settings-logout-button";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { SettingsSubmitButton } from "@/components/settings-submit-button";

type SettingsAccountPanelProps = {
  email: string;
  profile: Tables<"profiles"> | null;
};

const initialState: SettingsState = {};

export function SettingsAccountPanel({ email, profile }: SettingsAccountPanelProps) {
  const [state, formAction, pending] = useActionState(saveAccountSettings, initialState);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <SettingsSectionCard
        eyebrow="Conta"
        title="Identidade da conta"
        description="Edite o nome exibido no sistema e mantenha o acesso principal sempre claro."
      >
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                Email
              </span>
              <input
                value={email}
                readOnly
                className="w-full rounded-[20px] border border-[#1e293b]/10 bg-[#f8fafc] px-4 py-3 text-base text-[#64748b] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                Nome visivel
              </span>
              <input
                name="full_name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
              />
            </label>
          </div>

          <SettingsFeedback state={state} />

          <div className="flex flex-wrap gap-3 pt-1">
            <SettingsSubmitButton
              pending={pending}
              label="Salvar conta"
              pendingLabel="Salvando..."
            />
            <SettingsLogoutButton />
          </div>
        </form>
      </SettingsSectionCard>

      <div className="space-y-4">
        <SettingsSectionCard
          eyebrow="Resumo"
          title="Seu acesso"
          description="Esta area usa o login do Supabase e mostra apenas o que e necessario para operar."
          className="h-full"
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p>O email acima e o mesmo usado para autenticar no produto.</p>
            <p>O nome visivel aparece no cabecalho e em areas internas do painel.</p>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Saida"
          title="Encerrar sessao"
          description="Se precisar trocar de conta, use a saida rapida abaixo."
        >
          <div className="text-sm leading-7 text-[#475569]">
            O logout volta para a tela de entrada sem mexer no workspace atual.
          </div>
        </SettingsSectionCard>
      </div>
    </section>
  );
}

