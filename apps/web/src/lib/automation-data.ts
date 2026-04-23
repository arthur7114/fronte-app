import type { Tables } from "@super/db";
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type ReadDb = Awaited<ReturnType<typeof getServerSupabaseClient>>;

async function getReadDb(): Promise<ReadDb> {
  const adminDb = getOptionalAdminSupabaseClient();
  return (adminDb ?? (await getServerSupabaseClient())) as ReadDb;
}

export async function getAutomationConfigForTenant(tenantId: string) {
  const db = await getReadDb();
  const result = (await db
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
  const db = await getReadDb();
  const result = (await db
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
  const db = await getReadDb();
  const result = (await db
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
  const db = await getReadDb();
  const result = (await db
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
  const db = await getReadDb();
  const result = (await db
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
  const db = await getReadDb();
  const result = (await db
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
  const db = await getReadDb();
  const result = (await db
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
  const db = await getReadDb();
  const result = (await db
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

export async function listKeywordCandidatesForTenant(tenantId: string, strategyId?: string | null) {
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  let query = (db as any)
    .from("keyword_candidates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("journey_stage", { ascending: true })
    .order("priority", { ascending: false });

  if (strategyId) {
    query = query.eq("strategy_id", strategyId);
  }

  const result = (await query) as {
    data: Tables<"keyword_candidates">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function getKeywordCandidateForTenant(tenantId: string, keywordId: string) {
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  const result = (await (db as any)
    .from("keyword_candidates")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", keywordId)
    .maybeSingle()) as {
    data: Tables<"keyword_candidates"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function listPostsForTenant(tenantId: string) {
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  const result = (await (db as any)
    .from("posts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })) as {
    data: Tables<"posts">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function listStrategiesForTenant(tenantId: string) {
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  const result = (await (db as any)
    .from("strategies")
    .select("*")
    .eq("tenant_id", tenantId)
    .neq("status", "archived")
    .order("created_at", { ascending: true })) as {
    data: Tables<"strategies">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function getStrategyForTenant(tenantId: string, strategyId: string) {
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  const result = (await (db as any)
    .from("strategies")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", strategyId)
    .maybeSingle()) as {
    data: Tables<"strategies"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function listWorkspaceCompetitorsForTenant(tenantId: string) {
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  const result = (await (db as any)
    .from("workspace_competitors")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("frequency_score", { ascending: false })
    .limit(20)) as {
    data: any[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}
