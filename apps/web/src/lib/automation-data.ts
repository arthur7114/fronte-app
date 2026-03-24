import type { Tables } from "@super/db";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function getAutomationConfigForTenant(tenantId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("automation_configs")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle()) as {
    data: Tables<"automation_configs"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function getAiPreferencesForTenant(tenantId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("ai_preferences")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle()) as {
    data: Tables<"ai_preferences"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function listAiRulesForTenant(tenantId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("ai_rules")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true })) as {
    data: Tables<"ai_rules">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function listTopicCandidatesForTenant(tenantId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("topic_candidates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })) as {
    data: Tables<"topic_candidates">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function getTopicCandidateForTenant(tenantId: string, topicId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("topic_candidates")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", topicId)
    .maybeSingle()) as {
    data: Tables<"topic_candidates"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function listContentBriefsForTenant(tenantId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("content_briefs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })) as {
    data: Tables<"content_briefs">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function getContentBriefForTenant(tenantId: string, briefId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("content_briefs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", briefId)
    .maybeSingle()) as {
    data: Tables<"content_briefs"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function listAutomationJobsForTenant(tenantId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("automation_jobs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .limit(50)) as {
    data: Tables<"automation_jobs">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}
