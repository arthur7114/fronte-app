import { KPICards } from "@/components/dashboard/kpi-cards"
import { ThisWeek } from "@/components/dashboard/this-week"
import { AISuggestions } from "@/components/dashboard/ai-suggestions"
import { PerformanceHighlights } from "@/components/dashboard/performance-highlights"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Olá, João!
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
      <KPICards />

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
