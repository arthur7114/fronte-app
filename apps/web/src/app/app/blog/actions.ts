"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables, TablesInsert, TablesUpdate } from "@super/db";
import { getAuthContext } from "@/lib/auth-context";
import { DEFAULT_SITE_THEME_ID, validateSiteInput } from "@/lib/site";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export type SiteState = {
  error?: string;
  success?: string;
};

export async function upsertSite(
  _prevState: SiteState,
  formData: FormData,
): Promise<SiteState> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  if (!context.membership || !context.tenant) {
    redirect("/onboarding");
  }

  const validation = validateSiteInput(
    String(formData.get("name") ?? ""),
    String(formData.get("language") ?? ""),
    String(formData.get("subdomain") ?? ""),
  );
  const flow = String(formData.get("flow") ?? "settings");

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

  if (duplicateResult.data && duplicateResult.data.id !== context.site?.id) {
    return { error: "Esse subdominio ja esta em uso." };
  }

  const previousSubdomain = context.site?.subdomain;
  const payload = {
    name: validation.value.name,
    language: validation.value.language,
    subdomain: validation.value.subdomain,
    tenant_id: context.membership.tenant_id,
    theme_id: context.site?.theme_id ?? DEFAULT_SITE_THEME_ID,
  };

  const siteResult = context.site
    ? ((await admin
        .from("sites")
        .update(payload satisfies TablesUpdate<"sites">)
        .eq("id", context.site.id)
        .eq("tenant_id", context.membership.tenant_id)
        .select("*")
        .single()) as {
        data: Tables<"sites"> | null;
        error: { code?: string; message: string } | null;
      })
    : ((await admin
        .from("sites")
        .insert(payload satisfies TablesInsert<"sites">)
        .select("*")
        .single()) as {
        data: Tables<"sites"> | null;
        error: { code?: string; message: string } | null;
      });

  if (siteResult.error || !siteResult.data) {
    if (siteResult.error?.code === "23505") {
      return { error: "Esse subdominio ja esta em uso." };
    }

    return { error: "Nao foi possivel salvar o blog agora." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/app");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/blog");
  revalidatePath("/app/configuracoes/site");
  revalidatePath("/app/artigos");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard/artigos");
  revalidatePath(`/blog/${siteResult.data.subdomain}`);

  if (previousSubdomain && previousSubdomain !== siteResult.data.subdomain) {
    revalidatePath(`/blog/${previousSubdomain}`);
  }

  if (flow === "onboarding") {
    redirect("/dashboard");
  }

  return { success: "Site salvo com sucesso." };
}

