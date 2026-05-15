/**
 * Thin Supabase REST client for use inside Mastra steps.
 *
 * Steps run in the same Node process as the worker or the Next.js server
 * runtime, so we reuse the service-role key (server-side only). For RLS
 * compliance the workflow must always pass tenant_id explicitly to filter
 * queries — never trust client-provided tenant context.
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

  return (await response.json()) as T;
}

export const supabaseDb = {
  async getGeneration(generationId: string, tenantId: string) {
    const rows = await supabaseRequest<unknown[]>("article_generations", {
      searchParams: {
        select: "*",
        id: `eq.${generationId}`,
        tenant_id: `eq.${tenantId}`,
      },
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

  async updatePost(postId: string, tenantId: string, patch: Record<string, unknown>) {
    await supabaseRequest("posts", {
      method: "PATCH",
      searchParams: { id: `eq.${postId}`, tenant_id: `eq.${tenantId}` },
      body: patch,
      prefer: "return=minimal",
    });
  },

  async getStrategy(strategyId: string, tenantId: string) {
    const rows = await supabaseRequest<unknown[]>("strategies", {
      searchParams: {
        select: "*",
        id: `eq.${strategyId}`,
        tenant_id: `eq.${tenantId}`,
      },
    });
    return rows[0] ?? null;
  },
};
