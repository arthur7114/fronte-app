"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import {
  enqueueKeywordStrategy,
  moderateKeywordCandidate,
  type KeywordStrategyState,
  type KeywordModerationState,
} from "@/app/app/automation/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  Target,
  Filter,
  ArrowRight,
  Tooltip,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AutomationKeywordsPanelProps = {
  keywords: Tables<"keyword_candidates">[];
};

const initialStrategyState: KeywordStrategyState = {};
const initialModerationState: KeywordModerationState = {};

export function AutomationKeywordsPanel({ keywords }: AutomationKeywordsPanelProps) {
  const [strategyState, strategyAction, strategyPending] = useActionState(
    enqueueKeywordStrategy,
    initialStrategyState,
  );
  const [modState, modAction, modPending] = useActionState(
    moderateKeywordCandidate,
    initialModerationState,
  );

  const [activeStage, setActiveStage] = useState<"all" | "top" | "middle" | "bottom">("all");

  const filteredKeywords = keywords.filter((k) =>
    activeStage === "all" ? true : k.journey_stage === activeStage
  );

  const pendingCount = keywords.filter((k) => k.status === "pending").length;

  const stageLabels = {
    top: "Consciência (Topo)",
    middle: "Consideração (Meio)",
    bottom: "Decisão (Fundo)",
  };

  const priorityColors = {
    high: "bg-red-100 text-red-600 border-red-200",
    medium: "bg-amber-100 text-amber-600 border-amber-200",
    low: "bg-blue-100 text-blue-600 border-blue-200",
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Estratégia de Keywords</h2>
          <p className="text-sm text-muted-foreground">
            Mapeamento completo da jornada de busca do seu cliente ideial.
          </p>
        </div>

        <form action={strategyAction}>
          <Button
            type="submit"
            disabled={strategyPending}
            className="gap-2 bg-primary text-primary-foreground hover:opacity-90"
          >
            {strategyPending ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Gerar Nova Estratégia
          </Button>
        </form>
      </div>

      {keywords.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
              <Search className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma estratégia gerada</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Utilize o briefing salvo para que nossa IA gere as 30-50 palavras-chave mais
              estratégicas para o seu negócio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Filters/Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: "all", label: "Tudo", icon: Filter },
              { id: "top", label: "Topo", icon: Sparkles },
              { id: "middle", label: "Meio", icon: Target },
              { id: "bottom", label: "Fundo", icon: Zap },
            ].map((stage) => (
              <Button
                key={stage.id}
                variant={activeStage === stage.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveStage(stage.id as any)}
                className="gap-2 rounded-full px-4"
              >
                <stage.icon className="h-3.5 w-3.5" />
                {stage.label}
              </Button>
            ))}
          </div>

          {/* Keywords Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredKeywords.map((k) => (
              <Card
                key={k.id}
                className={cn(
                  "relative overflow-hidden transition-all hover:shadow-md",
                  k.status === "approved" && "border-green-200 bg-green-50/10",
                  k.status === "rejected" && "opacity-50"
                )}
              >
                <CardContent className="pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-bold", priorityColors[k.priority as keyof typeof priorityColors])}>
                      {k.priority === 'high' ? 'Prioridade Alta' : k.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      {k.tail_type} tail
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold leading-tight text-foreground">
                    {k.keyword}
                  </h4>
                  
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {k.motivation}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        k.journey_stage === 'top' ? 'bg-blue-400' : 
                        k.journey_stage === 'middle' ? 'bg-amber-400' : 'bg-red-400'
                      )} />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {stageLabels[k.journey_stage as keyof typeof stageLabels]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {k.status === "pending" ? (
                        <>
                          <form action={modAction}>
                            <input type="hidden" name="keyword_id" value={k.id} />
                            <Button
                              type="submit"
                              name="intent"
                              value="approve"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                              disabled={modPending}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </form>
                          <form action={modAction}>
                            <input type="hidden" name="keyword_id" value={k.id} />
                            <Button
                              type="submit"
                              name="intent"
                              value="reject"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={modPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </form>
                        </>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          {k.status === "approved" ? "Aprovado" : "Rejeitado"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
