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
