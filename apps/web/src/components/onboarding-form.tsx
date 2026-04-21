"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { createTenant, type OnboardingState } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeTenantSlug } from "@/lib/tenant";
import { cn } from "@/lib/utils";

const initialState: OnboardingState = {};

function StepProgress() {
  return (
    <div className="mb-12">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {[
          { label: "Criar conta", done: true },
          { label: "Workspace", active: true },
          { label: "Site" },
          { label: "Briefing" },
        ].map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            {index > 0 ? <div className={cn("h-px w-8", step.done || step.active ? "bg-primary" : "bg-border")} /> : null}
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                step.done ? "bg-primary/20 text-primary" : step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {step.done ? "✓" : index + 1}
            </span>
            <span className={cn(step.active ? "font-medium text-foreground" : "text-muted-foreground")}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(createTenant, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <div className="container mx-auto max-w-2xl px-6 py-12">
      <StepProgress />

      <div className="space-y-8">
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Vamos comecar! Configure seu espaco de trabalho
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            O workspace e onde voce gerencia todos os seus sites e conteudos. Geralmente usamos o nome da sua empresa ou agencia.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="workspaceName" className="text-sm font-medium text-foreground">Nome do Workspace</label>
            <Input
              id="workspaceName"
              name="name"
              type="text"
              placeholder="Ex: Minha Empresa"
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                setSlug(normalizeTenantSlug(nextName));
              }}
              className="h-12 text-base"
              autoFocus
              required
            />
            <input type="hidden" name="slug" value={slug} />
            {slug ? (
              <p className="text-sm text-muted-foreground">
                Identificador: <span className="font-mono text-foreground">{slug}</span>
              </p>
            ) : null}
          </div>

          {state.error ? <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{state.error}</p> : null}

          <Button type="submit" size="lg" className="h-12 w-full text-base font-medium" disabled={isPending || !name.trim()}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Criando workspace...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continuar
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">O que e um Workspace?</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Pense no workspace como o espaco da sua empresa. Dentro dele, voce pode criar varios sites e convidar membros da equipe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
