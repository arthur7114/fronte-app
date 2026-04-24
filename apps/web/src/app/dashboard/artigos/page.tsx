import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/auth-context"
import {
  listAutomationJobsForTenant,
  listContentBriefsForTenant,
  listTopicCandidatesForTenant,
} from "@/lib/automation-data"
import { getProductionProgress, toProductionQueueItems, toTopicItems } from "@/lib/job-feed"
import { listArticlesFromDb, listStrategiesFromDb } from "@/lib/strategies-server"
import { ArtigosClient } from "./client"

export const metadata = {
  title: "Artigos | Fronte",
  description: "Todos os artigos gerados por IA, agrupados por estratégia.",
}

interface ArtigosPageProps {
  searchParams?: Promise<{ strategy?: string }>
}

export default async function ArtigosPage({ searchParams }: ArtigosPageProps) {
  const { tenant } = await getAuthContext()
  const params = await searchParams

  if (!tenant) {
    redirect("/login")
  }

  const [articles, strategies, topics, briefs, jobs] = await Promise.all([
    listArticlesFromDb(tenant.id),
    listStrategiesFromDb(tenant.id),
    listTopicCandidatesForTenant(tenant.id),
    listContentBriefsForTenant(tenant.id),
    listAutomationJobsForTenant(tenant.id),
  ])

  const productionItems = toProductionQueueItems({ articles, jobs, topics, briefs, strategies })
  const productionProgress = getProductionProgress(productionItems, jobs)

  return (
    <ArtigosClient
      articles={articles}
      strategies={strategies}
      topics={toTopicItems(topics)}
      productionItems={productionItems}
      productionProgress={productionProgress}
      initialStrategyId={params?.strategy}
    />
  )
}
