import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/auth-context"
import { listArticlesFromDb, listStrategiesFromDb } from "@/lib/strategies-server"
import { CalendarioClient } from "./client"

export const metadata = {
  title: "Calendário | Fronte",
  description: "Visão consolidada do planejamento editorial.",
}

export default async function CalendarioPage() {
  const { tenant } = await getAuthContext()

  if (!tenant) {
    redirect("/login")
  }

  const [articles, strategies] = await Promise.all([
    listArticlesFromDb(tenant.id),
    listStrategiesFromDb(tenant.id),
  ])

  return <CalendarioClient articles={articles} strategies={strategies} />
}
