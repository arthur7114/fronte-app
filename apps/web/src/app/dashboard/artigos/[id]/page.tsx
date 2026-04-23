import { notFound, redirect } from "next/navigation"
import { getAuthContext } from "@/lib/auth-context"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { ArticleEditor, type PostWithGeneration } from "@/components/articles/article-editor"

export const metadata = {
  title: "Editor de Artigo | Next.js",
}

type DbClient = Awaited<ReturnType<typeof getServerSupabaseClient>>

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { tenant } = await getAuthContext()
  const { id } = await params

  if (!tenant) {
    redirect("/login")
  }

  const db = (getOptionalAdminSupabaseClient() as DbClient | null) ?? (await getServerSupabaseClient())
  
  const { data, error } = await db
    .from("posts")
    .select("*, article_generations(*)")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single()
  const post = data as PostWithGeneration | null

  if (error || !post) {
    notFound()
  }

  return (
    <div className="p-4 md:p-8">
      <ArticleEditor 
        articleId={post.id} 
        initialData={post}
        isNew={post.status === "draft" && Boolean(post.generation_id)}
        onBackUrl="/dashboard/artigos"
      />
    </div>
  )
}
