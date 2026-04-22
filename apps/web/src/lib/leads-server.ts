import "server-only"
import { getServerSupabaseClient } from "@/lib/supabase/server"

export type LeadOrigin = "popup" | "inline" | "cta" | "footer" | string
export type LeadStatus = "novo" | "engajado" | "inativo" | string
export type LeadInterest = "blog" | "dicas" | "promocoes" | "tudo" | string

export type Lead = {
  id: string
  email: string
  name?: string
  interest: LeadInterest
  origin: LeadOrigin
  status: LeadStatus
  createdAt: string // ISO
  sourceArticle?: string
}

export async function getLeadsForTenant(tenantId: string): Promise<Lead[]> {
  const supabase = await getServerSupabaseClient()

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch leads:", error)
    return []
  }

  return (data as any[]).map((contact) => ({
    id: contact.id,
    email: contact.email,
    name: contact.name || undefined,
    origin: contact.source || "inline",
    createdAt: contact.created_at,
    status: contact.status || "novo",
    interest: contact.interest || "tudo",
    sourceArticle: contact.source_article || undefined,
  }))
}
