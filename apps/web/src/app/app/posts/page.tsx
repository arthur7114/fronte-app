import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PostsBoard } from "@/components/posts-board";
import { getAuthContext } from "@/lib/auth-context";
import { listPostsForSite } from "@/lib/post-data";

export default async function PostsPage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/auth/login");
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
        title="Seu escritorio editorial."
        description="Aqui o time escreve, revisa, agenda e publica. O motor de IA prepara o terreno; a decisao final continua clara na mesa editorial."
        badge={<span>{site.subdomain}</span>}
      />
      <PostsBoard posts={posts} site={site} />
    </div>
  );
}
