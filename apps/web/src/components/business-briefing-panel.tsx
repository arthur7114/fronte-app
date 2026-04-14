"use client";

import { useActionState, useMemo } from "react";
import type { Tables } from "@super/db";
import {
  saveBusinessBriefing,
  type BusinessBriefingState,
} from "@/app/app/briefing/actions";
import { stringifyBriefingList } from "@/lib/business-briefing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Search, Crosshair, HelpCircle, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type BusinessBriefingPanelProps = {
  briefing: Tables<"business_briefings"> | null;
  tenantName: string;
  siteName: string;
};

const initialState: BusinessBriefingState = {};

export function BusinessBriefingPanel({
  briefing,
  tenantName,
  siteName,
}: BusinessBriefingPanelProps) {
  const [state, formAction, isPending] = useActionState(
    saveBusinessBriefing,
    initialState,
  );
  const desiredKeywords = useMemo(
    () => stringifyBriefingList(briefing?.desired_keywords),
    [briefing?.desired_keywords],
  );
  const competitors = useMemo(
    () => stringifyBriefingList(briefing?.competitors),
    [briefing?.competitors],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Settings */}
      <div className="space-y-6 lg:col-span-2">
        <form action={formAction}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Informações do Negócio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nome da empresa
                  </label>
                  <input
                    name="business_name"
                    defaultValue={briefing?.business_name ?? tenantName}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Segmento
                  </label>
                  <input
                    name="segment"
                    defaultValue={briefing?.segment ?? ""}
                    placeholder="Clínica, E-commerce, SaaS..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Localização e Abrangência
                  </label>
                  <input
                    name="location"
                    defaultValue={briefing?.location ?? ""}
                    placeholder="Ex: São Paulo - SP, ou Atendimento Nacional"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  Serviços ou produtos principais
                </label>
                <textarea
                  name="offerings"
                  rows={4}
                  defaultValue={briefing?.offerings ?? ""}
                  placeholder="Descreva o que a empresa vende e as ofertas de maior volume ou rentabilidade."
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Crosshair className="h-4 w-4 text-muted-foreground" />
                  Perfil do Cliente Ideal (ICP)
                </label>
                <textarea
                  name="customer_profile"
                  rows={4}
                  defaultValue={briefing?.customer_profile ?? ""}
                  placeholder="Explique quem compra de você, principais dores, problemas resolvidos e nível de maturidade."
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Palavras-chave Iniciais
                  </label>
                  <textarea
                    name="desired_keywords"
                    rows={4}
                    defaultValue={desiredKeywords}
                    placeholder="Ideias de palavras soltas. Separadas por vírgula."
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Principais Concorrentes
                  </label>
                  <textarea
                    name="competitors"
                    rows={4}
                    defaultValue={competitors}
                    placeholder="Sites concorrentes de SEO ou de mercado direto."
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Por que essas palavras e concorrentes?
                </label>
                <textarea
                  name="keyword_motivation"
                  rows={3}
                  defaultValue={briefing?.keyword_motivation ?? ""}
                  placeholder="Deixe qualquer observação adicional sobre porque essa é a estratégia ideal..."
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Observações de Tom e Estilo
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={briefing?.notes ?? ""}
                  placeholder="Restrições, tom de voz (informal vs corporativo), assuntos a evitar."
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              {state.error ? (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{state.error}</p>
                </div>
              ) : null}
              {state.success ? (
                <div className="flex items-start gap-2 rounded-lg bg-green-50 p-4">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <p className="text-sm text-green-700">{state.success}</p>
                </div>
              ) : null}

              <div className="flex justify-end border-t border-border pt-4">
                <Button disabled={isPending} className="gap-2">
                  {isPending ? "Salvando..." : "Salvar Briefing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        <Card className={cn(briefing ? "border-primary/20" : "")}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
              Status do Contexto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <Badge 
                className={cn(
                  "text-sm px-3 py-1",
                  briefing 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {briefing ? "Briefing Validado" : "Nenhum contexto"}
              </Badge>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Sua IA não consegue sugerir palavras-chave ou pautas valiosas sem entender seu <strong className="text-foreground font-semibold">Cliente Ideal</strong>.
              </p>
              
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs font-medium text-foreground mb-1">Impactos diretos:</p>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Sugestão das Core Keywords</li>
                  <li>Adequação de tom de voz do blog</li>
                  <li>Recomendação de Call-to-Actions</li>
                </ul>
              </div>
            </div>

            {briefing?.summary && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Como a IA lhe entende
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {briefing.summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
