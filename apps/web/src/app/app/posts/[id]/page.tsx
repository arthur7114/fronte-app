import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PostEditorPanel } from "@/components/post-editor-panel";
import { getAuthContext } from "@/lib/auth-context";
import { POST_STATUS_LABELS } from "@/lib/post";
import { getPostForSite } from "@/lib/post-data";

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { user, membership, tenant, site } = await getAuthContext();
  const { id } = await params;

  if (!user) {
    redirect("/auth/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  if (!site) {
    redirect("/onboarding/site");
  }

  const post = await getPostForSite(tenant.id, site.id, id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conteudo"
        title={post.title}
        description="O editor reaproveita o mesmo fluxo do novo post, agora com contexto do documento, status atual e historico recente."
        badge={
          POST_STATUS_LABELS[post.status as keyof typeof POST_STATUS_LABELS] ?? post.status
        }
      />
      <PostEditorPanel post={post} mode="edit" />
    </div>
  );
}
