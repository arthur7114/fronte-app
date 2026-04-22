"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import { FREQUENCIES } from "@super/shared";
import {
  saveAutomationConfigSettings,
  type SettingsState,
} from "@/app/app/configuracoes/actions";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { SettingsSubmitButton } from "@/components/settings-submit-button";
import {
  FREQUENCY_LABELS,
  OPERATION_MODE_HELP,
  OPERATION_MODE_LABELS,
  stringifyKeywordsSeed,
} from "@/lib/automation";
import { SITE_LANGUAGE_OPTIONS } from "@/lib/site";

type SettingsAutomationPanelProps = {
  tenantName: string;
  siteSubdomain: string | null;
  automationConfig: Tables<"automation_configs"> | null;
};

const initialState: SettingsState = {};

export function SettingsAutomationPanel({
  tenantName,
  siteSubdomain,
  automationConfig,
}: SettingsAutomationPanelProps) {
  const [state, formAction, pending] = useActionState(
    saveAutomationConfigSettings,
    initialState,
  );
  const [keywordsSeed, setKeywordsSeed] = useState(
    stringifyKeywordsSeed(automationConfig?.keywords_seed),
  );
  const [language, setLanguage] = useState(automationConfig?.language ?? "pt-BR");
  const [frequency, setFrequency] = useState(automationConfig?.frequency ?? "weekly");
  const [operationMode, setOperationMode] = useState(
    (automationConfig?.operation_mode as keyof typeof OPERATION_MODE_LABELS) ?? "assisted",
  );
  const [approvalRequired, setApprovalRequired] = useState(
    automationConfig?.approval_required ?? true,
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <SettingsSectionCard
        eyebrow="Automacao"
        title="Configuracao editorial"
        description="Ajuste seeds, idioma, frequencia e curadoria humana que alimentam os jobs."
      >
        <form action={formAction} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
              Keywords de partida
            </span>
            <textarea
              name="keywords_seed"
              rows={4}
              value={keywordsSeed}
              onChange={(event) => setKeywordsSeed(event.target.value)}
              placeholder="seo local, conteudo evergreen, inbound marketing"
              className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base leading-7 text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
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

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                Frequencia
              </span>
              <select
                name="frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
              >
                {FREQUENCIES.map((option) => (
                  <option key={option} value={option}>
                    {FREQUENCY_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
              Modo operacional
            </span>
            <div className="grid gap-3 md:grid-cols-3">
              {(["manual", "assisted", "automatic"] as const).map((mode) => {
                const active = operationMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setOperationMode(mode)}
                    className={[
                      "rounded-[24px] border px-4 py-4 text-left transition",
                      active
                        ? "border-[#2563eb] bg-[#eff6ff] shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
                        : "border-[#1e293b]/10 bg-white hover:border-[#2563eb]/30",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold text-[#0f172a]">
                      {OPERATION_MODE_LABELS[mode]}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[#475569]">
                      {OPERATION_MODE_HELP[mode]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-[24px] border border-[#1e293b]/10 bg-[#f8fafc] px-4 py-4 text-sm leading-7 text-[#475569]">
            <input
              type="checkbox"
              name="approval_required"
              checked={approvalRequired}
              onChange={(event) => setApprovalRequired(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#1e293b]/20 text-[#f97316] focus:ring-[#f97316]"
            />
            <span>Exigir curadoria humana antes de gerar o briefing.</span>
          </label>

          <input type="hidden" name="operation_mode" value={operationMode} />

          <SettingsFeedback state={state} />

          <SettingsSubmitButton
            pending={pending}
            label="Salvar automacao"
            pendingLabel="Salvando..."
          />
        </form>
      </SettingsSectionCard>

      <div className="space-y-4">
        <SettingsSectionCard
          eyebrow="Runtime"
          title="Como essa tela alimenta os jobs"
          description="A configuracao salva aqui e lida pelo worker durante a pesquisa de temas."
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p>Workspace: <span className="font-semibold text-[#0f172a]">{tenantName}</span></p>
            <p>Site atual: <span className="font-semibold text-[#0f172a]">{siteSubdomain ?? "Sem site"}</span></p>
            <p>A frequencia controla apenas o contexto editorial do produto neste bloco.</p>
            <p>Modo atual: <span className="font-semibold text-[#0f172a]">{OPERATION_MODE_LABELS[operationMode]}</span></p>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Curadoria"
          title="Fluxo humano"
          description="Mesmo com IA ligada, o processo ainda depende de revisao manual entre as etapas."
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p>1. Seeds alimentam a pesquisa de temas.</p>
            <p>2. Topics aprovados seguem para briefing.</p>
            <p>3. Briefings aprovados viram drafts no CMS.</p>
            <p>4. O modo manual libera controle total; o assistido adiciona checkpoints; o autônomo reduz paradas.</p>
          </div>
        </SettingsSectionCard>
      </div>
    </section>
  );
}

