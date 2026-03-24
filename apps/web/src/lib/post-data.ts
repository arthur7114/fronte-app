import type { Tables } from "@super/db";
import { normalizePostSlug } from "@/lib/post";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function listPostsForSite(tenantId: string, siteId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("posts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("site_id", siteId)
    .order("updated_at", { ascending: false })) as {
    data: Tables<"posts">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function getPostForSite(tenantId: string, siteId: string, postId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("posts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("site_id", siteId)
    .eq("id", postId)
    .maybeSingle()) as {
    data: Tables<"posts"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function listPublishedPostsForSite(siteId: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("posts")
    .select("*")
    .eq("site_id", siteId)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })) as {
    data: Tables<"posts">[] | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function getPublishedPostBySlug(siteId: string, slug: string) {
  const admin = getAdminSupabaseClient();
  const result = (await admin
    .from("posts")
    .select("*")
    .eq("site_id", siteId)
    .eq("slug", normalizePostSlug(slug))
    .eq("status", "published")
    .not("published_at", "is", null)
    .maybeSingle()) as {
    data: Tables<"posts"> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
