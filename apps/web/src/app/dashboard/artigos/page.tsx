import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/auth-context"
import { listArticlesFromDb, listStrategiesFromDb } from "@/lib/strategies-server"
import { ArtigosClient } from "./client"

export const metadata = {
  title: "Artigos | Fronte",
  description: "Todos os artigos gerados por IA, agrupados por estratégia.",
}

export default async function ArtigosPage() {
  const { tenant } = await getAuthContext()

  if (!tenant) {
  redirect("/login")
  }

  const [articles, strategies] = await Promise.all([
    listArticlesFromDb(tenant.id),
    listStrategiesFromDb(tenant.id),
  ])

  return <ArtigosClient articles={articles} strategies={strategies} />
}
