"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/lib/strategies"
import { CALENDAR_EVENTS } from "@/lib/strategies"

const statusColors = {
  published: "bg-green-500",
  scheduled: "bg-blue-500",
  draft: "bg-amber-500",
}

const statusLabels = {
  published: "Publicado",
  scheduled: "Agendado",
  draft: "Rascunho",
}

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

type ContentCalendarProps = {
  events?: CalendarEvent[]
  strategyName?: string
}

export function ContentCalendar({
  events = CALENDAR_EVENTS,
  strategyName,
}: ContentCalendarProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("month")
  const [currentMonth] = useState("Abril 2026")

  // Generate calendar days (simplified for demo)
  const generateCalendarDays = () => {
    const days: { day: number; isCurrentMonth: boolean }[] = []
    for (let i = 0; i < 3; i++) days.push({ day: 29 + i, isCurrentMonth: false })
    for (let i = 1; i <= 30; i++) days.push({ day: i, isCurrentMonth: true })
    for (let i = 1; i <= 4; i++) days.push({ day: i, isCurrentMonth: false })
    return days
  }

  const calendarDays = generateCalendarDays()

  const publishedCount = events.filter((e) => e.status === "published").length
  const scheduledCount = events.filter((e) => e.status === "scheduled").length
  const draftCount = events.filter((e) => e.status === "draft").length

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Calendário de Publicação
              {strategyName && (
                <Badge variant="secondary" className="ml-1 font-normal">
                  {strategyName}
                </Badge>
              )}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Agende e acompanhe as publicações da estratégia
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border p-1">
              <button
                onClick={() => setViewMode("week")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  viewMode === "week"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  viewMode === "month"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Mês
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Mês anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[120px] text-center font-medium">{currentMonth}</span>
              <Button variant="outline" size="icon" aria-label="Próximo mês">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agendar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-6 flex items-center gap-6">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-3 w-3 rounded-full",
                  statusColors[status as keyof typeof statusColors],
                )}
              />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="rounded-xl border border-border">
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, index) => {
              const content = events.find(
                (c) => c.date === dayInfo.day && dayInfo.isCurrentMonth,
              )
              const isToday = dayInfo.day === 10 && dayInfo.isCurrentMonth

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[100px] border-b border-r border-border p-2 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                    !dayInfo.isCurrentMonth && "bg-muted/20",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground"
                        : dayInfo.isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {dayInfo.day}
                  </div>

                  {content && (
                    <div
                      className={cn(
                        "mt-1 cursor-pointer rounded-md p-2 text-xs transition-all hover:shadow-md",
                        content.status === "published"
                          ? "bg-green-50 text-green-700"
                          : content.status === "scheduled"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            statusColors[content.status],
                          )}
                        />
                        <span className="line-clamp-2 font-medium">{content.title}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-2xl font-semibold text-green-700">{publishedCount}</p>
            <p className="text-sm text-green-600">Publicados</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-2xl font-semibold text-blue-700">{scheduledCount}</p>
            <p className="text-sm text-blue-600">Agendados</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-center">
            <p className="text-2xl font-semibold text-amber-700">{draftCount}</p>
            <p className="text-sm text-amber-600">Rascunhos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
