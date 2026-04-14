"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables, TablesInsert } from "@super/db";
import { getAuthContext } from "@/lib/auth-context";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { validateTenantInput } from "@/lib/tenant";

export type OnboardingState = {
  error?: string;
};

export type FullOnboardingData = {
  tenantName: string;
  tenantSlug: string;
  siteName: string;
  subdomain: string;
  briefing: {
    segment: string;
    offerings: string;
    customer_profile: string;
    location: string;
    desired_keywords: string[];
    competitors: string[];
  };
};

export async function createTenant(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  if (context.membership) {
    redirect(context.site ? "/app/overview" : "/onboarding/site");
  }

  const validation = validateTenantInput(
    String(formData.get("name") ?? ""),
    String(formData.get("slug") ?? ""),
  );

  if (!validation.ok) {
    return { error: validation.error };
  }

  const supabase = getAdminSupabaseClient();
  const db = supabase as any;

  const tenantInsert: TablesInsert<"tenants"> = {
    name: validation.value.name,
    slug: validation.value.slug,
  };

  const tenantResult = (await db
    .from("tenants")
    .insert(tenantInsert)
    .select("*")
    .single()) as {
    data: Tables<"tenants"> | null;
    error: { code?: string; message: string } | null;
  };

  if (tenantResult.error || !tenantResult.data) {
    if (tenantResult.error?.code === "23505") {
      return { error: "Esse slug ja esta em uso." };
    }

    return {
      error: "Nao foi possivel criar o espaco de trabalho agora.",
    };
  }

  const membershipInsert: TablesInsert<"memberships"> = {
    tenant_id: tenantResult.data.id,
    user_id: context.user.id,
    role: "owner",
  };

  const membershipResult = (await db.from("memberships").insert(
    membershipInsert,
  )) as {
    error: { message: string } | null;
  };

  if (membershipResult.error) {
    await db.from("tenants").delete().eq("id", tenantResult.data.id);

    return {
      error: "Nao foi possivel vincular sua conta ao espaco.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding/site");
}

export async function completeOnboarding(
  data: FullOnboardingData,
): Promise<{ error?: string; success?: boolean }> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  const supabase = getAdminSupabaseClient();
  const db = supabase as any;

  // 1. Create Tenant
  const tenantInsert: TablesInsert<"tenants"> = {
    name: data.tenantName,
    slug: data.tenantSlug,
  };

  const { data: tenant, error: tenantError } = await db
    .from("tenants")
    .insert(tenantInsert)
    .select("*")
    .single();

  if (tenantError || !tenant) {
    return { error: `Erro ao criar workspace: ${tenantError?.message}` };
  }

  // 2. Create Membership
  const { error: membershipError } = await db.from("memberships").insert({
    tenant_id: tenant.id,
    user_id: context.user.id,
    role: "owner",
  });

  if (membershipError) {
    return { error: `Erro ao criar vinculo: ${membershipError.message}` };
  }

  // 3. Create Site
  const siteInsert: TablesInsert<"sites"> = {
    tenant_id: tenant.id,
    name: data.siteName,
    subdomain: data.subdomain,
    language: "pt-BR",
  };

  const { data: site, error: siteError } = await db
    .from("sites")
    .insert(siteInsert)
    .select("*")
    .single();

  if (siteError || !site) {
    return { error: `Erro ao criar site: ${siteError?.message}` };
  }

  // 4. Create Business Briefing
  const briefingInsert: TablesInsert<"business_briefings"> = {
    tenant_id: tenant.id,
    site_id: site.id,
    business_name: data.tenantName,
    segment: data.briefing.segment,
    offerings: data.briefing.offerings,
    customer_profile: data.briefing.customer_profile,
    location: data.briefing.location,
    desired_keywords: data.briefing.desired_keywords,
    competitors: data.briefing.competitors,
    status: "completed",
  };

  const { error: briefingError } = await db
    .from("business_briefings")
    .insert(briefingInsert);

  if (briefingError) {
    return { error: `Erro ao salvar briefing: ${briefingError.message}` };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
