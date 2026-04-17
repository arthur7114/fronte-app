import type { Tables } from "@super/db";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { listAiRulesForTenant } from "@/lib/automation-data";

export type SettingsWorkspaceData = {
  user: NonNullable<Awaited<ReturnType<typeof getAuthContext>>["user"]>;
  membership: Tables<"memberships">;
  tenant: Tables<"tenants">;
  site: Tables<"sites"> | null;
  profile: Tables<"profiles"> | null;
  automationConfig: Tables<"automation_configs"> | null;
  aiPreferences: Tables<"ai_preferences"> | null;
  aiRules: Tables<"ai_rules">[];
};

export async function requireSettingsWorkspace() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  return {
    user,
    membership,
    tenant,
    site,
    admin: getAdminSupabaseClient(),
  } as const;
}

export async function loadSettingsWorkspaceData(): Promise<SettingsWorkspaceData> {
  const workspace = await requireSettingsWorkspace();

  const [profileResult, automationConfigResult, aiPreferencesResult, aiRules] = await Promise.all([
    workspace.admin
      .from("profiles")
      .select("*")
      .eq("id", workspace.user.id)
      .maybeSingle(),
    workspace.admin
      .from("automation_configs")
      .select("*")
      .eq("tenant_id", workspace.tenant.id)
      .maybeSingle(),
    workspace.admin
      .from("ai_preferences")
      .select("*")
      .eq("tenant_id", workspace.tenant.id)
      .maybeSingle(),
    listAiRulesForTenant(workspace.tenant.id),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (automationConfigResult.error) {
    throw new Error(automationConfigResult.error.message);
  }

  if (aiPreferencesResult.error) {
    throw new Error(aiPreferencesResult.error.message);
  }

  return {
    user: workspace.user,
    membership: workspace.membership,
    tenant: workspace.tenant,
    site: workspace.site,
    profile: profileResult.data,
    automationConfig: automationConfigResult.data,
    aiPreferences: aiPreferencesResult.data,
    aiRules,
  };
}
