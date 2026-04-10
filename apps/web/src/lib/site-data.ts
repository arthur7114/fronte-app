import type { Tables } from "@super/db";
import { normalizeSiteSubdomain } from "@/lib/site";
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function getSiteBySubdomain(subdomain: string) {
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  const normalizedSubdomain = normalizeSiteSubdomain(subdomain);

  const result = (await (db as any)
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
