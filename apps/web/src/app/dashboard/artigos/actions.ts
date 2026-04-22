"use server"

import { revalidatePath } from "next/cache"
import { getAuthContext } from "@/lib/auth-context"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { initializeArticleGeneration, ArticleBriefing } from "@/lib/article-agent"

function getDb() {
  return getOptionalAdminSupabaseClient() ?? getServerSupabaseClient()
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

  const { data: post, error: postErr } = await (db as any)
    .from("posts")
    .insert({
      tenant_id: tenant.id,
      site_id: site.id,
      title: briefing.topic,
      slug,
      status: "draft",
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
    return { success: true, generationId, postId: post.id }
  } catch (genErr: any) {
    return { error: genErr.message }
  }
}

export async function checkGenerationStatus(generationId: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Não autenticado.")
  
  const db = await getDb()
  const { data, error } = await (db as any)
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
  const { data, error } = await (db as any)
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

  const updateData: any = {
    approved_at: new Date().toISOString(),
  }

  if (scheduledFor) {
    updateData.scheduled_for = scheduledFor
    updateData.status = "scheduled"
  } else {
    updateData.status = "published"
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await (db as any)
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
