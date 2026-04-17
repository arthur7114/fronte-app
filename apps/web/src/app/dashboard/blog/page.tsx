import Link from "next/link";
import { redirect } from "next/navigation";
import { Globe, LayoutTemplate, Palette, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsSitePanel } from "@/components/settings-site-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth-context";
import { listPostsForSite } from "@/lib/post-data";

export default async function BlogPage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  if (!site) {
    redirect("/onboarding/site");
  }

  const posts = await listPostsForSite(tenant.id, site.id);
  const publishedPosts = posts.filter((post) => post.status === "published");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Meu Blog"
        title="Preview, tema e configuracao editorial."
        description="A estrutura segue o prototipo: visualizacao, decisao de template, customizacao e settings no mesmo contexto. Onde ainda nao ha personalizacao real, o produto assume estado explicito em vez de mock canonico."
        actions={
          <Link
            href={`/blog/${site.subdomain}`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-95"
          >
            Abrir blog
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              Visualizacao do blog
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{site.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    /blog/{site.subdomain}
                  </p>
                </div>
                <Badge variant="outline">{publishedPosts.length} publicados</Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {publishedPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="rounded-lg border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-foreground">{post.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">/{post.slug}</p>
                  </div>
                ))}
                {publishedPosts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-white p-4 text-sm text-muted-foreground sm:col-span-2">
                    Nenhum artigo publicado ainda. O preview do blog fica completo assim que a
                    base ganhar os primeiros posts reais.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutTemplate className="h-5 w-5 text-primary" />
              Template atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>
              Tema ativo: <span className="font-semibold text-foreground">{site.theme_id}</span>
            </p>
            <p>
              Branding detalhado nao entra nesta fase. A pagina assume o tema real salvo na base
              e preserva a estrutura do prototipo para uma evolucao posterior.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-primary" />
              Customizacao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>
              Nome publico: <span className="font-semibold text-foreground">{site.name}</span>
            </p>
            <p>
              Idioma: <span className="font-semibold text-foreground">{site.language}</span>
            </p>
            <p>
              Nesta entrega, a prioridade e estrutural. Logo, cores, tipografia e assets avancados
              ficam registrados como prox́ima fase de branding sem forcar UI falsa agora.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Estado do modulo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>Publicacao e preview usam dados reais do site e dos posts.</p>
            <p>Template permanece padronizado ate a fase de branding.</p>
            <p>As configuracoes finais seguem abaixo na propria pagina.</p>
          </CardContent>
        </Card>
      </section>

      <SettingsSitePanel tenantName={tenant.name} site={site} />
    </div>
  );
}
