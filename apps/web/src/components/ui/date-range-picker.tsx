"use client";

import * as React from "react";
import { format, endOfMonth, startOfMonth, startOfYear, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Check } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
};

const presets = [
  { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: "Ultimos 7 dias", getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Ultimos 30 dias", getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "Ultimos 90 dias", getValue: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
  { label: "Este mes", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Este ano", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
] satisfies Array<{ label: string; getValue: () => DateRange }>;

function rangesEqual(a?: DateRange, b?: DateRange) {
  if (!a?.from || !a.to || !b?.from || !b.to) return false;
  return a.from.toDateString() === b.from.toDateString() && a.to.toDateString() === b.to.toDateString();
}

export function DateRangePicker({ value, onChange, className, align = "end" }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<DateRange | undefined>(value ?? presets[2].getValue());
  const range = value ?? internal;
  const activePreset = presets.find((preset) => rangesEqual(preset.getValue(), range));

  const label = React.useMemo(() => {
    if (activePreset) return activePreset.label;
    if (range?.from && range.to) {
      if (range.from.toDateString() === range.to.toDateString()) {
        return format(range.from, "d 'de' MMM yyyy", { locale: ptBR });
      }
      return `${format(range.from, "d MMM", { locale: ptBR })} - ${format(range.to, "d MMM yyyy", { locale: ptBR })}`;
    }
    if (range?.from) return format(range.from, "d MMM yyyy", { locale: ptBR });
    return "Selecionar periodo";
  }, [activePreset, range]);

  function handleChange(next: DateRange | undefined) {
    setInternal(next);
    onChange?.(next);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start gap-2 font-normal", className)}>
          <CalendarIcon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-row gap-1 overflow-x-auto border-b border-border p-3 sm:flex-col sm:border-b-0 sm:border-r">
            {presets.map((preset) => {
              const isActive = activePreset?.label === preset.label && !!range?.from;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleChange(preset.getValue())}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors",
                    isActive ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted",
                  )}
                >
                  {isActive ? <Check className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5" />}
                  {preset.label}
                </button>
              );
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
              <Button variant="ghost" size="sm" onClick={() => handleChange(undefined)}>
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
  );
}
