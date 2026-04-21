"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const scheduledContent = [
  { date: 8, title: "10 Dicas para Dentes Brancos", status: "published" },
  { date: 12, title: "Quanto Custa um Implante", status: "scheduled" },
  { date: 15, title: "Clareamento Caseiro ou Consultorio", status: "scheduled" },
  { date: 19, title: "Sensibilidade Dental", status: "draft" },
  { date: 22, title: "Aparelho Invisivel: Guia", status: "scheduled" },
  { date: 26, title: "Cuidados Pos-Extracao", status: "draft" },
];

const statusColors = {
  published: "bg-green-500",
  scheduled: "bg-blue-500",
  draft: "bg-amber-500",
};

const statusLabels = {
  published: "Publicado",
  scheduled: "Agendado",
  draft: "Rascunho",
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function ContentCalendar() {
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const calendarDays = [
    ...Array.from({ length: 3 }, (_, index) => ({ day: 29 + index, isCurrentMonth: false })),
    ...Array.from({ length: 30 }, (_, index) => ({ day: index + 1, isCurrentMonth: true })),
    ...Array.from({ length: 4 }, (_, index) => ({ day: index + 1, isCurrentMonth: false })),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Calendario de Publicacao
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-lg border border-border p-1">
              {["week", "month"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode as "week" | "month")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode === "week" ? "Semana" : "Mes"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="min-w-[120px] text-center font-medium">Abril 2026</span>
              <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap items-center gap-6">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-full", statusColors[status as keyof typeof statusColors])} />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, index) => {
              const content = scheduledContent.find((item) => item.date === dayInfo.day && dayInfo.isCurrentMonth);
              const isToday = dayInfo.day === 10 && dayInfo.isCurrentMonth;
              return (
                <div
                  key={`${dayInfo.day}-${index}`}
                  className={cn(
                    "min-h-[100px] border-b border-r border-border p-2 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                    !dayInfo.isCurrentMonth && "bg-muted/20",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                      isToday ? "bg-primary font-semibold text-primary-foreground" : dayInfo.isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {dayInfo.day}
                  </div>
                  {content ? (
                    <div
                      className={cn(
                        "mt-1 cursor-pointer rounded-md p-2 text-xs transition-all hover:shadow-md",
                        content.status === "published" ? "bg-green-50 text-green-700" : content.status === "scheduled" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusColors[content.status as keyof typeof statusColors])} />
                        <span className="line-clamp-2 font-medium">{content.title}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-green-50 p-4 text-center"><p className="text-2xl font-semibold text-green-700">4</p><p className="text-sm text-green-600">Publicados</p></div>
          <div className="rounded-lg bg-blue-50 p-4 text-center"><p className="text-2xl font-semibold text-blue-700">3</p><p className="text-sm text-blue-600">Agendados</p></div>
          <div className="rounded-lg bg-amber-50 p-4 text-center"><p className="text-2xl font-semibold text-amber-700">2</p><p className="text-sm text-amber-600">Rascunhos</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
