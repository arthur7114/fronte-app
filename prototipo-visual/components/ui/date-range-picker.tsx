"use client"

import * as React from "react"
import { CalendarIcon, Check } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type DateRangePickerProps = {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  align?: "start" | "center" | "end"
}

type Preset = {
  label: string
  getValue: () => DateRange
}

const presets: Preset[] = [
  {
    label: "Hoje",
    getValue: () => {
      const today = new Date()
      return { from: today, to: today }
    },
  },
  {
    label: "Últimos 7 dias",
    getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "Últimos 30 dias",
    getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "Últimos 90 dias",
    getValue: () => ({ from: subDays(new Date(), 89), to: new Date() }),
  },
  {
    label: "Este mês",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Este ano",
    getValue: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
]

function rangesEqual(a?: DateRange, b?: DateRange) {
  if (!a || !b || !a.from || !b.from || !a.to || !b.to) return false
  return (
    a.from.toDateString() === b.from.toDateString() &&
    a.to.toDateString() === b.to.toDateString()
  )
}

export function DateRangePicker({
  value,
  onChange,
  className,
  align = "end",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState<DateRange | undefined>(
    value ?? presets[2].getValue()
  )

  const range = value ?? internal

  const handleChange = (next: DateRange | undefined) => {
    setInternal(next)
    onChange?.(next)
  }

  const activePreset = presets.find((p) => rangesEqual(p.getValue(), range))

  const label = React.useMemo(() => {
    if (activePreset) return activePreset.label
    if (range?.from && range?.to) {
      if (range.from.toDateString() === range.to.toDateString()) {
        return format(range.from, "d 'de' MMM yyyy", { locale: ptBR })
      }
      return `${format(range.from, "d MMM", { locale: ptBR })} - ${format(
        range.to,
        "d MMM yyyy",
        { locale: ptBR }
      )}`
    }
    if (range?.from) return format(range.from, "d MMM yyyy", { locale: ptBR })
    return "Selecionar período"
  }, [activePreset, range])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("gap-2 justify-start font-normal", className)}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-row sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-border p-3 overflow-x-auto">
            {presets.map((preset) => {
              const isActive =
                activePreset?.label === preset.label && !!range?.from
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    handleChange(preset.getValue())
                  }}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-left transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {isActive ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="h-3.5 w-3.5" />
                  )}
                  {preset.label}
                </button>
              )
            })}
          </div>
          <div>
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={handleChange}
              locale={ptBR}
              defaultMonth={range?.from}
            />
            <div className="flex items-center justify-end gap-2 border-t border-border p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleChange(undefined)
                }}
              >
                Limpar
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
