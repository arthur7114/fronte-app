import { redirect } from "next/navigation"

type LegacyStrategyDetailRouteProps = {
  params: Promise<{ id: string }>
}

export default async function LegacyStrategyDetailRoute({
  params,
}: LegacyStrategyDetailRouteProps) {
  const { id } = await params
  redirect(`/app/estrategias/${id}`)
}
