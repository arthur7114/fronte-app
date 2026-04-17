"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import {
  moderateKeywordCandidate,
  type KeywordModerationState,
} from "@/app/app/estrategias/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Target,
  Filter,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Keyword = Tables<"keyword_candidates">;
type Strategy = Tables<"strategies">;

type AutomationKeywordsPanelProps = {
  keywords: Keyword[];
  jobs?: Tables<"automation_jobs">[];
  strategies?: Strategy[];
};

const initialModerationState: KeywordModerationState = {};

// â”€â”€â”€ Journey stage config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const JOURNEY_STAGES = [
  { id: "all", label: "Tudo", icon: Filter },
  { id: "awareness", label: "Consciência", icon: Sparkles },
  { id: "consideration", label: "Consideração", icon: Target },
  { id: "evaluation", label: "Avaliação", icon: Filter },
  { id: "decision", label: "Decisão", icon: Zap },
] as const;

type JourneyStageId = (typeof JOURNEY_STAGES)[number]["id"] | "top" | "middle" | "bottom";

const STAGE_LABELS: Record<string, string> = {
  awareness: "Consciência",
  consideration: "Consideração",
  evaluation: "Avaliação",
  decision: "Decisão",
  top: "Consciência (Topo)",
  middle: "Consideração (Meio)",
  bottom: "Decisão (Fundo)",
};

const STAGE_DOT: Record<string, string> = {
  awareness: "bg-blue-400",
  top: "bg-blue-400",
  consideration: "bg-amber-400",
  middle: "bg-amber-400",
  evaluation: "bg-violet-400",
  decision: "bg-red-400",
  bottom: "bg-red-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-600 border-red-200",
  medium: "bg-amber-100 text-amber-600 border-amber-200",
  low: "bg-blue-100 text-blue-600 border-blue-200",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

// â”€â”€â”€ Strategy chip row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StrategyChips({
  strategies,
  activeId,
  onChange,
  keywords,
}: {
  strategies: Strategy[];
  activeId: string | null;
  onChange: (id: string | null) => void;
  keywords: Keyword[];
}) {
  if (strategies.length === 0) return null;

  const countFor = (strategyId: string | null) =>
    keywords.filter((k) =>
      strategyId === "__none__"
        ? k.strategy_id === null
        : k.strategy_id === strategyId
    ).length;

  const chips: { id: string | null; label: string; count: number }[] = [
    { id: null, label: "Todas", count: keywords.length },
    ...strategies.map((s) => ({
      id: s.id,
      label: s.name,
      count: countFor(s.id),
    })),
    ...(keywords.some((k) => k.strategy_id === null)
      ? [{ id: "__none__", label: "Sem estratégia", count: countFor("__none__") }]
      : []),
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      <Layers className="mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      {chips.map((chip) => (
        <button
          key={chip.id ?? "__all__"}
          type="button"
          onClick={() => onChange(chip.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeId === chip.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {chip.label}
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              activeId === chip.id
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {chip.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// â”€â”€â”€ Keyword card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function KeywordCard({
  k,
  modAction,
  modPending,
  strategies,
}: {
  k: Keyword;
  modAction: (payload: FormData) => void;
  modPending: boolean;
  strategies: Strategy[];
}) {
  const strategy = strategies.find((s) => s.id === k.strategy_id);

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md",
        k.status === "approved" && "border-green-200 bg-green-50/10",
        k.status === "rejected" && "opacity-50"
      )}
    >
      <CardContent className="pt-5">
        {/* Priority + volume row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-wider font-bold",
                PRIORITY_COLORS[k.priority] ?? ""
              )}
            >
              {PRIORITY_LABELS[k.priority] ?? k.priority}
            </Badge>
            {k.search_volume && (
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] uppercase font-bold"
              >
                {k.search_volume}
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground uppercase font-medium">
            {k.tail_type} tail
          </span>
        </div>

        {/* Keyword */}
        <h4 className="text-lg font-semibold leading-tight text-foreground">{k.keyword}</h4>
        <p
          className="mt-2 line-clamp-2 text-xs text-muted-foreground"
          title={k.estimated_potential ?? undefined}
        >
          {k.motivation}
        </p>

        {/* SEO difficulty bar */}
        {k.difficulty !== undefined && k.difficulty !== null && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
              <span>Dificuldade SEO</span>
              <span
                className={cn(
                  k.difficulty > 70
                    ? "text-red-500"
                    : k.difficulty > 30
                      ? "text-amber-500"
                      : "text-green-500"
                )}
              >
                {k.difficulty}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full transition-all",
                  k.difficulty > 70
                    ? "bg-red-400"
                    : k.difficulty > 30
                      ? "bg-amber-400"
                      : "bg-green-400"
                )}
                style={{ width: `${k.difficulty}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer: stage + strategy badge + moderation */}
        <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
          {/* Stage + strategy */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  STAGE_DOT[k.journey_stage] ?? "bg-slate-400"
                )}
              />
              <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                {STAGE_LABELS[k.journey_stage] ?? k.journey_stage}
              </span>
            </div>

            {/* Strategy badge */}
            {strategy ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {strategy.name}
              </span>
            ) : (
              <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] text-muted-foreground/60">
                Sem estratégia
              </span>
            )}
          </div>

          {/* Moderation buttons */}
          <div className="flex items-center justify-end gap-1">
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
  );
}

// â”€â”€â”€ Main panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AutomationKeywordsPanel({
  keywords,
  jobs = [],
  strategies = [],
}: AutomationKeywordsPanelProps) {
  const [modState, modAction, modPending] = useActionState(
    moderateKeywordCandidate,
    initialModerationState
  );

  // Strategy filter â€” null = "Todas"
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);

  // Journey stage filter
  const [activeStage, setActiveStage] = useState<JourneyStageId>("all");

  // Composed filter
  const filteredKeywords = keywords.filter((k) => {
    const strategyMatch =
      activeStrategy === null
        ? true
        : activeStrategy === "__none__"
          ? k.strategy_id === null
          : k.strategy_id === activeStrategy;
    const stageMatch = activeStage === "all" ? true : k.journey_stage === activeStage;
    return strategyMatch && stageMatch;
  });

  // Suppress unused var warning â€” jobs kept in props for future use
  void jobs;

  return (
    <div className="space-y-6">
      {/* Panel title */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Keywords</h2>
        <p className="text-sm text-muted-foreground">
          Mapeamento completo da jornada de busca do seu cliente ideal.
        </p>
      </div>

      {/* Moderation feedback */}
      {modState.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 animate-in fade-in slide-in-from-top-1">
          {modState.error}
        </div>
      )}
      {modState.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 animate-in fade-in slide-in-from-top-1">
          {modState.success}
        </div>
      )}

      {keywords.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
              <Search className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma keyword gerada</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Crie uma estratégia acima e clique em{" "}
              <strong>Gerar keywords</strong> para que a IA gere as palavras-chave mais
              estratégicas para o seu negócio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Strategy chips â€” only when there are strategies */}
          {strategies.length > 0 && (
            <StrategyChips
              strategies={strategies}
              activeId={activeStrategy}
              onChange={setActiveStrategy}
              keywords={keywords}
            />
          )}

          {/* Journey stage chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {JOURNEY_STAGES.map((stage) => {
              const count =
                stage.id === "all"
                  ? filteredKeywords.length
                  : filteredKeywords.filter((k) => k.journey_stage === stage.id).length;
              return (
                <Button
                  key={stage.id}
                  variant={activeStage === stage.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveStage(stage.id as JourneyStageId)}
                  className="gap-2 rounded-full px-4"
                >
                  <stage.icon className="h-3.5 w-3.5" />
                  {stage.label}
                  {stage.id !== "all" && count > 0 && (
                    <span className="rounded-full bg-background/20 px-1.5 py-0.5 text-[10px] font-semibold">
                      {count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          {filteredKeywords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Nenhuma keyword para os filtros selecionados.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredKeywords.map((k) => (
                <KeywordCard
                  key={k.id}
                  k={k}
                  modAction={modAction}
                  modPending={modPending}
                  strategies={strategies}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

