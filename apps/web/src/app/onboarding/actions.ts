"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables, TablesInsert, TablesUpdate } from "@super/db";
import { getAuthContext } from "@/lib/auth-context";
import { validateBusinessBriefingInput } from "@/lib/business-briefing";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";
import { validateSiteInput } from "@/lib/site";
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

function revalidateOnboardingPaths(subdomain?: string | null) {
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard/estrategia");
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/onboarding");
  revalidatePath("/onboarding/site");
  revalidatePath("/onboarding/briefing");
  revalidatePath("/app");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/blog");
  revalidatePath("/app/estrategias");

  if (subdomain) {
    revalidatePath(`/blog/${subdomain}`);
  }
}

export async function createTenant(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  if (context.membership) {
    const briefing = context.tenant
      ? await getBusinessBriefingForTenant(context.tenant.id)
      : null;
    redirect(context.site ? (briefing ? "/dashboard" : "/onboarding/briefing") : "/onboarding/site");
  }

  const validation = validateTenantInput(
    String(formData.get("name") ?? ""),
    String(formData.get("slug") ?? ""),
  );

  if (!validation.ok) {
    return { error: validation.error };
  }

  const admin = getAdminSupabaseClient();

  const tenantResult = (await admin
    .from("tenants")
    .insert({
      name: validation.value.name,
      slug: validation.value.slug,
    } satisfies TablesInsert<"tenants">)
    .select("*")
    .single()) as {
    data: Tables<"tenants"> | null;
    error: { code?: string; message: string } | null;
  };

  if (tenantResult.error || !tenantResult.data) {
    if (tenantResult.error?.code === "23505") {
      return { error: "Esse slug ja esta em uso." };
    }

    return { error: "Nao foi possivel criar o espaco de trabalho agora." };
  }

  const membershipResult = (await admin.from("memberships").insert({
    tenant_id: tenantResult.data.id,
    user_id: context.user.id,
    role: "owner",
  } satisfies TablesInsert<"memberships">)) as {
    error: { message: string } | null;
  };

  if (membershipResult.error) {
    await admin.from("tenants").delete().eq("id", tenantResult.data.id);
    return { error: "Nao foi possivel vincular sua conta ao espaco." };
  }

  revalidateOnboardingPaths();
  redirect("/onboarding/site");
}

export async function createOnboardingSite(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  if (!context.membership || !context.tenant) {
    redirect("/onboarding");
  }

  const existingBriefing = await getBusinessBriefingForTenant(context.tenant.id);

  if (context.site) {
    redirect(existingBriefing ? "/dashboard" : "/onboarding/briefing");
  }

  const validation = validateSiteInput(
    String(formData.get("name") ?? ""),
    String(formData.get("language") ?? ""),
    String(formData.get("subdomain") ?? ""),
  );

  if (!validation.ok) {
    return { error: validation.error };
  }

  const admin = getAdminSupabaseClient();
  const duplicateResult = (await admin
    .from("sites")
    .select("id")
    .eq("subdomain", validation.value.subdomain)
    .maybeSingle()) as {
    data: Pick<Tables<"sites">, "id"> | null;
    error: { message: string } | null;
  };

  if (duplicateResult.error) {
    return { error: "Nao foi possivel validar o subdominio agora." };
  }

  if (duplicateResult.data) {
    return { error: "Esse subdominio ja esta em uso." };
  }

  const siteResult = (await admin
    .from("sites")
    .insert({
      tenant_id: context.tenant.id,
      name: validation.value.name,
      language: validation.value.language,
      subdomain: validation.value.subdomain,
    } satisfies TablesInsert<"sites">)
    .select("*")
    .single()) as {
    data: Tables<"sites"> | null;
    error: { code?: string; message: string } | null;
  };

  if (siteResult.error || !siteResult.data) {
    if (siteResult.error?.code === "23505") {
      return { error: "Esse subdominio ja esta em uso." };
    }

    return { error: "Nao foi possivel criar o site agora." };
  }

  revalidateOnboardingPaths(siteResult.data.subdomain);
  redirect("/onboarding/briefing");
}

export async function saveOnboardingBriefing(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  if (!context.membership || !context.tenant) {
    redirect("/onboarding");
  }

  if (!context.site) {
    redirect("/onboarding/site");
  }

  const validation = validateBusinessBriefingInput(formData);

  if (!validation.ok) {
    return { error: validation.error };
  }

  const admin = getAdminSupabaseClient();
  const currentBriefing = await getBusinessBriefingForTenant(context.tenant.id);
  const now = new Date().toISOString();
  const payload = {
    tenant_id: context.tenant.id,
    site_id: context.site.id,
    business_name: validation.value.businessName,
    segment: validation.value.segment,
    offerings: validation.value.offerings,
    customer_profile: validation.value.customerProfile,
    location: validation.value.location,
    desired_keywords:
      validation.value.desiredKeywords.length > 0 ? validation.value.desiredKeywords : null,
    keyword_motivation: validation.value.keywordMotivation,
    competitors: validation.value.competitors.length > 0 ? validation.value.competitors : null,
    notes: validation.value.notes,
    summary: validation.value.summary,
    status: "ready",
    updated_at: now,
  };

  const result = currentBriefing
    ? ((await admin
        .from("business_briefings")
        .update(payload satisfies TablesUpdate<"business_briefings">)
        .eq("id", currentBriefing.id)
        .eq("tenant_id", context.tenant.id)
        .select("*")
        .single()) as {
        data: Tables<"business_briefings"> | null;
        error: { message: string } | null;
      })
    : ((await admin
        .from("business_briefings")
        .insert({
          ...payload,
          created_at: now,
        } satisfies TablesInsert<"business_briefings">)
        .select("*")
        .single()) as {
        data: Tables<"business_briefings"> | null;
        error: { message: string } | null;
      });

  if (result.error || !result.data) {
    return { error: "Nao foi possivel salvar o briefing do negocio agora." };
  }

  revalidateOnboardingPaths(context.site.subdomain);
  redirect("/dashboard");
}

export async function completeOnboarding(
  data: FullOnboardingData,
): Promise<{ error?: string; success?: boolean }> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  const admin = getAdminSupabaseClient();

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({
      name: data.tenantName,
      slug: data.tenantSlug,
    } satisfies TablesInsert<"tenants">)
    .select("*")
    .single();

  if (tenantError || !tenant) {
    return { error: `Erro ao criar workspace: ${tenantError?.message}` };
  }

  const { error: membershipError } = await admin.from("memberships").insert({
    tenant_id: tenant.id,
    user_id: context.user.id,
    role: "owner",
  } satisfies TablesInsert<"memberships">);

  if (membershipError) {
    return { error: `Erro ao criar vinculo: ${membershipError.message}` };
  }

  const { data: site, error: siteError } = await admin
    .from("sites")
    .insert({
      tenant_id: tenant.id,
      name: data.siteName,
      subdomain: data.subdomain,
      language: "pt-BR",
    } satisfies TablesInsert<"sites">)
    .select("*")
    .single();

  if (siteError || !site) {
    return { error: `Erro ao criar site: ${siteError?.message}` };
  }

  const { error: briefingError } = await admin.from("business_briefings").insert({
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
  } satisfies TablesInsert<"business_briefings">);

  if (briefingError) {
    return { error: `Erro ao salvar briefing: ${briefingError.message}` };
  }

  revalidateOnboardingPaths(site.subdomain);
  return { success: true };
}
