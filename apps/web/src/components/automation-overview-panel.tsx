"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import { FREQUENCIES } from "@super/shared";
import {
  enqueueTopicResearch,
  saveAutomationSettings,
  type AutomationSettingsState,
  type ResearchTopicsState,
} from "@/app/app/estrategias/actions";
import {
  FREQUENCY_LABELS,
  stringifyKeywordsSeed,
} from "@/lib/automation";
import { SITE_LANGUAGE_OPTIONS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { 
  Settings2, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Play, 
  Clock,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";

type AutomationOverviewPanelProps = {
  tenantName: string;
  site: Tables<"sites">;
  automationConfig: Tables<"automation_configs"> | null;
  aiPreferences: Tables<"ai_preferences"> | null;
  topics: Tables<"topic_candidates">[];
  keywords: Tables<"keyword_candidates">[];
  briefs: Tables<"content_briefs">[];
  jobs: Tables<"automation_jobs">[];
  posts: Tables<"posts">[];
  strategyId?: string;
};

function ProductionPipeline({ 
  keywords, 
  topics, 
  briefs, 
  posts 
}: { 
  keywords: number; 
  topics: number; 
  briefs: number; 
  posts: number; 
}) {
  const stages = [
    { label: "Keywords", count: keywords, icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Temas", count: topics, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Produção", count: posts, icon: LayoutDashboard, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 py-8">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center gap-4">
          <div className={cn("flex flex-col items-center gap-2 rounded-2xl border border-black/5 p-4 min-w-[100px] transition-all hover:border-black/10 hover:shadow-sm bg-white")}>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stage.bg, stage.color)}>
              <stage.icon className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">{stage.label}</p>
              <p className="text-xl font-semibold text-black">{stage.count}</p>
            </div>
          </div>
          {i < stages.length - 1 && (
            <ArrowRight className="h-4 w-4 text-black/10 hidden sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}

const initialSettingsState: AutomationSettingsState = {};
const initialResearchState: ResearchTopicsState = {};

export function AutomationOverviewPanel({
  tenantName,
  site,
  automationConfig,
  aiPreferences,
  topics,
  keywords,
  briefs,
  jobs,
  posts,
  strategyId,
}: AutomationOverviewPanelProps) {
  const [showSettings, setShowSettings] = useState(false);
  
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

  // Stats & Logic
  const approvedKeywords = keywords.filter((k) => k.status === "approved").length;
  const pendingTopics = topics.filter((t) => t.status === "pending").length;
  const approvedBriefs = briefs.filter((b) => b.status === "approved");
  const briefsToDraft = approvedBriefs;

  const pendingJobs = jobs.filter(
    (job) => job.status === "pending" || job.status === "running",
  ).length;

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* PAINEL ESQUERDO: PLANO EDITORIAL */}
      <div className="dashboard-surface relative overflow-hidden rounded-2xl p-6 sm:p-10">
        <div className="absolute top-0 right-0 p-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200",
              showSettings 
                ? "bg-black text-white border-black" 
                : "bg-white text-black border-black/10 hover:border-black/30 shadow-sm"
            )}
            title={showSettings ? "Ver Resumo do Plano" : "Editar Diretrizes"}
          >
            <Settings2 className="h-5 w-5" />
          </button>
        </div>

        {!showSettings ? (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                <LayoutDashboard className="h-3 w-3" />
                Estratégia Ativa
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-black">
                Plano Editorial {tenantName}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-black/50">
                Diretrizes de inteligência configuradas para garantir que cada artigo
                reforce o posicionamento e autoridade da marca.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="text-left rounded-xl border border-black/5 bg-black/[0.02] p-5 transition-hover hover:border-primary/20 hover:bg-primary/[0.02] group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Frequência</p>
                  <ArrowRight className="h-3 w-3 text-black/0 transition-all group-hover:text-primary group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-xl font-medium text-black">
                   {automationConfig ? FREQUENCY_LABELS[automationConfig.frequency as keyof typeof FREQUENCY_LABELS] : "Não definida"}
                </p>
              </button>
              
              <button 
                onClick={() => setShowSettings(true)}
                className="text-left rounded-xl border border-black/5 bg-black/[0.02] p-5 transition-hover hover:border-primary/20 hover:bg-primary/[0.02] group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Tom de Voz</p>
                  <ArrowRight className="h-3 w-3 text-black/0 transition-all group-hover:text-primary group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-xl font-medium text-black">
                  {aiPreferences?.tone_of_voice || "Padrão (Consultivo)"}
                </p>
              </button>

              <button 
                onClick={() => setShowSettings(true)}
                className="text-left rounded-xl border border-black/5 bg-black/[0.02] p-5 transition-hover hover:border-primary/20 hover:bg-primary/[0.02] group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Idioma</p>
                  <ArrowRight className="h-3 w-3 text-black/0 transition-all group-hover:text-primary group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-xl font-medium text-black uppercase">
                  {automationConfig?.language || "PT-BR"}
                </p>
              </button>

              <button 
                onClick={() => setShowSettings(true)}
                className="text-left rounded-xl border border-black/5 bg-black/[0.02] p-5 transition-hover hover:border-primary/20 hover:bg-primary/[0.02] group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Estilo Literário</p>
                  <ArrowRight className="h-3 w-3 text-black/0 transition-all group-hover:text-primary group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-xl font-medium text-black">
                  {aiPreferences?.writing_style || "Focado em Valor"}
                </p>
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  automationConfig?.keywords_seed ? "bg-green-500 animate-pulse" : "bg-red-500"
                )} />
                <span className="text-xs font-semibold text-black/60">
                  {automationConfig?.keywords_seed ? "Motor Operacional" : "Motor Desligado"}
                </span>
              </div>
              <span className="text-black/10">|</span>
              <button 
                onClick={() => setShowSettings(true)}
                className="text-xs font-bold text-black underline-offset-4 hover:underline"
              >
                Configurar Diretrizes
              </button>
            </div>

            {/* PIPELINE VISUAL */}
            {automationConfig?.keywords_seed && (
              <div className="pt-6 border-t border-black/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2">Estado Colheita</p>
                <ProductionPipeline 
                  keywords={approvedKeywords}
                  topics={topics.length}
                  briefs={briefs.length}
                  posts={posts.length}
                />
              </div>
            )}
          </div>
        ) : (
          <form action={settingsFormAction} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Configurações da Estratégia</h2>
              <p className="mt-1 text-sm text-black/50">Ajuste as diretrizes que alimentam a inteligência desta estratégia.</p>
            </div>
            
            <div className="space-y-6">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Keywords de partida (Seeds)
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
                    Frequencia de Publicacao
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
                    Profundidade
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
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {settingsState.error}
                </p>
              ) : null}
              {settingsState.success ? (
                <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  {settingsState.success}
                </p>
              ) : null}

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-black px-8 text-sm font-bold uppercase tracking-[0.15em] text-white transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
                >
                  {isSavingSettings ? "Salvando..." : "Salvar Plano"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="text-xs font-bold text-black/40 hover:text-black"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* PAINEL DIREITO: MOTOR DE PRODUÃ‡ÒO */}
      <aside className="flex flex-col rounded-2xl border border-black/5 bg-white p-6 sm:p-10 shadow-sm transition-all hover:shadow-md">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Estratégia
            </p>
            {pendingJobs > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600">
                <Clock className="h-3 w-3 animate-spin" />
                {pendingJobs} EM FILA
              </div>
            )}
          </div>
          
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
            Próximos Passos
          </h3>
          
          <div className="mt-10 space-y-8">
            {/* ETAPA 1: ESTRATÃ‰GIA */}
            <div className="group flex items-start gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5 text-black transition-colors group-hover:bg-primary group-hover:text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-black">Keywords & Intenção</p>
                  <span className="text-[10px] font-bold text-black/30">{approvedKeywords} APROVADAS</span>
                </div>
                <p className="text-xs leading-relaxed text-black/50">O combustível principal. Determine o que o Google deve entender desta estratégia.</p>
                <Link href={`/app/estrategias/${strategyId}/keywords`} className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                  Gerenciar Keywords <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* ETAPA 2: TEMAS */}
            <div className="group flex items-start gap-5">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                pendingTopics > 0 ? "bg-blue-100 text-blue-600" : "bg-black/5 text-black group-hover:bg-primary group-hover:text-white"
              )}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-black">Temas & Estrutura</p>
                  {pendingTopics > 0 && <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-widest">{pendingTopics} NOVOS</span>}
                </div>
                <p className="text-xs leading-relaxed text-black/50">Transformamos keywords em ângulos de ataque e planos de conteúdo.</p>
                <Link href={`/app/estrategias/${strategyId}/temas`} className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                  Curadoria de Temas <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* ETAPA 3: PRODUÃ‡ÒO */}
            <div className="group flex items-start gap-5">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                briefsToDraft.length > 0 ? "bg-orange-100 text-orange-600" : "bg-black/5 text-black group-hover:bg-primary group-hover:text-white"
              )}>
                <Play className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-black">Produção de Artigos</p>
                  {briefsToDraft.length > 0 && <span className="text-[10px] font-bold text-orange-600 tracking-widest">{briefsToDraft.length} PRONTOS</span>}
                </div>
                <p className="text-xs leading-relaxed text-black/50">O estágio final. Onde os briefings ganham vida como rascunhos de alta performance.</p>
                <Link href="/app/artigos" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                  Ver Artigos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CARTA DE AÃ‡ÒO SUGERIDA - O "CORAÃ‡ÒO" DA UX */}
        <div className="mt-12 rounded-3xl bg-black p-8 text-white shadow-2xl shadow-black/20 ring-1 ring-white/10 relative overflow-hidden">
          {/* Background Detail */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Sugestão da IA
            </div>

            <div className="mt-6">
              {!automationConfig?.keywords_seed ? (
                <div className="space-y-5">
                  <h4 className="text-2xl font-semibold tracking-tight">Comece sua Estratégia</h4>
                  <p className="text-sm leading-relaxed text-white/60">
                    O motor precisa de "combustível" inicial. Defina suas palavras-chave semente para que a IA possa mapear o seu mercado.
                  </p>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Configurar Agora <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : approvedKeywords === 0 && keywords.length > 0 ? (
                <div className="space-y-5">
                  <h4 className="text-2xl font-semibold tracking-tight">Curadoria Necessária</h4>
                  <p className="text-sm leading-relaxed text-white/60">
                    Sua estratégia foi gerada! No entanto, nenhuma palavra foi aprovada. Revise as sugestões para ativar o plano editorial.
                  </p>
                  <Link href="/app/estrategias/strategy" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-95">
                    Revisar Keywords <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : approvedKeywords === 0 ? (
                 <div className="space-y-5">
                   <h4 className="text-2xl font-semibold tracking-tight">Nenhuma Keyword Ativa</h4>
                   <p className="text-sm leading-relaxed text-white/60">
                     O motor editorial está em espera. Gere sua primeira estratégia de keywords baseada no seu plano de negócio.
                   </p>
                   <Link href="/app/estrategias/strategy" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-95">
                     Gerar Estratégia <ArrowRight className="h-4 w-4" />
                   </Link>
                 </div>
              ) : approvedKeywords > 0 && topics.length === 0 ? (
                <div className="space-y-5">
                  <h4 className="text-2xl font-semibold tracking-tight">Gerar Temas Agora</h4>
                  <p className="text-sm leading-relaxed text-white/60">
                    Você tem **{approvedKeywords} keywords** aprovadas. O próximo passo é converter essa estratégia em temas de conteúdo.
                  </p>
                  <form action={researchFormAction}>
                    <input type="hidden" name="strategy_id" value={strategyId} />
                    <button
                      type="submit"
                      disabled={isResearchPending}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {isResearchPending ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        "Gerar Temas (IA)"
                      )}
                    </button>
                  </form>
                </div>
              ) : pendingTopics > 0 ? (
                <div className="space-y-5">
                  <h4 className="text-2xl font-semibold tracking-tight">Novas Oportunidades</h4>
                  <p className="text-sm leading-relaxed text-white/60">
                    Identificamos **{pendingTopics} temas** com alto potencial de ROI. Aprove estes temas para transformá-los em briefings.
                  </p>
                  <Link href="/app/estrategias/topics" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-95">
                    Ver Temas Sugeridos <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : briefsToDraft.length > 0 ? (
                <div className="space-y-5">
                  <h4 className="text-2xl font-semibold tracking-tight">Pronto para Produção</h4>
                  <p className="text-sm leading-relaxed text-white/60">
                    {briefsToDraft.length} briefings estão validados. O rascunho de alta performance pode ser gerado agora.
                  </p>
                  <Link href="/app/estrategias/briefs" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#12b3a6] px-6 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95">
                    Iniciar Redação IA <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  <h4 className="text-2xl font-semibold tracking-tight">Motor em Ordem</h4>
                  <p className="text-sm leading-relaxed text-white/60">
                    Tudo atualizado! Deseja que a IA explore **novas oportunidades** e tendências para sua estratégia agora?
                  </p>
                  <form action={researchFormAction}>
                    <input type="hidden" name="strategy_id" value={strategyId} />
                    <button
                      type="submit"
                      disabled={isResearchPending}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white/10 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white border border-white/20 transition-all hover:bg-white/20 active:scale-95 disabled:opacity-50"
                    >
                      {isResearchPending ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        "Explorar Oportunidades"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {researchState.error && (
                <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-[11px] font-medium text-red-400 border border-red-500/20">
                  {researchState.error}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

