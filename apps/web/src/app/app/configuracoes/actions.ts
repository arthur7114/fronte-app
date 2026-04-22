"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables, TablesInsert, TablesUpdate } from "@super/db";
import type { AiRuleType } from "@super/shared";
import {
  getAiPreferencesForTenant,
  getAutomationConfigForTenant,
  listAiRulesForTenant,
} from "@/lib/automation-data";
import {
  AI_RULE_TYPES,
  validateAiModelInput,
  validateAiPreferencesInput,
  validateAutomationConfigInput,
} from "@/lib/automation";
import { validateAiRuleInput } from "./validation";
import { getAuthContext } from "@/lib/auth-context";
import { DEFAULT_SITE_THEME_ID, validateSiteInput } from "@/lib/site";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { validateTenantInput } from "@/lib/tenant";

export type SettingsState = {
  error?: string;
  success?: string;
};

const SINGLE_RULE_TYPES = ["tone", "style", "structure"] as const;

type SettingsContext = Omit<
  Awaited<ReturnType<typeof getAuthContext>>,
  "user" | "membership" | "tenant"
> & {
  user: NonNullable<Awaited<ReturnType<typeof getAuthContext>>["user"]>;
  membership: NonNullable<Awaited<ReturnType<typeof getAuthContext>>["membership"]>;
  tenant: NonNullable<Awaited<ReturnType<typeof getAuthContext>>["tenant"]>;
  admin: ReturnType<typeof getAdminSupabaseClient>;
};

function revalidateSettingsPaths(subdomain?: string | null) {
  revalidatePath("/", "layout");
  revalidatePath("/app");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/blog");
  revalidatePath("/app/estrategias");
  revalidatePath("/app/configuracoes");
  revalidatePath("/app/configuracoes/account");
  revalidatePath("/app/configuracoes/workspace");
  revalidatePath("/app/configuracoes/site");
  revalidatePath("/app/configuracoes/ai");
  revalidatePath("/app/configuracoes/automation");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard/estrategias");
  revalidatePath("/dashboard/configuracoes");
  if (subdomain) {
    revalidatePath(`/blog/${subdomain}`);
  }
}

async function requireSettingsContext(): Promise<SettingsContext> {
  const context = await getAuthContext();

  if (!context.user) {
    redirect("/login");
  }

  if (!context.membership || !context.tenant) {
    redirect("/onboarding");
  }

  const admin = getAdminSupabaseClient();

  return {
    ...context,
    user: context.user,
    membership: context.membership,
    tenant: context.tenant,
    admin,
  };
}

async function deleteAiRulesByIds(
  context: SettingsContext,
  ruleIds: string[],
) {
  if (ruleIds.length === 0) {
    return;
  }

  const deleteResult = await context.admin
    .from("ai_rules")
    .delete()
    .in("id", ruleIds)
    .eq("tenant_id", context.tenant.id);

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }
}

async function syncAiRules(
  context: SettingsContext,
  desiredRules: Array<{ rule_type: string; content: string }>,
) {
  const existingRules = await listAiRulesForTenant(context.tenant.id);
  const deleteIds: string[] = [];
  const insertRows: TablesInsert<"ai_rules">[] = [];
  const updateRows: Array<{ id: string; content: string }> = [];

  const desiredSingles = new Map(
    desiredRules
      .filter((rule) => SINGLE_RULE_TYPES.includes(rule.rule_type as (typeof SINGLE_RULE_TYPES)[number]))
      .map((rule) => [rule.rule_type, rule.content]),
  );

  for (const ruleType of SINGLE_RULE_TYPES) {
    const existingForType = existingRules.filter((rule) => rule.rule_type === ruleType);
    const desiredContent = desiredSingles.get(ruleType) ?? null;

    if (!desiredContent) {
      deleteIds.push(...existingForType.map((rule) => rule.id));
      continue;
    }

    const [firstRule, ...duplicateRules] = existingForType;

    if (!firstRule) {
      insertRows.push({
        tenant_id: context.tenant.id,
        rule_type: ruleType,
        content: desiredContent,
      });
      continue;
    }

    if (firstRule.content !== desiredContent) {
      updateRows.push({
        id: firstRule.id,
        content: desiredContent,
      });
    }

    deleteIds.push(...duplicateRules.map((rule) => rule.id));
  }

  const existingAvoidTopics = existingRules.filter((rule) => rule.rule_type === "avoid_topic");
  const desiredAvoidTopics = desiredRules
    .filter((rule) => rule.rule_type === "avoid_topic")
    .map((rule) => rule.content);
  const keepByContent = new Map<string, string>();

  for (const rule of existingAvoidTopics) {
    if (keepByContent.has(rule.content)) {
      deleteIds.push(rule.id);
      continue;
    }

    keepByContent.set(rule.content, rule.id);
  }

  for (const rule of existingAvoidTopics) {
    if (!desiredAvoidTopics.includes(rule.content)) {
      deleteIds.push(rule.id);
    }
  }

  for (const content of desiredAvoidTopics) {
    if (!keepByContent.has(content)) {
      insertRows.push({
        tenant_id: context.tenant.id,
        rule_type: "avoid_topic",
        content,
      });
    }
  }

  await deleteAiRulesByIds(context, [...new Set(deleteIds)]);

  for (const updateRow of updateRows) {
    const updateResult = await context.admin
      .from("ai_rules")
      .update({
        content: updateRow.content,
      } satisfies TablesUpdate<"ai_rules">)
      .eq("id", updateRow.id)
      .eq("tenant_id", context.tenant.id);

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }
  }

  if (insertRows.length > 0) {
    const insertResult = await context.admin
      .from("ai_rules")
      .insert(insertRows satisfies TablesInsert<"ai_rules">[]);

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }
  }
}

export async function saveAccountSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const context = await requireSettingsContext();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (fullName.length > 120) {
    return { error: "O nome completo precisa ter no maximo 120 caracteres." };
  }

  const now = new Date().toISOString();
  const result = context.profile
    ? ((await context.admin
        .from("profiles")
        .update({
          full_name: fullName || null,
        } satisfies TablesUpdate<"profiles">)
        .eq("id", context.user.id)
        .select("*")
        .single()) as {
        data: Tables<"profiles"> | null;
        error: { message: string } | null;
      })
    : ((await context.admin
        .from("profiles")
        .insert({
          id: context.user.id,
          full_name: fullName || null,
          created_at: now,
        } satisfies TablesInsert<"profiles">)
        .select("*")
        .single()) as {
        data: Tables<"profiles"> | null;
        error: { message: string } | null;
      });

  if (result.error || !result.data) {
    return { error: "Nao foi possivel salvar os dados da conta agora." };
  }

  revalidateSettingsPaths(context.site?.subdomain);
  return { success: "Conta atualizada com sucesso." };
}

export async function saveWorkspaceSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const context = await requireSettingsContext();
  const validation = validateTenantInput(
    String(formData.get("name") ?? ""),
    String(formData.get("slug") ?? ""),
  );

  if (!validation.ok) {
    return { error: validation.error };
  }

  const duplicateResult = (await context.admin
    .from("tenants")
    .select("id")
    .eq("slug", validation.value.slug)
    .maybeSingle()) as {
    data: Pick<Tables<"tenants">, "id"> | null;
    error: { message: string } | null;
  };

  if (duplicateResult.error) {
    return { error: "Nao foi possivel validar o slug do workspace agora." };
  }

  if (duplicateResult.data && duplicateResult.data.id !== context.tenant.id) {
    return { error: "Esse slug ja esta em uso." };
  }

  const result = (await context.admin
    .from("tenants")
    .update({
      name: validation.value.name,
      slug: validation.value.slug,
    } satisfies TablesUpdate<"tenants">)
    .eq("id", context.tenant.id)
    .select("*")
    .single()) as {
    data: Tables<"tenants"> | null;
    error: { code?: string; message: string } | null;
  };

  if (result.error || !result.data) {
    if (result.error?.code === "23505") {
      return { error: "Esse slug ja esta em uso." };
    }

    return { error: "Nao foi possivel salvar o workspace agora." };
  }

  revalidateSettingsPaths(context.site?.subdomain);
  return { success: "Workspace atualizado com sucesso." };
}

export async function saveSiteSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const context = await requireSettingsContext();
  const validation = validateSiteInput(
    String(formData.get("name") ?? ""),
    String(formData.get("language") ?? ""),
    String(formData.get("subdomain") ?? ""),
  );

  if (!validation.ok) {
    return { error: validation.error };
  }

  const duplicateResult = (await context.admin
    .from("sites")
    .select("id")
    .eq("subdomain", validation.value.subdomain)
    .maybeSingle()) as {
    data: Pick<Tables<"sites">, "id"> | null;
    error: { message: string } | null;
  };

  if (duplicateResult.error) {
    return { error: "Nao foi possivel validar o subdominio agora." };
  }

  if (duplicateResult.data && duplicateResult.data.id !== context.site?.id) {
    return { error: "Esse subdominio ja esta em uso." };
  }

  const previousSubdomain = context.site?.subdomain ?? null;
  const payload = {
    name: validation.value.name,
    language: validation.value.language,
    subdomain: validation.value.subdomain,
    tenant_id: context.membership.tenant_id,
    theme_id: context.site?.theme_id ?? DEFAULT_SITE_THEME_ID,
  };

  const result = context.site
    ? ((await context.admin
        .from("sites")
        .update(payload satisfies TablesUpdate<"sites">)
        .eq("id", context.site.id)
        .eq("tenant_id", context.membership.tenant_id)
        .select("*")
        .single()) as {
        data: Tables<"sites"> | null;
        error: { code?: string; message: string } | null;
      })
    : ((await context.admin
        .from("sites")
        .insert(payload satisfies TablesInsert<"sites">)
        .select("*")
        .single()) as {
        data: Tables<"sites"> | null;
        error: { code?: string; message: string } | null;
      });

  if (result.error || !result.data) {
    if (result.error?.code === "23505") {
      return { error: "Esse subdominio ja esta em uso." };
    }

    return { error: "Nao foi possivel salvar o site agora." };
  }

  revalidateSettingsPaths(result.data.subdomain);
  revalidatePath("/onboarding/site");

  if (previousSubdomain && previousSubdomain !== result.data.subdomain) {
    revalidatePath(`/blog/${previousSubdomain}`);
  }

  return {
    success: context.site ? "Site atualizado com sucesso." : "Site criado com sucesso.",
  };
}

export async function saveAiSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const context = await requireSettingsContext();
  const modelValidation = validateAiModelInput(String(formData.get("model") ?? ""));
  const validation = validateAiPreferencesInput(
    String(formData.get("tone_of_voice") ?? ""),
    String(formData.get("writing_style") ?? ""),
    String(formData.get("expertise_level") ?? ""),
    String(formData.get("model") ?? ""),
  );

  if (!modelValidation.ok) {
    return { error: modelValidation.error };
  }

  if (!validation.ok) {
    return { error: validation.error };
  }

  const now = new Date().toISOString();
  const currentPreferences = await getAiPreferencesForTenant(context.tenant.id);
  const result = currentPreferences
    ? ((await context.admin
        .from("ai_preferences")
        .update({
          ...validation.value,
          model: modelValidation.value,
          updated_at: now,
        } satisfies TablesUpdate<"ai_preferences">)
        .eq("id", currentPreferences.id)
        .eq("tenant_id", context.tenant.id)
        .select("*")
        .single()) as {
        data: Tables<"ai_preferences"> | null;
        error: { message: string } | null;
      })
    : ((await context.admin
        .from("ai_preferences")
        .insert({
          tenant_id: context.tenant.id,
          ...validation.value,
          model: modelValidation.value,
          updated_at: now,
        } satisfies TablesInsert<"ai_preferences">)
        .select("*")
        .single()) as {
        data: Tables<"ai_preferences"> | null;
        error: { message: string } | null;
      });

  if (result.error || !result.data) {
    return { error: "Nao foi possivel salvar as preferencias de IA agora." };
  }

  revalidateSettingsPaths(context.site?.subdomain);
  return { success: "Preferencias de IA atualizadas com sucesso." };
}

function isAiRuleType(value: string): value is AiRuleType {
  return AI_RULE_TYPES.includes(value as AiRuleType);
}

export async function saveAiRuleAction(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const context = await requireSettingsContext();
  const ruleTypeRaw = String(formData.get("rule_type") ?? "");
  const ruleId = String(formData.get("rule_id") ?? "");
  const contentRaw = String(formData.get("content") ?? "");

  if (!isAiRuleType(ruleTypeRaw)) {
    return { error: "Escolha um tipo de regra valido." };
  }

  const validation = validateAiRuleInput(ruleTypeRaw, contentRaw);

  if (!validation.ok) {
    return { error: validation.error };
  }

  const ruleType = validation.value.rule_type;
  const now = new Date().toISOString();

  if (ruleType === "avoid_topic") {
    if (ruleId) {
      const updateResult = (await context.admin
        .from("ai_rules")
        .update({
          content: validation.value.content,
        } satisfies TablesUpdate<"ai_rules">)
        .eq("id", ruleId)
        .eq("tenant_id", context.tenant.id)
        .eq("rule_type", ruleType)
        .select("id")
        .single()) as {
        data: { id: string } | null;
        error: { message: string } | null;
      };

      if (updateResult.error || !updateResult.data) {
        return { error: "Nao foi possivel salvar a regra agora." };
      }
    } else {
      const insertResult = (await context.admin
        .from("ai_rules")
        .insert({
          tenant_id: context.tenant.id,
          rule_type: ruleType,
          content: validation.value.content,
          created_at: now,
        } satisfies TablesInsert<"ai_rules">)
        .select("id")
        .single()) as {
        data: { id: string } | null;
        error: { message: string } | null;
      };

      if (insertResult.error || !insertResult.data) {
        return { error: "Nao foi possivel salvar a regra agora." };
      }
    }

    revalidateSettingsPaths(context.site?.subdomain);
    return { success: "Regra salva com sucesso." };
  }

  const existingRuleResult = (await context.admin
    .from("ai_rules")
    .select("id")
    .eq("tenant_id", context.tenant.id)
    .eq("rule_type", ruleType)
    .order("created_at", { ascending: false })
    .limit(1)) as {
    data: Array<Pick<Tables<"ai_rules">, "id">> | null;
    error: { message: string } | null;
  };

  if (existingRuleResult.error) {
    return { error: "Nao foi possivel validar a regra agora." };
  }

  const existingRule = existingRuleResult.data?.[0] ?? null;

  const payload = {
    tenant_id: context.tenant.id,
    rule_type: ruleType,
    content: validation.value.content,
    created_at: now,
  } satisfies TablesInsert<"ai_rules">;

  const result = existingRule
      ? ((await context.admin
        .from("ai_rules")
        .update({
          content: validation.value.content,
        } satisfies TablesUpdate<"ai_rules">)
        .eq("id", existingRule.id)
        .eq("tenant_id", context.tenant.id)
        .eq("rule_type", ruleType)
        .select("id")
        .single()) as {
        data: { id: string } | null;
        error: { message: string } | null;
      })
    : ((await context.admin
        .from("ai_rules")
        .insert(payload)
        .select("id")
        .single()) as {
        data: { id: string } | null;
        error: { message: string } | null;
      });

  if (result.error || !result.data) {
    return { error: "Nao foi possivel salvar a regra agora." };
  }

  revalidateSettingsPaths(context.site?.subdomain);
  return { success: "Regra salva com sucesso." };
}

export async function deleteAiRuleAction(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const context = await requireSettingsContext();
  const ruleTypeRaw = String(formData.get("rule_type") ?? "");
  const ruleId = String(formData.get("rule_id") ?? "");

  if (!isAiRuleType(ruleTypeRaw)) {
    return { error: "Escolha um tipo de regra valido." };
  }

  const deleteQuery = context.admin
    .from("ai_rules")
    .delete()
    .eq("tenant_id", context.tenant.id)
    .eq("rule_type", ruleTypeRaw as AiRuleType);

  const result = ruleId
    ? await deleteQuery.eq("id", ruleId)
    : await deleteQuery;

  if (result.error) {
    return { error: "Nao foi possivel remover a regra agora." };
  }

  revalidateSettingsPaths(context.site?.subdomain);
  return { success: "Regra removida com sucesso." };
}

export async function deleteAiRuleFormAction(formData: FormData): Promise<void> {
  await deleteAiRuleAction({}, formData);
}

export async function saveAutomationConfigSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const context = await requireSettingsContext();
  const validation = validateAutomationConfigInput(
    String(formData.get("keywords_seed") ?? ""),
    String(formData.get("language") ?? ""),
    String(formData.get("frequency") ?? ""),
    String(formData.get("operation_mode") ?? ""),
    formData.get("approval_required") === "on",
  );

  if (!validation.ok) {
    return { error: validation.error };
  }

  const now = new Date().toISOString();
  const currentConfig = await getAutomationConfigForTenant(context.tenant.id);
  const result = currentConfig
    ? ((await context.admin
        .from("automation_configs")
        .update({
          ...validation.value,
          updated_at: now,
        } satisfies TablesUpdate<"automation_configs">)
        .eq("id", currentConfig.id)
        .eq("tenant_id", context.tenant.id)
        .select("*")
        .single()) as {
        data: Tables<"automation_configs"> | null;
        error: { message: string } | null;
      })
    : ((await context.admin
        .from("automation_configs")
        .insert({
          tenant_id: context.tenant.id,
          ...validation.value,
          updated_at: now,
        } satisfies TablesInsert<"automation_configs">)
        .select("*")
        .single()) as {
        data: Tables<"automation_configs"> | null;
        error: { message: string } | null;
      });

  if (result.error || !result.data) {
    return { error: "Nao foi possivel salvar a configuracao de automacao agora." };
  }

  revalidateSettingsPaths(context.site?.subdomain);
  return { success: "Configuracao de automacao atualizada com sucesso." };
}

