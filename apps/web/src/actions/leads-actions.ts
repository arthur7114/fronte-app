"use server"

import { getServerSupabaseClient } from "@/lib/supabase/server"
import { getAuthContext } from "@/lib/auth-context"
import { revalidatePath } from "next/cache"
import type { LeadStatus } from "@/lib/leads-server"

export async function updateLeadStatusAction(id: string, newStatus: LeadStatus) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Unauthorized")

  const supabase = await getServerSupabaseClient()

  const { error } = await supabase
    .from("contacts")
    // @ts-expect-error - Expected infer type
    .update({ status: newStatus })
    .eq("id", id)
    .eq("tenant_id", tenant.id)

  if (error) {
    console.error("Failed to update lead status:", error)
    throw new Error("Failed to update lead status")
  }

  revalidatePath("/app/leads")
  revalidatePath("/dashboard/leads")
}

export async function deleteLeadAction(id: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Unauthorized")

  const supabase = await getServerSupabaseClient()

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id)

  if (error) {
    console.error("Failed to delete lead:", error)
    throw new Error("Failed to delete lead")
  }

  revalidatePath("/app/leads")
  revalidatePath("/dashboard/leads")
}

export async function publicAddLeadAction(data: {
  email: string
  name?: string
  interest: string
  origin: string
  sourceArticle?: string
}) {
  const supabase = await getServerSupabaseClient()
  
  const DEMO_TENANT_ID = "a4339ce5-03ae-46f4-95d3-f69126f428db"

  const { error } = await supabase
    .from("contacts")
    // @ts-expect-error - Expected infer type
    .insert({
      tenant_id: DEMO_TENANT_ID,
      email: data.email,
      name: data.name,
      interest: data.interest,
      source: data.origin,
      source_article: data.sourceArticle,
      status: "novo",
    })

  if (error) {
    console.error("Failed to add public lead:", error)
    throw new Error("Failed to capture lead")
  }
}
