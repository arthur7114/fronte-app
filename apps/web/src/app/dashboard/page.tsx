import { KPICards } from "@/components/dashboard/kpi-cards"
import { ThisWeek } from "@/components/dashboard/this-week"
import { AISuggestions } from "@/components/dashboard/ai-suggestions"
import { PerformanceHighlights } from "@/components/dashboard/performance-highlights"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { getAuthContext } from "@/lib/auth-context"
import { getDashboardStatsFromDb } from "@/lib/dashboard-server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const { user, profile, tenant } = await getAuthContext()
  
  if (!user || !tenant) {
    redirect("/login")
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Líder"
  const stats = await getDashboardStatsFromDb(tenant.id)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Olá, {firstName}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Veja como seu conteúdo está performando e o que fazer em seguida.
          </p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Gerar Novo Artigo
        </Button>
      </div>

      {/* KPI Cards */}
      <KPICards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* This Week - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ThisWeek />
        </div>

        {/* AI Suggestions */}
        <div>
          <AISuggestions />
        </div>
      </div>

      {/* Performance Highlights */}
      <PerformanceHighlights />
    </div>
  )
}
