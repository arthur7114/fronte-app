import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Users, FileText, Target, MousePointerClick } from "lucide-react"
import { cn } from "@/lib/utils"

const kpis = [
  {
    title: "Tráfego Orgânico",
    value: "12.4K",
    change: "+23%",
    trend: "up",
    description: "visitantes este mês",
    icon: Users,
    tooltip: "Pessoas que encontraram seu site pelo Google",
  },
  {
    title: "Artigos Publicados",
    value: "24",
    change: "+3",
    trend: "up",
    description: "este mês",
    icon: FileText,
    tooltip: "Conteúdos publicados no seu blog",
  },
  {
    title: "Palavras Ranqueadas",
    value: "156",
    change: "+12",
    trend: "up",
    description: "no top 10 do Google",
    icon: Target,
    tooltip: "Termos que seu site aparece na primeira página",
  },
  {
    title: "Conversões",
    value: "89",
    change: "-5%",
    trend: "down",
    description: "cliques em CTAs",
    icon: MousePointerClick,
    tooltip: "Pessoas que clicaram nos seus botões de ação",
  },
]

export function KPICards() {
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
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
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
