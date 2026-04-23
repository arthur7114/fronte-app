"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Tables } from "@super/db";
import { APP_DEFAULTS, type AiRuleType } from "@super/shared";
import {
  type SettingsState,
  deleteAiRuleFormAction,
  saveAiRuleAction,
  saveAiSettings,
} from "@/app/app/configuracoes/actions";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { SettingsSubmitButton } from "@/components/settings-submit-button";
import { AI_MODEL_OPTIONS, AI_RULE_TYPE_LABELS } from "@/lib/automation";

type SettingsAiPanelProps = {
  tenantName: string;
  siteSubdomain: string | null;
  aiPreferences: Tables<"ai_preferences"> | null;
  aiRules: Tables<"ai_rules">[];
};

const initialState: SettingsState = {};

function getRule(type: AiRuleType, rules: Tables<"ai_rules">[]) {
  const matches = rules.filter((rule) => rule.rule_type === type);
  return matches[matches.length - 1] ?? null;
}

function getRuleList(type: AiRuleType, rules: Tables<"ai_rules">[]) {
  return rules.filter((rule) => rule.rule_type === type);
}

function AiRuleChip({ rule }: { rule: Tables<"ai_rules"> }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-[20px] border border-[#1e293b]/10 bg-white px-3 py-2 text-sm text-[#1e293b]">
      <span className="min-w-0 flex-1 truncate">{rule.content}</span>
      <form action={deleteAiRuleFormAction}>
        <input type="hidden" name="rule_id" value={rule.id} />
        <input type="hidden" name="rule_type" value="avoid_topic" />
        <button
          type="submit"
          className="rounded-full border border-[#dc2626]/15 bg-[#fff7f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b91c1c] transition hover:-translate-y-0.5"
        >
          Remover
        </button>
      </form>
    </li>
  );
}

function AvoidTopicRulesCard({
  rules,
}: {
  rules: Tables<"ai_rules">[];
}) {
  const [state, formAction, pending] = useActionState(saveAiRuleAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <SettingsSectionCard
      eyebrow="Regras guiadas"
      title="Temas a evitar"
      description="Adicione varios assuntos que devem ser ignorados durante a pesquisa e a escrita."
      className="h-full"
    >
      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="rule_type" value="avoid_topic" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="content"
            placeholder="Ex.: politica partidaria, vagas de emprego, memes"
            className="min-h-12 flex-1 rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
          />
          <SettingsSubmitButton pending={pending} label="Adicionar" pendingLabel="Adicionando..." />
        </div>
        <SettingsFeedback state={state} />
      </form>

      <div className="mt-5 space-y-3">
        {rules.length > 0 ? (
          <ul className="space-y-2">
            {rules.map((rule) => (
              <AiRuleChip key={rule.id} rule={rule} />
            ))}
          </ul>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#1e293b]/12 bg-[#f8fafc] px-4 py-5 text-sm leading-7 text-[#64748b]">
            Nenhuma regra cadastrada ainda. Use o campo acima para bloquear temas.
          </div>
        )}
      </div>
    </SettingsSectionCard>
  );
}

function SingletonRuleCard({
  ruleType,
  title,
  description,
  placeholder,
  currentRule,
}: {
  ruleType: Exclude<AiRuleType, "avoid_topic">;
  title: string;
  description: string;
  placeholder: string;
  currentRule: Tables<"ai_rules"> | null;
}) {
  const [state, formAction, pending] = useActionState(saveAiRuleAction, initialState);

  return (
    <SettingsSectionCard
      eyebrow={AI_RULE_TYPE_LABELS[ruleType]}
      title={title}
      description={description}
    >
      <form key={currentRule?.id ?? `${ruleType}-empty`} action={formAction} className="space-y-4">
        <input type="hidden" name="rule_type" value={ruleType} />
        {currentRule ? <input type="hidden" name="rule_id" value={currentRule.id} /> : null}
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
            Regra
          </span>
          <textarea
            name="content"
            rows={4}
            defaultValue={currentRule?.content ?? ""}
            placeholder={placeholder}
            className="w-full rounded-[22px] border border-[#1e293b]/10 bg-white px-4 py-3 text-sm leading-7 text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
          />
        </label>

        <SettingsFeedback state={state} />

        <div className="flex flex-wrap items-center gap-3">
          <SettingsSubmitButton pending={pending} label="Salvar regra" pendingLabel="Salvando..." />
          <button
            type="submit"
            formAction={deleteAiRuleFormAction}
            disabled={!currentRule}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#1e293b]/12 bg-white px-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#475569] transition duration-200 hover:-translate-y-0.5 hover:border-[#dc2626]/25 hover:text-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remover
          </button>
        </div>
      </form>
    </SettingsSectionCard>
  );
}

export function SettingsAiPanel({
  tenantName,
  siteSubdomain,
  aiPreferences,
  aiRules,
}: SettingsAiPanelProps) {
  const [state, formAction, pending] = useActionState(saveAiSettings, initialState);

  const avoidTopics = getRuleList("avoid_topic", aiRules);
  const toneRule = getRule("tone", aiRules);
  const styleRule = getRule("style", aiRules);
  const structureRule = getRule("structure", aiRules);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <SettingsSectionCard
          eyebrow="IA"
          title="Preferencias editoriais"
          description="Defina o modelo e o jeito de escrever usado pelos prompts do produto."
        >
          <form
            key={aiPreferences?.id ?? "ai-preferences-default"}
            action={formAction}
            className="space-y-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                  Modelo
                </span>
                <select
                  name="model"
                  defaultValue={aiPreferences?.model ?? APP_DEFAULTS.aiModel}
                  className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
                >
                  {AI_MODEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                  Tom de voz
                </span>
                <input
                  name="tone_of_voice"
                  defaultValue={aiPreferences?.tone_of_voice ?? ""}
                  placeholder="Direto, consultivo"
                  className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                  Estilo de escrita
                </span>
                <input
                  name="writing_style"
                  defaultValue={aiPreferences?.writing_style ?? ""}
                  placeholder="Didatico, objetivo"
                  className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]/70">
                  Nivel de profundidade
                </span>
                <input
                  name="expertise_level"
                  defaultValue={aiPreferences?.expertise_level ?? ""}
                  placeholder="Intermediario"
                  className="w-full rounded-[20px] border border-[#1e293b]/10 bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
                />
              </label>
            </div>

            <SettingsFeedback state={state} />

            <SettingsSubmitButton
              pending={pending}
              label="Salvar IA"
              pendingLabel="Salvando..."
            />
          </form>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Guardrails"
          title="Regras guiadas"
          description="Use blocos simples para evitar temas, ajustar tom, estilo e estrutura sem mexer em API keys."
        >
          <div className="grid gap-4">
            <AvoidTopicRulesCard rules={avoidTopics} />
            <SingletonRuleCard
              key={toneRule?.id ?? "tone"}
              ruleType="tone"
              title="Tom"
              description="Uma regra curta para orientar a voz da IA."
              placeholder="Ex.: escrever de forma confiante e direta"
              currentRule={toneRule}
            />
            <SingletonRuleCard
              key={styleRule?.id ?? "style"}
              ruleType="style"
              title="Estilo"
              description="Uma regra curta para definir a cadencia e a forma do texto."
              placeholder="Ex.: frases curtas, exemplos praticos"
              currentRule={styleRule}
            />
            <SingletonRuleCard
              key={structureRule?.id ?? "structure"}
              ruleType="structure"
              title="Estrutura"
              description="Uma regra curta para organizar a saida antes do prompt seguir para o worker."
              placeholder="Ex.: abrir com contexto, depois passos e por fim conclusao"
              currentRule={structureRule}
            />
          </div>
        </SettingsSectionCard>
      </div>

      <div className="space-y-4">
        <SettingsSectionCard
          eyebrow="Runtime"
          title="Execucao ativa"
          description="O provider nao e editavel aqui. O runtime usa a configuracao global do projeto."
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p className="font-semibold text-[#0f172a]">OpenAI via ambiente do projeto</p>
            <p>Modelo atual: {aiPreferences?.model ?? APP_DEFAULTS.aiModel}</p>
            <p>Workspace: {tenantName}</p>
            <p>Site atual: {siteSubdomain ?? "Sem site"}</p>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Uso"
          title="Como isso afeta o produto"
          description="Esses campos alimentam a pesquisa de temas, os briefings e os drafts."
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p>O modelo influencia custo, qualidade e velocidade da geracao.</p>
            <p>As regras guiadas entram nos prompts como guardrails editoriais.</p>
            <p>Remova regras antigas e salve de novo para simplificar a saida.</p>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Notas"
          title="Convencoes do MVP"
          description="A experiencia e operada pela plataforma, sem chave de API do usuario."
        >
          <div className="space-y-3 text-sm leading-7 text-[#475569]">
            <p>Modelos tecnicos disponiveis: gpt-4.1-nano, gpt-4.1-mini, gpt-4.1, gpt-5.4-nano, gpt-5.4-mini e gpt-5.4.</p>
            <p>O padrao inicial do tenant e gpt-5.4-mini.</p>
            <p>Regras de tema podem ter varios itens; tom, estilo e estrutura sao unicas.</p>
          </div>
        </SettingsSectionCard>
      </div>
    </section>
  );
}

