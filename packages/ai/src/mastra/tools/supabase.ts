/**
 * Thin Supabase REST client for use inside Mastra steps.
 *
 * Steps run in the same Node process as the Next.js server runtime,
 * so we reuse the service-role key (server-side only). For RLS compliance
 * the workflow must always pass tenant_id explicitly to filter queries —
 * never trust client-provided tenant context.
 */

type SupabaseFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown> | Record<string, unknown>[];
  searchParams?: Record<string, string>;
  prefer?: string;
};

function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error("Supabase credentials missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  return { url, key };
}

async function supabaseRequest<T>(table: string, options: SupabaseFetchOptions = {}): Promise<T> {
  const { url, key } = getSupabaseCredentials();
  const search = options.searchParams ? `?${new URLSearchParams(options.searchParams).toString()}` : "";
  const response = await fetch(`${url}/rest/v1/${table}${search}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: options.prefer ?? "return=representation",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${table} failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

export const supabaseDb = {
  // ----------- article_generations -----------
  async getGeneration(generationId: string, tenantId: string) {
    const rows = await supabaseRequest<unknown[]>("article_generations", {
      searchParams: { select: "*", id: `eq.${generationId}`, tenant_id: `eq.${tenantId}` },
    });
    return rows[0] ?? null;
  },
  async updateGeneration(generationId: string, patch: Record<string, unknown>) {
    await supabaseRequest("article_generations", {
      method: "PATCH",
      searchParams: { id: `eq.${generationId}` },
      body: patch,
      prefer: "return=minimal",
    });
  },

  // ----------- posts -----------
  async getPost(postId: string, tenantId: string) {
    const rows = await supabaseRequest<unknown[]>("posts", {
      searchParams: { select: "*", id: `eq.${postId}`, tenant_id: `eq.${tenantId}` },
    });
    return rows[0] ?? null;
  },
  async updatePost(postId: string, tenantId: string, patch: Record<string, unknown>) {
    await supabaseRequest("posts", {
      method: "PATCH",
      searchParams: { id: `eq.${postId}`, tenant_id: `eq.${tenantId}` },
      body: patch,
      prefer: "return=minimal",
    });
  },

  // ----------- strategies & briefings -----------
  async getStrategy(strategyId: string, tenantId: string) {
    const rows = await supabaseRequest<unknown[]>("strategies", {
      searchParams: { select: "*", id: `eq.${strategyId}`, tenant_id: `eq.${tenantId}` },
    });
    return rows[0] ?? null;
  },
  async getBusinessBriefing(tenantId: string) {
    const rows = await supabaseRequest<unknown[]>("business_briefings", {
      searchParams: { select: "*", tenant_id: `eq.${tenantId}`, order: "created_at.desc", limit: "1" },
    });
    return rows[0] ?? null;
  },
  async getAutomationConfig(tenantId: string, siteId: string) {
    const rows = await supabaseRequest<unknown[]>("automation_configs", {
      searchParams: { select: "*", tenant_id: `eq.${tenantId}`, site_id: `eq.${siteId}`, limit: "1" },
    });
    return rows[0] ?? null;
  },

  // ----------- ai preferences & rules -----------
  async getAiPreferences(tenantId: string) {
    const rows = await supabaseRequest<Array<{ model?: string | null }>>("ai_preferences", {
      searchParams: {
        select: "model,tone_of_voice,writing_style,expertise_level",
        tenant_id: `eq.${tenantId}`,
      },
    });
    return rows[0] ?? null;
  },
  async getAiRules(tenantId: string) {
    return await supabaseRequest<Array<{ rule_type: string; content: string }>>("ai_rules", {
      searchParams: { select: "rule_type,content", tenant_id: `eq.${tenantId}` },
    });
  },

  // ----------- keyword_candidates -----------
  async listKeywords(strategyId: string, tenantId: string, status?: string) {
    const params: Record<string, string> = {
      select: "*",
      strategy_id: `eq.${strategyId}`,
      tenant_id: `eq.${tenantId}`,
    };
    if (status) params.status = `eq.${status}`;
    return await supabaseRequest<Record<string, unknown>[]>("keyword_candidates", { searchParams: params });
  },
  async upsertKeywords(rows: Record<string, unknown>[]) {
    if (rows.length === 0) return;
    await supabaseRequest("keyword_candidates", {
      method: "POST",
      body: rows,
      prefer: "resolution=merge-duplicates,return=minimal",
    });
  },

  // ----------- topic_candidates -----------
  async insertTopics(rows: Record<string, unknown>[]) {
    if (rows.length === 0) return;
    await supabaseRequest("topic_candidates", {
      method: "POST",
      body: rows,
      prefer: "return=minimal",
    });
  },

  // ----------- workflow runs (audit) -----------
  async getWorkflowSnapshot(workflowName: string, runId: string) {
    const rows = await supabaseRequest<unknown[]>("mastra_workflow_snapshot", {
      searchParams: { select: "*", workflow_name: `eq.${workflowName}`, run_id: `eq.${runId}` },
    });
    return rows[0] ?? null;
  },
  async listSuspendedWorkflows(tenantId: string) {
    // Supabase returns the snapshot table created by Mastra. We filter by tenantId in the
    // snapshot JSON payload (which we always include in workflow input).
    const rows = await supabaseRequest<Record<string, unknown>[]>("mastra_workflow_snapshot", {
      searchParams: {
        select: "*",
        // Mastra writes its own filter columns; we cast snapshot->>tenant_id via PostgREST.
        // The exact column depends on the Mastra schema — listSuspendedWorkflows is best-effort.
        order: "updated_at.desc",
        limit: "100",
      },
    });
    return rows.filter((row) => {
      const snapshot = row.snapshot as Record<string, unknown> | undefined;
      const ctx = snapshot?.context as Record<string, unknown> | undefined;
      const input = ctx?.input as Record<string, unknown> | undefined;
      return input?.tenantId === tenantId;
    });
  },
};
