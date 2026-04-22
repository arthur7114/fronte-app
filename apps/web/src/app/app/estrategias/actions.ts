"use server";

import { revalidatePath } from "next/cache";
import type { Tables, TablesInsert, TablesUpdate } from "@super/db";
import { APP_DEFAULTS } from "@super/shared";
import {
  getAiPreferencesForTenant,
  getAutomationConfigForTenant,
  getContentBriefForTenant,
  getTopicCandidateForTenant,
  getKeywordCandidateForTenant,
} from "@/lib/automation-data";
import {
  validateAiPreferencesInput,
  validateAutomationConfigInput,
  validateTopicCandidateInput,
} from "@/lib/automation";
import { requireAutomationWorkspace } from "./data";

export type AutomationSettingsState = {
  error?: string;
  success?: string;
};

export type ResearchTopicsState = {
  error?: string;
  success?: string;
};

export type TopicModerationState = {
  error?: string;
  success?: string;
  topicId?: string;
};

export type BriefDraftState = {
  error?: string;
  success?: string;
  briefId?: string;
};

export type KeywordStrategyState = {
  error?: string;
  success?: string;
};

export type KeywordModerationState = {
  error?: string;
  success?: string;
  keywordId?: string;
};

export type CreateStrategyState = {
  error?: string;
  success?: string;
  strategyId?: string;
};

function mapAiPreferencesSaveError(error: { code?: string; message: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";

  if (error?.code === "42703" || (message.includes("column") && message.includes("model"))) {
    return "A automacao foi salva, mas o banco ainda nao recebeu a migration de IA. Atualize a coluna ai_preferences.model e tente novamente.";
  }

  if (error?.code === "42501" || message.includes("permission denied")) {
    return "A automacao foi salva, mas as preferencias editoriais falharam por permissao insuficiente no banco.";
  }

  if (error?.code === "23502" || message.includes("null value")) {
    return "A automacao foi salva, mas as preferencias editoriais receberam um payload incompleto.";
  }

  return "A automacao foi salva, mas as preferencias editoriais falharam.";
}

function revalidateAutomationPaths(subdomain: string) {
  revalidatePath("/app");
  revalidatePath("/app/artigos");
  revalidatePath("/app/estrategias");
  revalidatePath("/app/estrategias/strategy");
  revalidatePath("/app/estrategias/topics");
  revalidatePath("/app/estrategias/briefs");
  revalidatePath("/app/jobs");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/estrategias");
  revalidatePath("/dashboard/plano");
  revalidatePath("/dashboard/artigos");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/estrategias");
  revalidatePath("/app/plano");
  revalidatePath("/app/artigos");
  revalidatePath(`/blog/${subdomain}`);
}

export async function saveAutomationSettings(
  _prevState: AutomationSettingsState,
  formData: FormData,
): Promise<AutomationSettingsState> {
  const workspace = await requireAutomationWorkspace();
  const configValidation = validateAutomationConfigInput(
    String(formData.get("keywords_seed") ?? ""),
    String(formData.get("language") ?? ""),
    String(formData.get("frequency") ?? ""),
    String(formData.get("operation_mode") ?? ""),
    formData.get("approval_required") === "on",
  );
  const preferencesValidation = validateAiPreferencesInput(
    String(formData.get("tone_of_voice") ?? ""),
    String(formData.get("writing_style") ?? ""),
    String(formData.get("expertise_level") ?? ""),
  );

  if (!configValidation.ok) {
    return { error: configValidation.error };
  }

  if (!preferencesValidation.ok) {
    return { error: preferencesValidation.error };
  }

  const now = new Date().toISOString();
  const [currentConfig, currentPreferences] = await Promise.all([
    getAutomationConfigForTenant(workspace.tenant.id),
    getAiPreferencesForTenant(workspace.tenant.id),
  ]);

  const configResult = currentConfig
    ? ((await workspace.admin
        .from("automation_configs")
        .update({
          ...configValidation.value,
          updated_at: now,
        } satisfies TablesUpdate<"automation_configs">)
        .eq("id", currentConfig.id)
        .eq("tenant_id", workspace.tenant.id)
        .select("*")
        .single()) as {
        data: Tables<"automation_configs"> | null;
        error: { message: string } | null;
      })
    : ((await workspace.admin
        .from("automation_configs")
        .insert({
          tenant_id: workspace.tenant.id,
          ...configValidation.value,
          updated_at: now,
        } satisfies TablesInsert<"automation_configs">)
        .select("*")
        .single()) as {
        data: Tables<"automation_configs"> | null;
        error: { message: string } | null;
      });

  if (configResult.error || !configResult.data) {
    return { error: "Nao foi possivel salvar a configuracao de automacao agora." };
  }

  const preferencesResult = currentPreferences
    ? ((await workspace.admin
        .from("ai_preferences")
        .update({
          ...preferencesValidation.value,
          model:
            preferencesValidation.value.model ?? currentPreferences.model ?? APP_DEFAULTS.aiModel,
          updated_at: now,
        } satisfies TablesUpdate<"ai_preferences">)
        .eq("id", currentPreferences.id)
        .eq("tenant_id", workspace.tenant.id)
        .select("*")
        .single()) as {
        data: Tables<"ai_preferences"> | null;
        error: { code?: string; message: string } | null;
      })
    : ((await workspace.admin
        .from("ai_preferences")
        .insert({
          tenant_id: workspace.tenant.id,
          ...preferencesValidation.value,
          model: preferencesValidation.value.model ?? APP_DEFAULTS.aiModel,
          updated_at: now,
        } satisfies TablesInsert<"ai_preferences">)
        .select("*")
        .single()) as {
        data: Tables<"ai_preferences"> | null;
        error: { code?: string; message: string } | null;
      });

  if (preferencesResult.error || !preferencesResult.data) {
    return { error: mapAiPreferencesSaveError(preferencesResult.error) };
  }

  revalidateAutomationPaths(workspace.site.subdomain);

  return { success: "Configuracao de automacao salva com sucesso." };
}

export async function enqueueTopicResearch(
  _prevState: ResearchTopicsState,
  formData: FormData,
): Promise<ResearchTopicsState> {
  const workspace = await requireAutomationWorkspace();
  const automationConfig = await getAutomationConfigForTenant(workspace.tenant.id);

  if (!automationConfig) {
    return { error: "Salve a configuracao de automacao antes de pesquisar temas." };
  }

  const strategyId = formData.get("strategy_id")?.toString();

  const result = (await workspace.admin
    .from("automation_jobs")
    .insert({
      tenant_id: workspace.tenant.id,
      site_id: workspace.site.id,
      type: "research_topics",
      status: "pending",
      max_attempts: APP_DEFAULTS.maxJobAttempts,
      priority: 10,
      payload_json: {
        tenant_id: workspace.tenant.id,
        site_id: workspace.site.id,
        automation_config_id: automationConfig.id,
        strategy_id: strategyId || null,
      },
    } satisfies TablesInsert<"automation_jobs">)
    .select("id")
    .single()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };

  if (result.error || !result.data) {
    return { error: "Nao foi possivel enfileirar a pesquisa de temas agora." };
  }

  revalidateAutomationPaths(workspace.site.subdomain);

  return { success: "Pesquisa de temas enfileirada. Acompanhe a execucao em Jobs." };
}

export async function enqueueKeywordStrategy(
  _prevState: KeywordStrategyState,
  formData: FormData,
): Promise<KeywordStrategyState> {
  const workspace = await requireAutomationWorkspace();
  const strategyId = String(formData.get("strategy_id") ?? "").trim() || null;

  const result = (await workspace.admin
    .from("automation_jobs")
    .insert({
      tenant_id: workspace.tenant.id,
      site_id: workspace.site.id,
      type: "generate_keyword_strategy",
      status: "pending",
      max_attempts: APP_DEFAULTS.maxJobAttempts,
      priority: 5,
      payload_json: {
        tenant_id: workspace.tenant.id,
        site_id: workspace.site.id,
        strategy_id: strategyId,
      },
    } satisfies TablesInsert<"automation_jobs">)
    .select("id")
    .single()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };

  if (result.error || !result.data) {
    console.error("[enqueueKeywordStrategy] Database error:", result.error);
    return {
      error: `Erro ao enfileirar: ${result.error?.message ?? "Falha desconhecida no banco."}`,
    };
  }

  revalidateAutomationPaths(workspace.site.subdomain);

  return { success: "Geracao de estrategia enfileirada. Acompanhe em Jobs." };
}

export async function moderateTopicCandidate(
  _prevState: TopicModerationState,
  formData: FormData,
): Promise<TopicModerationState> {
  const workspace = await requireAutomationWorkspace();
  const topicId = String(formData.get("topic_id") ?? "");
  const intent = String(formData.get("intent") ?? "");

  if (!topicId) {
    return { error: "Tema invalido.", topicId };
  }

  const topicCandidate = await getTopicCandidateForTenant(workspace.tenant.id, topicId);

  if (!topicCandidate) {
    return { error: "O tema selecionado nao foi encontrado.", topicId };
  }

  if (intent === "approve") {
    const validation = validateTopicCandidateInput(String(formData.get("topic") ?? ""));

    if (!validation.ok) {
      return { error: validation.error, topicId };
    }

    if (topicCandidate.status === "approved" && topicCandidate.topic === validation.value) {
      return { success: "Esse tema ja estava aprovado.", topicId };
    }

    const updateResult = (await workspace.admin
      .from("topic_candidates")
      .update({
        topic: validation.value,
        status: "approved",
      } satisfies TablesUpdate<"topic_candidates">)
      .eq("id", topicId)
      .eq("tenant_id", workspace.tenant.id)
      .select("id")
      .single()) as {
      data: { id: string } | null;
      error: { message: string } | null;
    };

    if (updateResult.error || !updateResult.data) {
      return { error: "Nao foi possivel aprovar esse tema agora.", topicId };
    }

    const jobResult = (await workspace.admin
      .from("automation_jobs")
      .insert({
        tenant_id: workspace.tenant.id,
        site_id: workspace.site.id,
        type: "generate_brief",
        status: "pending",
        max_attempts: APP_DEFAULTS.maxJobAttempts,
        priority: 20,
        payload_json: {
          tenant_id: workspace.tenant.id,
          site_id: workspace.site.id,
          topic_candidate_id: topicId,
        },
      } satisfies TablesInsert<"automation_jobs">)
      .select("id")
      .single()) as {
      data: { id: string } | null;
      error: { message: string } | null;
    };

    if (jobResult.error || !jobResult.data) {
      return { error: "O tema foi aprovado, mas o job de briefing nao foi criado.", topicId };
    }

    revalidateAutomationPaths(workspace.site.subdomain);

    return { success: "Tema aprovado e job de briefing enfileirado.", topicId };
  }

  if (intent === "reject") {
    if (topicCandidate.status === "rejected") {
      return { success: "Esse tema ja estava rejeitado.", topicId };
    }

    const updateResult = (await workspace.admin
      .from("topic_candidates")
      .update({
        status: "rejected",
      } satisfies TablesUpdate<"topic_candidates">)
      .eq("id", topicId)
      .eq("tenant_id", workspace.tenant.id)
      .select("id")
      .single()) as {
      data: { id: string } | null;
      error: { message: string } | null;
    };

    if (updateResult.error || !updateResult.data) {
      return { error: "Nao foi possivel rejeitar esse tema agora.", topicId };
    }

    revalidateAutomationPaths(workspace.site.subdomain);

    return { success: "Tema rejeitado com sucesso.", topicId };
  }

  return { error: "Acao invalida para moderacao de tema.", topicId };
}

export async function moderateKeywordCandidate(
  _prevState: KeywordModerationState,
  formData: FormData,
): Promise<KeywordModerationState> {
  const workspace = await requireAutomationWorkspace();
  const keywordId = String(formData.get("keyword_id") ?? "");
  const intent = String(formData.get("intent") ?? "");

  if (!keywordId) {
    return { error: "ID de palavra-chave invalido.", keywordId };
  }

  const keywordCandidate = await getKeywordCandidateForTenant(workspace.tenant.id, keywordId);

  if (!keywordCandidate) {
    return { error: "A palavra-chave selecionada nao foi encontrada.", keywordId };
  }

  if (intent === "approve") {
    const updateResult = await workspace.admin
      .from("keyword_candidates")
      .update({
        status: "approved",
      } satisfies TablesUpdate<"keyword_candidates">)
      .eq("id", keywordId)
      .eq("tenant_id", workspace.tenant.id)
      .select("id")
      .single();

    if (updateResult.error) {
      return { error: "Nao foi possivel aprovar essa palavra agora.", keywordId };
    }

    revalidateAutomationPaths(workspace.site.subdomain);
    return { success: "Palavra-chave aprovada.", keywordId };
  }

  if (intent === "reject") {
    const updateResult = await workspace.admin
      .from("keyword_candidates")
      .update({
        status: "rejected",
      } satisfies TablesUpdate<"keyword_candidates">)
      .eq("id", keywordId)
      .eq("tenant_id", workspace.tenant.id)
      .select("id")
      .single();

    if (updateResult.error) {
      return { error: "Nao foi possivel rejeitar essa palavra agora.", keywordId };
    }

    revalidateAutomationPaths(workspace.site.subdomain);
    return { success: "Palavra-chave rejeitada.", keywordId };
  }

  return { error: "Acao invalida para moderacao de palavra.", keywordId };
}

export async function enqueueDraftGeneration(
  _prevState: BriefDraftState,
  formData: FormData,
): Promise<BriefDraftState> {
  const workspace = await requireAutomationWorkspace();
  const briefId = String(formData.get("brief_id") ?? "");

  if (!briefId) {
    return { error: "Briefing invalido.", briefId };
  }

  const brief = await getContentBriefForTenant(workspace.tenant.id, briefId);

  if (!brief) {
    return { error: "O briefing selecionado nao foi encontrado.", briefId };
  }

  const result = (await workspace.admin
    .from("automation_jobs")
    .insert({
      tenant_id: workspace.tenant.id,
      site_id: workspace.site.id,
      type: "generate_post",
      status: "pending",
      max_attempts: APP_DEFAULTS.maxJobAttempts,
      priority: 30,
      payload_json: {
        tenant_id: workspace.tenant.id,
        site_id: workspace.site.id,
        content_brief_id: brief.id,
      },
    } satisfies TablesInsert<"automation_jobs">)
    .select("id")
    .single()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };

  if (result.error || !result.data) {
    return { error: "Nao foi possivel enfileirar a geracao do draft agora.", briefId };
  }

  revalidateAutomationPaths(workspace.site.subdomain);

  return { success: "Job de draft enfileirado. Confira o andamento em Jobs.", briefId };
}

export async function createStrategy(
  _prevState: CreateStrategyState,
  formData: FormData,
): Promise<CreateStrategyState> {
  const workspace = await requireAutomationWorkspace();
  const name = String(formData.get("name") ?? "").trim();
  const focus = String(formData.get("focus") ?? "").trim();

  if (!name || name.length < 2) {
    return { error: "O nome da estrategia precisa ter pelo menos 2 caracteres." };
  }

  const now = new Date().toISOString();

  const result = (await workspace.admin
    .from("strategies")
    .insert({
      tenant_id: workspace.tenant.id,
      name,
      focus: focus || null,
      status: "active",
      operation_mode: "manual",
      updated_at: now,
    } satisfies TablesInsert<"strategies">)
    .select("id")
    .single()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };

  if (result.error || !result.data) {
    return { error: `Nao foi possivel criar a estrategia: ${result.error?.message ?? "erro desconhecido"}.` };
  }

  revalidateAutomationPaths(workspace.site.subdomain);

  return { success: "Estrategia criada com sucesso.", strategyId: result.data.id };
}

