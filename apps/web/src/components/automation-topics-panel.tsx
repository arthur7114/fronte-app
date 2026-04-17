"use client";

import {
  moderateTopicCandidate,
  enqueueTopicResearch,
  type TopicModerationState,
  type ResearchTopicsState,
} from "@/app/app/estrategias/actions";
import { useActionState, useState } from "react";
import type { Tables } from "@super/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Topic = Tables<"topic_candidates"> & { justification?: string | null };
type Strategy = Tables<"strategies">;

type AutomationTopicsPanelProps = {
  topics: Topic[];
  strategies?: Strategy[];
  briefs?: any[];
};

const initialModerationState: TopicModerationState = {};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="gap-1.5 bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprovado
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="gap-1.5 bg-red-100 text-red-700 hover:bg-red-100">
          <XCircle className="h-3.5 w-3.5" />
          Rejeitado
        </Badge>
      );
    default:
      return (
        <Badge className="gap-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="h-3.5 w-3.5" />
          Pendente
        </Badge>
      );
  }
}

function scoreLabel(score: number | null): { label: string; cls: string } {
  if (score === null) return { label: "â€”", cls: "text-muted-foreground" };
  if (score >= 80) return { label: `${score}`, cls: "text-green-600 font-semibold" };
  if (score >= 50) return { label: `${score}`, cls: "text-amber-600 font-semibold" };
  return { label: `${score}`, cls: "text-red-500 font-semibold" };
}

// â”€â”€â”€ Strategy chip row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StrategyChips({
  strategies,
  activeId,
  onChange,
  topics,
}: {
  strategies: Strategy[];
  activeId: string | null;
  onChange: (id: string | null) => void;
  topics: Topic[];
}) {
  if (strategies.length === 0) return null;

  const countFor = (strategyId: string | null) =>
    topics.filter((t) =>
      strategyId === "__none__"
        ? t.strategy_id === null
        : t.strategy_id === strategyId
    ).length;

  const chips: { id: string | null; label: string; count: number }[] = [
    { id: null, label: "Todas", count: topics.length },
    ...strategies.map((s) => ({
      id: s.id,
      label: s.name,
      count: countFor(s.id),
    })),
    ...(topics.some((t) => t.strategy_id === null)
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

// â”€â”€â”€ Topic Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TopicCard({
  topic,
  modAction,
  modPending,
  modState,
  strategies,
  brief,
}: {
  topic: Topic;
  modAction: (payload: FormData) => void;
  modPending: boolean;
  modState: TopicModerationState;
  strategies: Strategy[];
  brief: any | null;
}) {
  const feedbackMsg = modState.topicId === topic.id ? modState : null;
  const score = scoreLabel(topic.score);
  const isPending_ = topic.status === "pending";
  const strategy = strategies.find((s) => s.id === topic.strategy_id);

  return (
    <form action={modAction}>
      <input type="hidden" name="topic_id" value={topic.id} />

      <div
        className={cn(
          "rounded-xl border border-border p-5 transition-all hover:shadow-sm",
          topic.status === "approved" && "border-green-200 bg-green-50/30",
          topic.status === "rejected" && "opacity-60",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Metadata row */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {topic.scheduled_date && (
                <Badge variant="outline" className="gap-1 bg-white font-medium text-primary border-primary/20">
                  <Clock className="h-3 w-3" />
                  {new Intl.DateTimeFormat("pt-BR", { day: '2-digit', month: 'short' }).format(new Date(topic.scheduled_date))}
                </Badge>
              )}
              {topic.journey_stage && (
                <Badge variant="secondary" className="capitalize text-[10px] font-bold tracking-tight">
                  {topic.journey_stage}
                </Badge>
              )}
              {statusBadge(topic.status)}
              
              {/* Strategy label */}
              {strategy ? (
                <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                  {strategy.name}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-dashed border-border text-muted-foreground opacity-60">
                  Sem estratégia
                </Badge>
              )}
            </div>

            {/* Editable topic title */}
            {isPending_ ? (
              <textarea
                name="topic"
                defaultValue={topic.topic}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-base font-medium text-foreground outline-none transition-colors focus:border-primary"
              />
            ) : (
              <>
                <input type="hidden" name="topic" value={topic.topic} />
                <h3 className="text-base font-semibold text-foreground">
                  {topic.topic}
                </h3>
              </>
            )}

            {/* Rationale / Justification */}
            {topic.justification && (
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-black/40">
                  Racional Estratégico
                </p>
                <p className="mt-1 text-sm leading-relaxed text-black/60">
                  {topic.justification}
                </p>
              </div>
            )}

            {/* Briefing Data (Unified View) */}
            {brief && (
              <div className="mt-4 space-y-4 border-t border-black/5 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">Ângulo</span>
                    <p className="text-xs text-black/70">{brief.angle}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">Foco</span>
                    <p className="text-xs text-black/70">{brief.keywords?.[0] || "N/A"}</p>
                  </div>
                </div>

                {brief.suggested_structure && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">Estrutura Sugerida</span>
                    <div className="mt-2 space-y-1 rounded-lg bg-black/[0.02] p-3">
                      {(brief.suggested_structure as any).sections?.map((section: any, idx: number) => (
                        <div key={idx} className="flex gap-2 text-[11px] text-black/60">
                          <span className="font-bold text-primary">H{section.level || 2}</span>
                          <span>{section.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Score */}
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Match</p>
            <p className={cn("text-xl", score.cls)}>{score.label}%</p>
          </div>
        </div>

        {/* Feedback messages */}
        {feedbackMsg?.error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">{feedbackMsg.error}</p>
          </div>
        )}
        {feedbackMsg?.success && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700">{feedbackMsg.success}</p>
          </div>
        )}

        {/* Actions â€” only show for pending */}
        {isPending_ && (
          <div className="mt-4 flex gap-2 border-t border-border pt-4">
            <Button
              type="submit"
              name="intent"
              value="approve"
              disabled={modPending}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Aprovar Cronograma
            </Button>
            <Button
              type="submit"
              name="intent"
              value="reject"
              variant="ghost"
              disabled={modPending}
              className="gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              Ignorar
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}

// â”€â”€â”€ Main Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AutomationTopicsPanel({ 
  topics, 
  strategies = [],
  briefs = []
}: AutomationTopicsPanelProps) {
  const [modState, modAction, modPending] = useActionState(
    moderateTopicCandidate,
    initialModerationState
  );

  // Strategy filter â€” null = "Todas"
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);

  const [researchState, researchFormAction, isResearchPending] = useActionState(
    enqueueTopicResearch,
    {} as ResearchTopicsState,
  );


  // Compose filters
  const filteredTopics = topics.filter((t) => {
    if (activeStrategy === null) return true;
    if (activeStrategy === "__none__") return t.strategy_id === null;
    return t.strategy_id === activeStrategy;
  });

  const pendingCount = filteredTopics.filter((t) => t.status === "pending").length;
  const approvedCount = filteredTopics.filter((t) => t.status === "approved").length;
  const rejectedCount = filteredTopics.filter((t) => t.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Aguardando Plano
            </p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {pendingCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              No Calendário
            </p>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {approvedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Descartados
            </p>
            <p className="mt-2 text-3xl font-semibold text-muted-foreground">
              {rejectedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy chips */}
      {strategies.length > 0 && (
        <StrategyChips
          strategies={strategies}
          activeId={activeStrategy}
          onChange={setActiveStrategy}
          topics={topics}
        />
      )}

      {/* Topics list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Sugestões de Plano Editorial
            </CardTitle>
            {pendingCount > 0 && (
              <Badge className="gap-1.5 bg-amber-100 text-amber-700">
                <Clock className="h-3.5 w-3.5" />
                {pendingCount} aguardando
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            A IA sugeriu o seguinte plano com base nas suas palavras-chave aprovadas. 
            Cada tema inclui um racional estratégico e uma data sugerida.
          </p>

          {filteredTopics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {activeStrategy 
                  ? "Nenhum tópico encontrado para esta estratégia."
                  : "Plano editorial ainda não gerado. Certifique-se de aprovar suas palavras-chave na aba Estratégia primeiro."}
              </p>
              {activeStrategy && activeStrategy !== "__none__" && (
                <form action={researchFormAction} className="mt-4">
                  <input type="hidden" name="strategy_id" value={activeStrategy} />
                  <Button 
                    type="submit" 
                    disabled={isResearchPending}
                    className="gap-2"
                  >
                    {isResearchPending ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Gerar Temas com IA
                  </Button>
                  {researchState.error && (
                    <p className="mt-2 text-xs text-destructive">{researchState.error}</p>
                  )}
                  {researchState.success && (
                    <p className="mt-2 text-xs text-emerald-600">{researchState.success}</p>
                  )}
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTopics
                .sort((a, b) => {
                  if (a.scheduled_date && b.scheduled_date) {
                    return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
                  }
                  return 0;
                })
                .map((topic) => {
                  const brief = briefs.find(b => b.topic_candidate_id === topic.id) || null;
                  return (
                    <TopicCard 
                      key={topic.id} 
                      topic={topic} 
                      modAction={modAction} 
                      modPending={modPending} 
                      modState={modState} 
                      strategies={strategies}
                      brief={brief}
                    />
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

