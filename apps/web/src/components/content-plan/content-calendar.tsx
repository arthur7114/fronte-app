"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/lib/strategies"

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

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
}

function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: CalendarDay[] = []

  // Padding from previous month
  for (let i = 0; i < firstDay.getDay(); i++) {
    const d = new Date(year, month, -firstDay.getDay() + 1 + i)
    days.push({ date: d, isCurrentMonth: false })
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true })
  }

  // Padding to complete last row
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
  }

  return days
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function eventDate(event: CalendarEvent): Date {
  // Real events use Unix ms timestamp; mock data used day-of-month integers.
  // Values > 31 are guaranteed to be timestamps.
  if (event.date > 31) return new Date(event.date)
  // Fallback for any residual mock data: treat as current-month day
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), event.date)
}

type ContentCalendarProps = {
  events?: CalendarEvent[]
  strategyName?: string
}

export function ContentCalendar({ events = [], strategyName }: ContentCalendarProps) {
  const today = new Date()
  const [current, setCurrent] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = current.getFullYear()
  const month = current.getMonth()
  const calendarDays = buildCalendarDays(year, month)

  function prevMonth() {
    setCurrent(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrent(new Date(year, month + 1, 1))
  }

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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mês anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center font-medium">
                {MONTH_NAMES[month]} {year}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Próximo mês">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button asChild className="gap-2">
              <Link href="/dashboard/artigos/novo">
                <Plus className="h-4 w-4" />
                Agendar
              </Link>
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
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, index) => {
              const dayEvents = events.filter((e) => isSameDay(eventDate(e), dayInfo.date))
              const isToday = isSameDay(dayInfo.date, today)

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
                    {dayInfo.date.getDate()}
                  </div>

                  {dayEvents.map((content) => (
                    <Link
                      key={content.id}
                      href={`/dashboard/artigos/${content.id}`}
                      className={cn(
                        "mt-1 block cursor-pointer rounded-md p-2 text-xs transition-all hover:shadow-md",
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
                    </Link>
                  ))}
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
