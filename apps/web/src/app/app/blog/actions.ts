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

const BLOG_TEMPLATES = ["minimal", "modern", "magazine", "bold"] as const;
const BLOG_FONTS = ["inter", "serif", "mono"] as const;
const BLOG_INTEGRATIONS = ["wordpress", "webflow", "custom"] as const;
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const LOGO_MIME_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

type BlogContext = {
  membership: NonNullable<Awaited<ReturnType<typeof getAuthContext>>["membership"]>;
  site: NonNullable<Awaited<ReturnType<typeof getAuthContext>>["site"]>;
  tenant: NonNullable<Awaited<ReturnType<typeof getAuthContext>>["tenant"]>;
};

function revalidateBlogPaths(site: Tables<"sites">, previousSubdomain?: string | null) {
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
  revalidatePath("/blog");
  revalidatePath(`/blog/${site.subdomain}`);

  if (previousSubdomain && previousSubdomain !== site.subdomain) {
    revalidatePath(`/blog/${previousSubdomain}`);
  }
}

async function requireBlogContext(): Promise<BlogContext | SiteState> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  if (!context.membership || !context.tenant) {
    redirect("/onboarding");
  }

  if (!context.site) {
    redirect("/app");
  }

  return {
    membership: context.membership,
    site: context.site,
    tenant: context.tenant,
  };
}

function isBlogContext(value: BlogContext | SiteState): value is BlogContext {
  return "site" in value;
}

function normalizeCustomDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

function getLogoExtension(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/svg+xml") return "svg";
  return null;
}

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

  revalidateBlogPaths(siteResult.data, previousSubdomain);

  if (flow === "onboarding") {
    redirect("/app/dashboard");
  }

  return { success: "Site salvo com sucesso." };
}

export async function saveBlogTemplate(
  _prevState: SiteState,
  formData: FormData,
): Promise<SiteState> {
  const context = await requireBlogContext();
  if (!isBlogContext(context)) return context;

  const themeId = String(formData.get("theme_id") ?? "");

  if (!BLOG_TEMPLATES.includes(themeId as (typeof BLOG_TEMPLATES)[number])) {
    return { error: "Escolha um template valido." };
  }

  const admin = getAdminSupabaseClient();
  const result = await admin
    .from("sites")
    .update({ theme_id: themeId })
    .eq("id", context.site.id)
    .eq("tenant_id", context.tenant.id)
    .select("*")
    .single();

  if (result.error || !result.data) {
    return { error: "Nao foi possivel salvar o template agora." };
  }

  revalidateBlogPaths(result.data);
  return { success: "Template salvo com sucesso." };
}

export async function saveBlogAppearance(
  _prevState: SiteState,
  formData: FormData,
): Promise<SiteState> {
  const context = await requireBlogContext();
  if (!isBlogContext(context)) return context;

  const primaryColor = String(formData.get("primary_color") ?? "").trim();
  const fontFamily = String(formData.get("font_family") ?? "").trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
    return { error: "Escolha uma cor principal valida." };
  }

  if (!BLOG_FONTS.includes(fontFamily as (typeof BLOG_FONTS)[number])) {
    return { error: "Escolha uma fonte valida." };
  }

  const admin = getAdminSupabaseClient();
  const logo = formData.get("logo");
  const payload: TablesUpdate<"sites"> = {
    primary_color: primaryColor,
    font_family: fontFamily,
  };

  if (logo instanceof File && logo.size > 0) {
    if (logo.size > MAX_LOGO_SIZE) {
      return { error: "O logo precisa ter no maximo 2MB." };
    }

    if (!LOGO_MIME_TYPES.includes(logo.type)) {
      return { error: "Envie um logo PNG, JPG ou SVG." };
    }

    const extension = getLogoExtension(logo.type);
    if (!extension) {
      return { error: "Formato de logo invalido." };
    }

    const logoPath = `${context.tenant.id}/logos/${context.site.id}-${Date.now()}.${extension}`;
    const uploadResult = await admin.storage.from("site-assets").upload(logoPath, logo, {
      contentType: logo.type,
      upsert: false,
    });

    if (uploadResult.error) {
      return { error: "Nao foi possivel enviar o logo agora." };
    }

    const publicUrl = admin.storage.from("site-assets").getPublicUrl(logoPath).data.publicUrl;
    payload.logo_path = logoPath;
    payload.logo_url = publicUrl;
  }

  const result = await admin
    .from("sites")
    .update(payload)
    .eq("id", context.site.id)
    .eq("tenant_id", context.tenant.id)
    .select("*")
    .single();

  if (result.error || !result.data) {
    return { error: "Nao foi possivel salvar a personalizacao agora." };
  }

  revalidateBlogPaths(result.data);
  return { success: "Personalizacao salva com sucesso." };
}

export async function saveBlogDomain(
  _prevState: SiteState,
  formData: FormData,
): Promise<SiteState> {
  const context = await requireBlogContext();
  if (!isBlogContext(context)) return context;

  const validation = validateSiteInput(
    String(formData.get("name") ?? context.site.name),
    String(formData.get("language") ?? context.site.language),
    String(formData.get("subdomain") ?? context.site.subdomain),
  );

  if (!validation.ok) {
    return { error: validation.error };
  }

  const customDomain = normalizeCustomDomain(String(formData.get("custom_domain") ?? ""));
  if (customDomain && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(customDomain)) {
    return { error: "Informe um dominio personalizado valido." };
  }

  const admin = getAdminSupabaseClient();
  const duplicateResult = await admin
    .from("sites")
    .select("id")
    .eq("subdomain", validation.value.subdomain)
    .maybeSingle();

  if (duplicateResult.error) {
    return { error: "Nao foi possivel validar o subdominio agora." };
  }

  if (duplicateResult.data && duplicateResult.data.id !== context.site.id) {
    return { error: "Esse subdominio ja esta em uso." };
  }

  const previousSubdomain = context.site.subdomain;
  const result = await admin
    .from("sites")
    .update({
      name: validation.value.name,
      language: validation.value.language,
      subdomain: validation.value.subdomain,
      custom_domain: customDomain || null,
      custom_domain_status: customDomain ? "pending_dns" : "none",
    } satisfies TablesUpdate<"sites">)
    .eq("id", context.site.id)
    .eq("tenant_id", context.tenant.id)
    .select("*")
    .single();

  if (result.error || !result.data) {
    return { error: "Nao foi possivel salvar as configuracoes de dominio agora." };
  }

  revalidateBlogPaths(result.data, previousSubdomain);
  return { success: "Dominio salvo com sucesso." };
}

export async function saveSiteIntegration(
  _prevState: SiteState,
  formData: FormData,
): Promise<SiteState> {
  const context = await requireBlogContext();
  if (!isBlogContext(context)) return context;

  const provider = String(formData.get("provider") ?? "");
  if (!BLOG_INTEGRATIONS.includes(provider as (typeof BLOG_INTEGRATIONS)[number])) {
    return { error: "Escolha uma integracao valida." };
  }

  const endpoint = String(formData.get("endpoint") ?? "").trim();
  const apiKey = String(formData.get("api_key") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!endpoint) {
    return { error: "Informe a URL ou endpoint da integracao." };
  }

  const now = new Date().toISOString();
  const admin = getAdminSupabaseClient();
  const existingResult = await admin
    .from("site_integrations")
    .select("config")
    .eq("tenant_id", context.tenant.id)
    .eq("site_id", context.site.id)
    .eq("provider", provider)
    .maybeSingle();

  if (existingResult.error) {
    return { error: "Nao foi possivel carregar a integracao atual." };
  }

  const existingConfig =
    existingResult.data?.config &&
    typeof existingResult.data.config === "object" &&
    !Array.isArray(existingResult.data.config)
      ? existingResult.data.config as Record<string, unknown>
      : {};
  const existingApiKey = typeof existingConfig.api_key === "string" ? existingConfig.api_key : "";
  const nextApiKey = apiKey || existingApiKey;

  if ((provider === "wordpress" || provider === "webflow") && !nextApiKey) {
    return { error: "Informe a chave/API token para esta integracao." };
  }

  const config: Record<string, string | boolean> = {
    endpoint,
    has_api_key: Boolean(nextApiKey),
    notes,
  };

  if (nextApiKey) {
    config.api_key = nextApiKey;
  }

  const result = await admin
    .from("site_integrations")
    .upsert(
      {
        tenant_id: context.tenant.id,
        site_id: context.site.id,
        provider,
        status: "configured",
        config,
        updated_at: now,
      },
      { onConflict: "site_id,provider" },
    )
    .select("*")
    .single();

  if (result.error) {
    return { error: "Nao foi possivel salvar a integracao agora." };
  }

  revalidateBlogPaths(context.site);
  return { success: "Integracao salva com sucesso." };
}

