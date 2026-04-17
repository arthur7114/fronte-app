import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SiteSetupPanel } from "@/components/site-setup-panel";
import { getAuthContext } from "@/lib/auth-context";
import { listPostsForSite } from "@/lib/post-data";

export default async function SitePage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/auth/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  const posts = site ? await listPostsForSite(tenant.id, site.id) : [];
  const publishedPosts = posts.filter((post) => post.status === "published").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Meu blog"
        title={site ? "Seu blog, do jeito que aparece para o cliente." : "Monte a casa publica do conteudo."}
        description="Preview, template, personalizacao e dominio ficam juntos aqui. A logica do produto continua a mesma; a experiencia agora segue a linguagem do prototipo."
        actions={
          site ? (
            <Link
              href={`/blog/${site.subdomain}`}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-95"
            >
              Abrir blog
            </Link>
          ) : null
        }
      />
      <SiteSetupPanel tenantName={tenant.name} site={site} publishedPosts={publishedPosts} />
    </div>
  );
}
