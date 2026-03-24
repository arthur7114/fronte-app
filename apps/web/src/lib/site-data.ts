import type { Tables } from "@super/db";
import { normalizeSiteSubdomain } from "@/lib/site";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function getSiteBySubdomain(subdomain: string) {
  const admin = getAdminSupabaseClient();
  const normalizedSubdomain = normalizeSiteSubdomain(subdomain);

  const result = (await admin
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
