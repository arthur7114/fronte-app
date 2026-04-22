"use server"

import { getServerSupabaseClient } from "@/lib/supabase/server"
import { getAuthContext } from "@/lib/auth-context"
import { revalidatePath } from "next/cache"
import type { NewsletterConfig } from "@/lib/newsletter-server"

export async function saveNewsletterConfigAction(data: Omit<NewsletterConfig, "id" | "tenant_id" | "created_at" | "updated_at">) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Unauthorized")

  const supabase = await getServerSupabaseClient()

  // UPSERT configuration
  const { error } = await supabase
    .from("newsletter_configs")
    // @ts-expect-error - Expected infer type
    .upsert(
      {
        tenant_id: tenant.id,
        ...data,
      },
      { onConflict: "tenant_id" }
    )

  if (error) {
    console.error("Failed to save newsletter config:", error)
    throw new Error("Failed to save configuration")
  }

  revalidatePath("/app/newsletter")
  revalidatePath("/dashboard/newsletter")
}
