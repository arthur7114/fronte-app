"use client";
import Link from "next/link";

import { useActionState } from "react";
import { Plus, Layers, ChevronDown, Zap, Sparkles, ArrowRight } from "lucide-react";
import type { Tables } from "@super/db";
import {
  createStrategy,
  enqueueKeywordStrategy,
  enqueueTopicResearch,
  type CreateStrategyState,
  type KeywordStrategyState,
  type ResearchTopicsState,
} from "@/app/app/estrategias/actions";

type Strategy = Tables<"strategies">;

const STATUS_LABELS: Record<Strategy["status"], string> = {
  active: "Ativa",
  configuring: "Configurando",
  paused: "Pausada",
  archived: "Arquivada",
};

const MODE_LABELS: Record<Strategy["operation_mode"], string> = {
  manual: "Manual",
  assisted: "Assistido",
  automatic: "Automático",
};

const STATUS_DOT: Record<Strategy["status"], string> = {
  active: "bg-emerald-500",
  configuring: "bg-yellow-500",
  paused: "bg-slate-400",
  archived: "bg-slate-300",
};

// â”€â”€â”€ Generate Keywords Button (one per strategy card) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const initialEnqueueState: KeywordStrategyState = {};

function GenerateKeywordsButton({ strategyId }: { strategyId: string }) {
  const [state, formAction, isPending] = useActionState(enqueueKeywordStrategy, initialEnqueueState);

  return (
    <form action={formAction}>
      <input type="hidden" name="strategy_id" value={strategyId} />
      {state.error && (
        <p className="mb-1.5 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="mb-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400">
          {state.success}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        title="Gerar keywords com IA para esta estratégia"
        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
      >
        <Zap className="h-3 w-3" />
        {isPending ? "Enfileirando..." : "Gerar keywords"}
      </button>
    </form>
  );
}

const initialResearchState: ResearchTopicsState = {};

function ResearchTopicsButton({ strategyId }: { strategyId: string }) {
  const [state, formAction, isPending] = useActionState(enqueueTopicResearch, initialResearchState);

  return (
    <form action={formAction}>
      <input type="hidden" name="strategy_id" value={strategyId} />
      {state.error && (
        <p className="mb-1.5 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="mb-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400">
          {state.success}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        title="Pesquisar temas (pautas) para as keywords aprovadas desta estratégia"
        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
      >
        <Sparkles className="h-3 w-3 text-amber-500" />
        {isPending ? "Pesquisando..." : "Pesquisar Temas"}
      </button>
    </form>
  );
}

// â”€â”€â”€ Create Strategy Form (dropdown) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const initialCreateState: CreateStrategyState = {};

function CreateStrategyForm() {
  const [state, formAction, isPending] = useActionState(createStrategy, initialCreateState);

  return (
    <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-lg">
      <p className="mb-3 text-sm font-semibold text-foreground">Criar nova estratégia</p>
      <form action={formAction} className="space-y-3">
        <div>
          <label htmlFor="strategy-name" className="mb-1 block text-xs font-medium text-muted-foreground">
            Nome *
          </label>
          <input
            id="strategy-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={60}
            placeholder='ex: "SEO Local", "Captação via Blog"'
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="strategy-focus" className="mb-1 block text-xs font-medium text-muted-foreground">
            Foco (opcional)
          </label>
          <input
            id="strategy-focus"
            name="focus"
            type="text"
            maxLength={120}
            placeholder="ex: atrair pacientes locais com dor no joelho"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {state.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{state.error}</p>
        )}
        {state.success && (
          <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Criando..." : "Criar estratégia"}
        </button>
      </form>
    </div>
  );
}

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Props = {
  strategies: Strategy[];
};

export function StrategySelector({ strategies }: Props) {
  const hasStrategies = strategies.length > 0;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {hasStrategies
              ? `${strategies.length} estratégia${strategies.length > 1 ? "s" : ""} ativa${strategies.length > 1 ? "s" : ""}`
              : "Nenhuma estratégia criada ainda"}
          </span>
        </div>

        {/* New Strategy inline form trigger */}
        <details className="relative group">
          <summary
            className="flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            aria-label="Nova estratégia"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova estratégia
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-open:rotate-180 transition-transform" />
          </summary>
          <CreateStrategyForm />
        </details>
      </div>

      {/* Strategy cards */}
      {hasStrategies && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <Link
              key={strategy.id}
              href={`/app/estrategias/${strategy.id}/overview`}
              className="flex flex-col group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-lg hover:border-black/20 hover:-translate-y-1"
            >
              {/* Card header */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{strategy.name}</p>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[strategy.status]}`} />
                  {STATUS_LABELS[strategy.status]}
                </span>
              </div>

              {strategy.focus && (
                <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{strategy.focus}</p>
              )}

              {/* Card footer */}
              <div className="mt-auto space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    IA: {MODE_LABELS[strategy.operation_mode]}
                  </span>
                  <time className="text-xs text-muted-foreground" dateTime={strategy.created_at}>
                    {new Date(strategy.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </time>
                </div>

                <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Acessar Estratégia <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>

          ))}
        </div>
      )}

      {!hasStrategies && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-8 text-center">
          <Layers className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">Crie sua primeira estratégia</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Uma estratégia define o foco editorial das suas palavras-chave e temas.
          </p>
        </div>
      )}
    </div>
  );
}


