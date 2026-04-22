import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/auth-context"
import { listStrategiesFromDb, getStrategyStatsFromDb } from "@/lib/strategies-server"
import { EstrategiasListClient, type StrategyStatsMap } from "./client"

export const metadata = {
  title: "Estratégias | Next.js",
  description: "Gerencie suas estratégias de conteúdo",
}

export default async function EstrategiasPage() {
  const { tenant } = await getAuthContext()

  if (!tenant) {
    redirect("/login")
  }

  const initialStrategies = await listStrategiesFromDb(tenant.id)

  const statsMap: StrategyStatsMap = {}
  
  // Calculate stats in parallel for all strategies
  await Promise.all(
    initialStrategies.map(async (strategy) => {
      statsMap[strategy.id] = await getStrategyStatsFromDb(tenant.id, strategy.id)
    })
  )

  return (
    <EstrategiasListClient
      initialStrategies={initialStrategies}
      statsMap={statsMap}
    />
  )
}
