
"use client";

import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AiSuggestionCardProps = {
  title: string;
  suggestion?: string | string[];
  isLoading?: boolean;
  onApply: (value: string | string[]) => void;
  className?: string;
};

export function AiSuggestionCard({
  title,
  suggestion,
  isLoading,
  onApply,
  className,
}: AiSuggestionCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all animate-in fade-in slide-in-from-right-4",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Sugestão da IA
        </span>
      </div>

      <h4 className="text-sm font-medium text-foreground mb-2">{title}</h4>

      {isLoading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground italic">
          <Loader2 className="h-4 w-4 animate-spin" />
          Pensando em algo estratégico...
        </div>
      ) : suggestion ? (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {Array.isArray(suggestion) ? (
              <ul className="list-disc list-inside space-y-1">
                {suggestion.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>{suggestion}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2 border-primary/20 bg-background text-primary hover:bg-primary hover:text-white"
            onClick={() => onApply(suggestion)}
          >
            Aplicar sugestão
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Preencha os campos acima para que eu possa te ajudar com ideias.
        </p>
      )}
    </div>
  );
}
