import type { Tables } from "@super/db";
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function getBusinessBriefingForTenant(tenantId: string) {
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  const result = (await (db as any)
    .from("business_briefings")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle()) as {
    data: Tables<"business_briefings"> | null;
    error: { code?: string; message: string } | null;
  };

  if (result.error) {
    if (
      result.error.code === "PGRST205" ||
      result.error.message.includes("Could not find the table 'public.business_briefings'")
    ) {
      return null;
    }

    throw new Error(result.error.message);
  }

  return result.data;
}
