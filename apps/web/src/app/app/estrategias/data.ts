import type { Tables } from "@super/db";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";
import {
  getAiPreferencesForTenant,
  getAutomationConfigForTenant,
  listAutomationJobsForTenant,
  listContentBriefsForTenant,
  listTopicCandidatesForTenant,
  listKeywordCandidatesForTenant,
  listPostsForTenant,
  listStrategiesForTenant,
} from "@/lib/automation-data";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export type AutomationWorkspaceData = {
  user: NonNullable<Awaited<ReturnType<typeof getAuthContext>>["user"]>;
  tenant: Tables<"tenants">;
  site: Tables<"sites">;
  automationConfig: Tables<"automation_configs"> | null;
  aiPreferences: Tables<"ai_preferences"> | null;
  topics: Tables<"topic_candidates">[];
  keywords: Tables<"keyword_candidates">[];
  briefs: Tables<"content_briefs">[];
  jobs: Tables<"automation_jobs">[];
  posts: Tables<"posts">[];
  strategies: Tables<"strategies">[];
};


export async function requireAutomationWorkspace() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  if (!site) {
    redirect("/onboarding/site");
  }

  return {
    user,
    tenant,
    site,
    admin: getAdminSupabaseClient(),
  } as const;
}

export async function loadAutomationWorkspaceData(): Promise<AutomationWorkspaceData> {
  const workspace = await requireAutomationWorkspace();
  const [automationConfig, aiPreferences, topics, keywords, briefs, jobs, posts, strategies] = await Promise.all([
    getAutomationConfigForTenant(workspace.tenant.id),
    getAiPreferencesForTenant(workspace.tenant.id),
    listTopicCandidatesForTenant(workspace.tenant.id),
    listKeywordCandidatesForTenant(workspace.tenant.id),
    listContentBriefsForTenant(workspace.tenant.id),
    listAutomationJobsForTenant(workspace.tenant.id),
    listPostsForTenant(workspace.tenant.id),
    listStrategiesForTenant(workspace.tenant.id),
  ]);

  return {
    user: workspace.user,
    tenant: workspace.tenant,
    site: workspace.site,
    automationConfig,
    aiPreferences,
    topics,
    keywords,
    briefs,
    jobs,
    posts,
    strategies,
  };
}
