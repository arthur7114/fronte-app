import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Users, FileText, Target, MousePointerClick } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardStats } from "@/lib/dashboard-server"

interface KPICardsProps {
  stats: DashboardStats
}

export function KPICards({ stats }: KPICardsProps) {
  // We format numbers larger than 10k into a "k" representation
  const formatCompact = (num: number) => {
    return Intl.NumberFormat("pt-BR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num)
  }

  const kpis = [
    {
      title: "Tráfego Mensal (Views)",
      value: formatCompact(stats.organicTraffic),
      change: "+23%",
      trend: "up",
      description: "Visualizações reportadas",
      icon: Users,
      tooltip: "Visualizações baseadas nas métricas agregadas dos artigos (Temporário)",
    },
    {
      title: "Artigos Publicados",
      value: stats.publishedArticles.toString(),
      change: "+3",
      trend: "up",
      description: "este mês",
      icon: FileText,
      tooltip: "Conteúdos publicados no seu blog",
    },
    {
      title: "Palavras Aprovadas",
      value: stats.keywordsRanked.toString(),
      change: "+12",
      trend: "up",
      description: "em validação",
      icon: Target,
      tooltip: "Termos aprovados de inteligência e pesquisa",
    },
    {
      title: "Leads Gerados",
      value: stats.conversions.toString(),
      change: "-5%",
      trend: "down",
      description: "contatos rastreados",
      icon: MousePointerClick,
      tooltip: "Pessoas que preencheram cadastros das suas pautas",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                  kpi.trend === "up"
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                )}
              >
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
