"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, ChevronDown, Layers, Plus } from "lucide-react";
import type { Tables } from "@super/db";
import { createStrategy, type CreateStrategyState } from "@/app/app/estrategias/actions";

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
  automatic: "Automatico",
};

const STATUS_DOT: Record<Strategy["status"], string> = {
  active: "bg-emerald-500",
  configuring: "bg-yellow-500",
  paused: "bg-slate-400",
  archived: "bg-slate-300",
};

const initialCreateState: CreateStrategyState = {};

function CreateStrategyForm() {
  const [state, formAction, isPending] = useActionState(createStrategy, initialCreateState);

  return (
    <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-lg">
      <p className="mb-3 text-sm font-semibold text-foreground">Criar nova estrategia</p>
      <form action={formAction} className="space-y-3">
        <div>
          <label
            htmlFor="strategy-name"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Nome *
          </label>
          <input
            id="strategy-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={60}
            placeholder='ex: "SEO Local", "Captacao via Blog"'
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label
            htmlFor="strategy-focus"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
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

        {state.error ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Criando..." : "Criar estrategia"}
        </button>
      </form>
    </div>
  );
}

type StrategySelectorProps = {
  strategies: Strategy[];
};

export function StrategySelector({ strategies }: StrategySelectorProps) {
  const hasStrategies = strategies.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {hasStrategies
              ? `${strategies.length} estrategia${strategies.length > 1 ? "s" : ""} ativa${strategies.length > 1 ? "s" : ""}`
              : "Nenhuma estrategia criada ainda"}
          </span>
        </div>

        <details className="group relative">
          <summary
            className="flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            aria-label="Nova estrategia"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova estrategia
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <CreateStrategyForm />
        </details>
      </div>

      {hasStrategies ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <Link
              key={strategy.id}
              href={`/dashboard/estrategia/${strategy.id}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:border-black/20 hover:shadow-lg"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                  {strategy.name}
                </p>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[strategy.status]}`} />
                  {STATUS_LABELS[strategy.status]}
                </span>
              </div>

              {strategy.focus ? (
                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{strategy.focus}</p>
              ) : null}

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

                <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Acessar estrategia <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-8 text-center">
          <Layers className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">Crie sua primeira estrategia</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Uma estrategia define o foco editorial das suas palavras-chave e temas.
          </p>
        </div>
      )}
    </div>
  );
}
