import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/auth-context"
import { listStrategiesFromDb } from "@/lib/strategies-server"
import { ArticleWizardClient } from "./client"

export const metadata = {
  title: "Novo Artigo | Next.js",
  description: "Assistente de criação de artigos com IA",
}

export default async function NewArticlePage() {
  const { tenant } = await getAuthContext()

  if (!tenant) {
    redirect("/login")
  }

  const strategies = await listStrategiesFromDb(tenant.id)

  return <ArticleWizardClient strategies={strategies} />
}
