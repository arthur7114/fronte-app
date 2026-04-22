"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables, TablesInsert, TablesUpdate } from "@super/db";
import { validateBusinessBriefingInput } from "@/lib/business-briefing";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";
import { getAuthContext } from "@/lib/auth-context";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export type BusinessBriefingState = {
  error?: string;
  success?: string;
};

export async function saveBusinessBriefing(
  _prevState: BusinessBriefingState,
  formData: FormData,
): Promise<BusinessBriefingState> {
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

  const currentBriefing = await getBusinessBriefingForTenant(context.tenant.id);
  const admin = getAdminSupabaseClient();
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

  revalidatePath("/app");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/estrategias");
  revalidatePath("/app/perfil");
  revalidatePath("/app/estrategias");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/estrategias");

  return { success: "Briefing do negocio salvo com sucesso." };
}

