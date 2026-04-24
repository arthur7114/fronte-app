import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAuthContext } from "@/lib/auth-context"
import {
  getStrategyFromDb,
  getStrategyStatsFromDb,
  countPostsForStrategyFromDb,
} from "@/lib/strategies-server"
import {
  listKeywordCandidatesForTenant,
  listTopicCandidatesForTenant,
} from "@/lib/automation-data"
import { StrategyDetailClient } from "./client"

export const metadata = {
  title: "Detalhes da Estratégia | Next.js",
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string; openSuggest?: string }>
}

export default async function StrategyDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const query = await searchParams
  const { tenant } = await getAuthContext()

  if (!tenant) {
    redirect("/login")
  }

  const strategy = await getStrategyFromDb(tenant.id, id)

  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-medium text-foreground">
          Estratégia não encontrada
        </p>
        <Button asChild>
          <Link href="/dashboard/estrategias">Ver todas as estratégias</Link>
        </Button>
      </div>
    )
  }

  const [stats, keywords, topics, postsCount] = await Promise.all([
    getStrategyStatsFromDb(tenant.id, id),
    listKeywordCandidatesForTenant(tenant.id, id),
    listTopicCandidatesForTenant(tenant.id).then((result) =>
      result.filter((topic) => topic.strategy_id === id),
    ),
    countPostsForStrategyFromDb(tenant.id, id),
  ])

  return (
    <StrategyDetailClient
      strategy={strategy}
      stats={stats}
      keywords={keywords}
      topics={topics}
      postsCount={postsCount}
      initialTab={query?.tab}
      openSuggestTopics={query?.openSuggest === "1"}
    />
  )
}
