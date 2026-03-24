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
        eyebrow="Conteudo"
        title="Posts e fluxo editorial."
        description="A operacao do CMS fica concentrada aqui: lista, abertura de rascunhos e acompanhamento do status sem sair do app."
      />
      <PostsBoard posts={posts} site={site} />
    </div>
  );
}
