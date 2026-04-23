import type { Tables } from "@super/db";
import { normalizeSiteSubdomain } from "@/lib/site";
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type ReadDb = Awaited<ReturnType<typeof getServerSupabaseClient>>;

async function getReadDb(): Promise<ReadDb> {
  const adminDb = getOptionalAdminSupabaseClient();
  return (adminDb ?? (await getServerSupabaseClient())) as ReadDb;
}

export async function getSiteBySubdomain(subdomain: string) {
  const db = await getReadDb();
  const normalizedSubdomain = normalizeSiteSubdomain(subdomain);

  const result = (await db
    .from("sites")
    .select("*")
    .eq("subdomain", normalizedSubdomain)
    .maybeSingle()) as {
    data: Tables<"sites"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
