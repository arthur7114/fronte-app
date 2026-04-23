"use server"

import { revalidatePath } from "next/cache"
import type { TablesUpdate } from "@super/db"
import { getAuthContext } from "@/lib/auth-context"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { initializeArticleGeneration, type ArticleBriefing } from "@/lib/article-agent"
import { validatePostInput } from "@/lib/post"

export type SaveArticleDraftInput = {
  title: string
  metaDescription: string
  content: string
}

export type SaveArticleDraftResult = {
  success?: true
  error?: string
}

type DbError = {
  code?: string
  message: string
}

type DbResult<T> = {
  data: T | null
  error: DbError | null
}

type QueryBuilder<T = unknown> = PromiseLike<DbResult<T>> & {
  select(columns?: string): QueryBuilder<T>
  insert(values: unknown): QueryBuilder<T>
  update(values: unknown): QueryBuilder<T>
  eq(column: string, value: unknown): QueryBuilder<T>
  single(): Promise<DbResult<T>>
}

type DbClient = {
  from<T = unknown>(table: string): QueryBuilder<T>
}

type PostIdRow = {
  id: string
}

type PostEditorLookup = {
  id: string
  site_id: string
  slug: string
  status: string
}

async function getDb(): Promise<DbClient> {
  return (getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient())) as unknown as DbClient
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erro inesperado."
}

export async function startArticleWizard(strategyId: string | null, briefing: ArticleBriefing) {
  const { tenant, site } = await getAuthContext()
  if (!tenant) throw new Error("Não autenticado.")
  if (!site) throw new Error("Nenhum site configurado.")

  const db = await getDb()
  const now = new Date().toISOString()

  // 1. Create a draft post
  const slug = briefing.topic
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80)

  const { data: post, error: postErr } = await db
    .from<PostIdRow>("posts")
    .insert({
      tenant_id: tenant.id,
      site_id: site.id,
      title: briefing.topic,
      slug,
      status: "queued",
      strategy_id: strategyId,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single()

  if (postErr || !post) {
    return { error: `Erro ao criar rascunho: ${postErr?.message}` }
  }

  // 2. Initialize generation tracking
  try {
    const generationId = await initializeArticleGeneration(tenant.id, post.id, strategyId, briefing)
    return { success: true, generationId, postId: post.id, tenantId: tenant.id }
  } catch (genErr) {
    return { error: getErrorMessage(genErr) }
  }
}

export async function checkGenerationStatus(generationId: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Não autenticado.")
  
  const db = await getDb()
  const { data, error } = await db
    .from("article_generations")
    .select("*")
    .eq("id", generationId)
    .eq("tenant_id", tenant.id)
    .single()

  if (error || !data) {
    return { error: "Geração não encontrada" }
  }

  return { success: true, data }
}

export async function getPostData(postId: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Não autenticado.")
  
  const db = await getDb()
  const { data, error } = await db
    .from("posts")
    .select("*, article_generations(*)")
    .eq("id", postId)
    .eq("tenant_id", tenant.id)
    .single()

  if (error || !data) {
    return { error: "Post não encontrado" }
  }

  return { success: true, data }
}

export async function approveAndSchedulePost(postId: string, scheduledFor: string | null) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Não autenticado.")
  
  const db = await getDb()

  const updateData: TablesUpdate<"posts"> = {
    approved_at: new Date().toISOString(),
  }

  if (scheduledFor) {
    updateData.scheduled_for = scheduledFor
    updateData.status = "scheduled"
  } else {
    updateData.status = "published"
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await db
    .from("posts")
    .update(updateData)
    .eq("id", postId)
    .eq("tenant_id", tenant.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/app/artigos")
  revalidatePath("/app/calendario")
  revalidatePath("/dashboard/artigos")
  revalidatePath("/dashboard/calendario")
  revalidatePath("/blog")

  return { success: true }
}

export async function saveArticleDraft(
  postId: string,
  input: SaveArticleDraftInput,
): Promise<SaveArticleDraftResult> {
  const { tenant, site } = await getAuthContext()
  if (!tenant) return { error: "Não autenticado." }

  const db = await getDb()
  const { data: post, error: postError } = await db
    .from<PostEditorLookup>("posts")
    .select("id, site_id, slug, status")
    .eq("id", postId)
    .eq("tenant_id", tenant.id)
    .single()

  if (postError || !post) {
    return { error: "Post não encontrado." }
  }

  if (["queued", "generating", "publishing", "failed"].includes(post.status)) {
    return { error: "Este artigo não pode ser editado neste status." }
  }

  const validation = validatePostInput(input.title, post.slug, input.content)
  if (!validation.ok) {
    return { error: validation.error }
  }

  const now = new Date().toISOString()
  const postPayload = {
    title: validation.value.title,
    meta_title: validation.value.title,
    meta_description: input.metaDescription.trim() || null,
    content: validation.value.content,
    updated_at: now,
  } satisfies TablesUpdate<"posts">

  const updateResult = await db
    .from("posts")
    .update(postPayload)
    .eq("id", post.id)
    .eq("tenant_id", tenant.id)

  if (updateResult.error) {
    return { error: "Não foi possível salvar o rascunho agora." }
  }

  const revisionResult = await db.from("post_revisions").insert({
    post_id: post.id,
    content: validation.value.content,
  })

  if (revisionResult.error) {
    return { error: "O artigo foi salvo, mas a revisão não foi registrada." }
  }

  revalidatePath("/app/artigos")
  revalidatePath(`/app/artigos/${post.id}`)
  revalidatePath("/dashboard/artigos")
  revalidatePath(`/dashboard/artigos/${post.id}`)
  revalidatePath("/blog")
  revalidatePath(`/blog/${post.slug}`)

  if (site) {
    revalidatePath(`/blog/${site.subdomain}`)
    revalidatePath(`/blog/${site.subdomain}/${post.slug}`)
  }

  return { success: true }
}
