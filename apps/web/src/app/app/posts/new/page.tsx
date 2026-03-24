import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PostEditorPanel } from "@/components/post-editor-panel";
import { getAuthContext } from "@/lib/auth-context";

export default async function NewPostPage() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conteudo"
        title="Abra um novo rascunho."
        description="O editor ja nasce com titulo, slug, conteudo e a barra de acoes editoriais necessaria para o ritmo do MVP."
      />
      <PostEditorPanel mode="new" />
    </div>
  );
}
