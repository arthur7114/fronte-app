"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Check, Globe, Loader2, X } from "lucide-react";
import { createOnboardingSite, type OnboardingState } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { normalizeSiteSubdomain } from "@/lib/site";
import { cn } from "@/lib/utils";

type OnboardingSiteFormProps = {
  tenantName: string;
};

const initialState: OnboardingState = {};
const languages = [
  { value: "pt-BR", label: "Portugues (Brasil)" },
  { value: "pt-PT", label: "Portugues (Portugal)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Espanol" },
];

function StepProgress() {
  return (
    <div className="mb-12">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {[
          { label: "Criar conta", done: true },
          { label: "Workspace", done: true },
          { label: "Site", active: true },
          { label: "Briefing" },
        ].map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            {index > 0 ? <div className={cn("h-px w-8", step.done || step.active ? "bg-primary" : "bg-border")} /> : null}
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", step.done ? "bg-primary/20 text-primary" : step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {step.done ? "✓" : index + 1}
            </span>
            <span className={cn(step.active ? "font-medium text-foreground" : "text-muted-foreground")}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OnboardingSiteForm({ tenantName }: OnboardingSiteFormProps) {
  const [state, formAction, isPending] = useActionState(createOnboardingSite, initialState);
  const [siteName, setSiteName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [subdomainStatus, setSubdomainStatus] = useState<"idle" | "checking" | "available">("idle");

  function handleSubdomainChange(value: string) {
    const sanitized = normalizeSiteSubdomain(value).replace(/-/g, "").slice(0, 20);
    setSubdomain(sanitized);
    setSubdomainStatus(sanitized.length >= 3 ? "available" : "idle");
  }

  function handleSiteNameChange(value: string) {
    setSiteName(value);
    handleSubdomainChange(value);
  }

  return (
    <div className="container mx-auto max-w-2xl px-6 py-12">
      <StepProgress />

      <div className="space-y-8">
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Globe className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Configure seu primeiro site</h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            No workspace <span className="font-medium text-foreground">{tenantName}</span>, este sera o destino dos seus artigos e conteudos.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="siteName" className="text-sm font-medium text-foreground">Nome do Site</label>
            <Input
              id="siteName"
              name="name"
              type="text"
              placeholder="Ex: Blog da Clinica"
              value={siteName}
              onChange={(event) => handleSiteNameChange(event.target.value)}
              className="h-12 text-base"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subdomain" className="text-sm font-medium text-foreground">Subdominio</label>
            <div className="flex items-center gap-0">
              <Input
                id="subdomain"
                name="subdomain"
                type="text"
                placeholder="meusite"
                value={subdomain}
                onChange={(event) => handleSubdomainChange(event.target.value)}
                className="h-12 rounded-r-none border-r-0 text-base"
                required
              />
              <div className="flex h-12 items-center rounded-r-lg border border-input bg-muted px-4 text-sm text-muted-foreground">
                .contentai.com.br
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {subdomainStatus === "checking" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Verificando disponibilidade...</span>
                </>
              ) : null}
              {subdomainStatus === "available" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span className="text-primary">Subdominio disponivel!</span>
                </>
              ) : null}
              {subdomainStatus === "idle" ? (
                <>
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Digite pelo menos 3 caracteres.</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="text-sm font-medium text-foreground">Idioma do Conteudo</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="language" value={language} />
            <p className="text-sm text-muted-foreground">Este sera o idioma padrao dos artigos gerados pela IA.</p>
          </div>

          {state.error ? <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{state.error}</p> : null}

          <Button type="submit" size="lg" className="h-12 w-full text-base font-medium" disabled={isPending || !siteName.trim() || subdomainStatus !== "available"}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Criando site...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Finalizar e comecar
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="font-medium text-foreground">O que acontece agora?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Seu blog estara no ar em <span className="font-mono text-foreground">{subdomain || "meusite"}.contentai.com.br</span></li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Nossa IA vai te ajudar a criar sua estrategia de conteudo</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Voce pode conectar seu dominio personalizado depois</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
