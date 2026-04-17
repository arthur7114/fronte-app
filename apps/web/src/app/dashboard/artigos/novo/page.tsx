import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PostEditorPanel } from "@/components/post-editor-panel";
import { getAuthContext } from "@/lib/auth-context";

export default async function NewArticlePage() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Artigos"
        title="Abra um novo rascunho."
        description="O editor reaproveita a base atual, agora dentro da rota canonica do dashboard."
      />
      <PostEditorPanel mode="new" />
    </div>
  );
}
