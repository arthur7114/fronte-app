import type { Tables } from "@super/db";
import { cache } from "react";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type AuthContext = {
  user: {
    id: string;
    email?: string | null;
  } | null;
  profile: Tables<"profiles"> | null;
  membership: Tables<"memberships"> | null;
  tenant: Tables<"tenants"> | null;
  site: Tables<"sites"> | null;
};

export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const supabase = await getServerSupabaseClient();
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, membership: null, tenant: null, site: null };
  }

  const profileResult = (await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()) as {
    data: Tables<"profiles"> | null;
    error: { message: string } | null;
  };

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  const membershipResult = (await db
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()) as {
    data: Tables<"memberships"> | null;
    error: { message: string } | null;
  };

  if (membershipResult.error) {
    throw new Error(membershipResult.error.message);
  }

  const membership = membershipResult.data;

  if (!membership) {
    return { user, profile: profileResult.data, membership: null, tenant: null, site: null };
  }

  const tenantResult = (await db
    .from("tenants")
    .select("*")
    .eq("id", membership.tenant_id)
    .maybeSingle()) as {
    data: Tables<"tenants"> | null;
    error: { message: string } | null;
  };

  if (tenantResult.error) {
    throw new Error(tenantResult.error.message);
  }

  const admin = getAdminSupabaseClient();
  const siteResult = (await admin
    .from("sites")
    .select("*")
    .eq("tenant_id", membership.tenant_id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()) as {
    data: Tables<"sites"> | null;
    error: { message: string } | null;
  };

  if (siteResult.error) {
    throw new Error(siteResult.error.message);
  }

  return {
    user,
    profile: profileResult.data,
    membership,
    tenant: tenantResult.data,
    site: siteResult.data,
  };
});
