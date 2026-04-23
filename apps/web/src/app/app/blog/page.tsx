import { redirect } from "next/navigation"
import type { Tables } from "@super/db"
import { BlogCustomization } from "@/components/blog/blog-customization"
import { BlogPreview } from "@/components/blog/blog-preview"
import { BlogSettings } from "@/components/blog/blog-settings"
import { TemplateSelector } from "@/components/blog/template-selector"
import { getAuthContext } from "@/lib/auth-context"
import { getAllPublicPosts } from "@/lib/blog-public-server"
import { getAdminSupabaseClient } from "@/lib/supabase/admin"

type PublicSiteIntegration = Omit<Tables<"site_integrations">, "config"> & {
  config: Record<string, unknown>
}

export default async function MeuBlogPage() {
  const { user, membership, tenant, site } = await getAuthContext()

  if (!user) {
    redirect("/login")
  }

  if (!membership || !tenant) {
    redirect("/onboarding")
  }

  if (!site) {
    redirect("/onboarding/site")
  }

  const admin = getAdminSupabaseClient()
  const [posts, integrationsResult] = await Promise.all([
    getAllPublicPosts(site.id),
    admin
      .from("site_integrations")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("site_id", site.id)
      .order("provider", { ascending: true }),
  ])

  const integrations: PublicSiteIntegration[] = (integrationsResult.data ?? []).map((integration) => {
    if (!integration.config || typeof integration.config !== "object" || Array.isArray(integration.config)) {
      return {
        ...integration,
        config: {},
      }
    }

    const publicConfig = { ...(integration.config as Record<string, unknown>) }
    delete publicConfig.api_key
    return {
      ...integration,
      config: publicConfig,
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Meu Blog
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure a aparencia, o endereco e as integracoes do seu blog.
        </p>
      </div>

      <BlogPreview
        siteName={site.name}
        subdomain={site.subdomain}
        logoUrl={site.logo_url}
        primaryColor={site.primary_color}
        fontFamily={site.font_family}
        posts={posts}
      />

      <TemplateSelector currentTemplate={site.theme_id} />

      <BlogCustomization
        logoUrl={site.logo_url}
        primaryColor={site.primary_color}
        fontFamily={site.font_family}
      />

      <BlogSettings site={site} integrations={integrations} />
    </div>
  )
}
