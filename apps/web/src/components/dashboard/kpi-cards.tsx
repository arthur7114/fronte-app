import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface KPIData {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  description: string
  icon: React.ElementType
}

interface KPICardsProps {
  data: KPIData[]
}

export function KPICards({ data }: KPICardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((kpi) => (
        <Card key={kpi.title} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              {kpi.trend && kpi.change && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                    kpi.trend === "up"
                      ? "bg-green-100 text-green-700"
                      : kpi.trend === "down"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  )}
                >
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : kpi.trend === "down" ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {kpi.change}
                </div>
              )}
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
