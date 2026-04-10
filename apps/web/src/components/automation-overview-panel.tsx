"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import { FREQUENCIES } from "@super/shared";
import {
  enqueueTopicResearch,
  saveAutomationSettings,
  type AutomationSettingsState,
  type ResearchTopicsState,
} from "@/app/app/automation/actions";
import {
  FREQUENCY_LABELS,
  stringifyKeywordsSeed,
} from "@/lib/automation";
import { SITE_LANGUAGE_OPTIONS } from "@/lib/site";

type AutomationOverviewPanelProps = {
  tenantName: string;
  site: Tables<"sites">;
  automationConfig: Tables<"automation_configs"> | null;
  aiPreferences: Tables<"ai_preferences"> | null;
  topics: Tables<"topic_candidates">[];
  briefs: Tables<"content_briefs">[];
  jobs: Tables<"automation_jobs">[];
};

const initialSettingsState: AutomationSettingsState = {};
const initialResearchState: ResearchTopicsState = {};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AutomationOverviewPanel({
  tenantName,
  site,
  automationConfig,
  aiPreferences,
  topics,
  briefs,
  jobs,
}: AutomationOverviewPanelProps) {
  const [settingsState, settingsFormAction, isSavingSettings] = useActionState(
    saveAutomationSettings,
    initialSettingsState,
  );
  const [researchState, researchFormAction, isResearchPending] = useActionState(
    enqueueTopicResearch,
    initialResearchState,
  );
  const [keywordsSeed, setKeywordsSeed] = useState(
    stringifyKeywordsSeed(automationConfig?.keywords_seed),
  );
  const [language, setLanguage] = useState(automationConfig?.language ?? site.language);
  const [frequency, setFrequency] = useState(automationConfig?.frequency ?? "weekly");
  const [approvalRequired, setApprovalRequired] = useState(
    automationConfig?.approval_required ?? true,
  );
  const [toneOfVoice, setToneOfVoice] = useState(aiPreferences?.tone_of_voice ?? "");
  const [writingStyle, setWritingStyle] = useState(aiPreferences?.writing_style ?? "");
  const [expertiseLevel, setExpertiseLevel] = useState(aiPreferences?.expertise_level ?? "");

  const pendingTopics = topics.filter((topic) => topic.status === "pending").length;
  const approvedTopics = topics.filter((topic) => topic.status === "approved").length;
  const pendingJobs = jobs.filter(
    (job) => job.status === "pending" || job.status === "running",
  ).length;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <form action={settingsFormAction} className="dashboard-surface rounded-lg p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Configuracao da automacao
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">
            Defina o briefing editorial que alimenta o worker.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-black/62">
            Este formulario salva a configuracao do tenant e as preferencias de escrita
            usadas nas etapas de tema, briefing e draft.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Keywords de partida
            </span>
            <textarea
              name="keywords_seed"
              rows={4}
              value={keywordsSeed}
              onChange={(event) => setKeywordsSeed(event.target.value)}
              placeholder="seo local, conteudo evergreen, inbound marketing"
              className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
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
                Frequencia
              </span>
              <select
                name="frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              >
                {FREQUENCIES.map((option) => (
                  <option key={option} value={option}>
                    {FREQUENCY_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/35 px-4 py-4 text-sm leading-7 text-black/65">
            <input
              type="checkbox"
              name="approval_required"
              checked={approvalRequired}
              onChange={(event) => setApprovalRequired(event.target.checked)}
              className="mt-1 h-4 w-4 border-black/20"
            />
            <span>
              Exigir curadoria humana antes de gerar o briefing.
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Tom de voz
              </span>
              <input
                name="tone_of_voice"
                value={toneOfVoice}
                onChange={(event) => setToneOfVoice(event.target.value)}
                placeholder="Direto, consultivo"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Estilo de escrita
              </span>
              <input
                name="writing_style"
                value={writingStyle}
                onChange={(event) => setWritingStyle(event.target.value)}
                placeholder="Didatico, objetivo"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Nivel de profundidade
              </span>
              <input
                name="expertise_level"
                value={expertiseLevel}
                onChange={(event) => setExpertiseLevel(event.target.value)}
                placeholder="Intermediario"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>
          </div>

          {settingsState.error ? (
            <p className="border border-[#b3422f]/20 bg-[#b3422f]/8 px-4 py-3 text-sm text-[#b3422f]">
              {settingsState.error}
            </p>
          ) : null}
          {settingsState.success ? (
            <p className="border border-[#2f6b4f]/20 bg-[#edf7ef] px-4 py-3 text-sm text-[#2f6b4f]">
              {settingsState.success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSavingSettings}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {isSavingSettings ? "Salvando..." : "Salvar configuracao"}
          </button>
        </div>
      </form>

      <aside className="dashboard-surface rounded-lg p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Runtime
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
            {tenantName} / {site.subdomain}
          </h3>
          <p className="mt-2 text-sm leading-7 text-black/62">
            OpenAI via ambiente do projeto. O fluxo continua com curadoria humana entre
            tema, briefing e draft.
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="border border-black/10 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Topics pendentes
            </p>
            <p className="mt-2 text-lg font-medium text-black">{pendingTopics}</p>
          </div>
          <div className="border border-black/10 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Topics aprovados
            </p>
            <p className="mt-2 text-lg font-medium text-black">{approvedTopics}</p>
          </div>
          <div className="border border-black/10 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Jobs em andamento
            </p>
            <p className="mt-2 text-lg font-medium text-black">{pendingJobs}</p>
          </div>
          <div className="border border-black/10 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Ultima atualizacao
            </p>
            <p className="mt-2 text-sm leading-7 text-black/65">
              {formatDateTime(jobs[0]?.updated_at ?? null)}
            </p>
          </div>
        </div>

        <form action={researchFormAction} className="space-y-3 border-t border-black/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Gatilho manual
          </p>
          <p className="text-sm leading-7 text-black/62">
            Depois de salvar a configuracao, enfileire a pesquisa de temas para o worker
            criar novos topic candidates.
          </p>

          {researchState.error ? (
            <p className="border border-[#b3422f]/20 bg-[#b3422f]/8 px-4 py-3 text-sm text-[#b3422f]">
              {researchState.error}
            </p>
          ) : null}
          {researchState.success ? (
            <p className="border border-[#2f6b4f]/20 bg-[#edf7ef] px-4 py-3 text-sm text-[#2f6b4f]">
              {researchState.success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isResearchPending}
            className="inline-flex h-11 items-center justify-center border border-black bg-[#8f4b0d] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {isResearchPending ? "Enfileirando..." : "Pesquisar temas"}
          </button>
        </form>

        <div className="space-y-3 border-t border-black/10 pt-4 text-sm leading-7 text-black/65">
          <p>Briefs gerados: {briefs.length}</p>
          <p>Idioma do site: {site.language}</p>
          <p>Frequencia atual: {FREQUENCY_LABELS[(frequency || "weekly") as keyof typeof FREQUENCY_LABELS]}</p>
        </div>
      </aside>
    </section>
  );
}
