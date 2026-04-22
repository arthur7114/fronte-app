import { getServerSupabaseClient } from "./supabase/server"
import { getAuthContext } from "./auth-context"

export type NewsletterConfig = {
  id?: string
  tenant_id: string
  enabled: boolean
  title: string
  description: string
  cta_label: string
  success_message: string
  placement: string
  trigger_type: string
  trigger_value: number
  ask_name: boolean
  privacy_consent: boolean
  incentive: boolean
  incentive_text: string
}

export const defaultNewsletterConfig: Omit<NewsletterConfig, "tenant_id" | "id"> = {
  enabled: true,
  title: "Receba nossas dicas semanais",
  description: "Conteúdo exclusivo sobre saúde bucal direto no seu e-mail. Zero spam.",
  cta_label: "Quero receber",
  success_message: "Pronto! Confirme seu e-mail na caixa de entrada para começar.",
  placement: "inline",
  trigger_type: "scroll",
  trigger_value: 50,
  ask_name: true,
  privacy_consent: true,
  incentive: true,
  incentive_text: "Ganhe o e-book gratuito 'Sorriso Perfeito em 7 passos'",
}

export async function getNewsletterConfig(): Promise<NewsletterConfig> {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Unauthorized")

  const supabase = await getServerSupabaseClient()
  const { data, error } = await supabase
    .from("newsletter_configs")
    .select("*")
    .eq("tenant_id", tenant.id)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching newsletter config:", error)
  }

  if (data) {
    return data as NewsletterConfig
  }

  // Se não existir, retorna modelo padrao pra view
  return {
    tenant_id: tenant.id,
    ...defaultNewsletterConfig,
  }
}
