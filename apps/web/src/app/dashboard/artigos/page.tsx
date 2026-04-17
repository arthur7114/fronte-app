import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PostsBoard } from "@/components/posts-board";
import { getAuthContext } from "@/lib/auth-context";
import { listPostsForSite } from "@/lib/post-data";

type ArticlesPageProps = {
  searchParams: Promise<{
    strategy?: string;
  }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Artigos"
        title="Sua mesa editorial."
        description="Lista global real, criacao e edicao permanecem reaproveitadas da base atual. Quando uma estrategia vier por query string, ela filtra o contexto de leitura sem forcar mudanca no modelo de dados."
        badge={params.strategy ? <span>Filtro contextual por estrategia</span> : <span>{site.subdomain}</span>}
      />
      <PostsBoard posts={posts} site={site} />
    </div>
  );
}
