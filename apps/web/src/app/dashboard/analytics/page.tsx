import { getAuthContext } from "@/lib/auth-context"
import { getAnalyticsData } from "@/lib/analytics-server"
import { redirect } from "next/navigation"
import AnalyticsDashboardClient from "./analytics-client"

export const metadata = {
  title: "Analytics | Dashboard",
  description: "Acompanhe a performance do seu conteúdo — tráfego, conversões e visibilidade em IA.",
}

export default async function AnalyticsPage() {
  const { tenant } = await getAuthContext()
  if (!tenant) redirect("/login")

  const data = await getAnalyticsData(tenant.id)

  // Determine if we have any real data to show
  const hasData = data.seo.trafficOverTime.length > 0 || data.conversions.conversionOverTime.length > 0

  return <AnalyticsDashboardClient data={data} hasData={hasData} />
}
