"use client";

import { useActionState, useMemo, useState, useEffect } from "react";
import type { Tables } from "@super/db";
import {
  saveBusinessBriefing,
  type BusinessBriefingState,
} from "@/app/app/perfil/actions";
import { stringifyBriefingList } from "@/lib/business-briefing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Search, 
  Crosshair, 
  HelpCircle, 
  Check, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AiSuggestionCard } from "@/components/ai-suggestion-card";

type BusinessBriefingPanelProps = {
  briefing: Tables<"business_briefings"> | null;
  tenantName: string;
  siteName: string;
};

const initialState: BusinessBriefingState = {};

type Step = "business_info" | "strategy" | "market" | "review";

export function BusinessBriefingPanel({
  briefing,
  tenantName,
  siteName,
}: BusinessBriefingPanelProps) {
  const [state, formAction, isPending] = useActionState(
    saveBusinessBriefing,
    initialState,
  );

  const [currentStep, setCurrentStep] = useState<Step>("business_info");
  const [formData, setFormData] = useState({
    business_name: briefing?.business_name ?? tenantName,
    segment: briefing?.segment ?? "",
    location: briefing?.location ?? "",
    offerings: briefing?.offerings ?? "",
    customer_profile: briefing?.customer_profile ?? "",
    desired_keywords: stringifyBriefingList(briefing?.desired_keywords),
    competitors: stringifyBriefingList(briefing?.competitors),
    keyword_motivation: briefing?.keyword_motivation ?? "",
    notes: briefing?.notes ?? "",
  });

  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchAiSuggestion = async (step: Step) => {
    if (step === "review") return;
    
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/briefing/suggest", {
        method: "POST",
        body: JSON.stringify({ currentStep: step, data: formData }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    // Reset suggestion when step changes and potentially fetch new one
    setAiSuggestion(null);
    if (currentStep === "strategy" || currentStep === "business_info") {
      // We can fetch pre-emptively or wait for user. Let's fetch when entering steps that have suggestions.
      if (currentStep === "business_info" && formData.business_name && formData.segment) {
         fetchAiSuggestion("business_info");
      }
    }
  }, [currentStep]);

  const applySuggestion = (suggestion: any) => {
    setFormData(prev => ({ ...prev, ...suggestion }));
    setAiSuggestion(null);
  };

  const nextStep = () => {
    if (currentStep === "business_info") {
      setCurrentStep("strategy");
      if (formData.offerings === "" || formData.customer_profile === "") {
        fetchAiSuggestion("business_info");
      }
    }
    else if (currentStep === "strategy") {
      setCurrentStep("market");
      fetchAiSuggestion("strategy");
    }
    else if (currentStep === "market") setCurrentStep("review");
  };

  const prevStep = () => {
    if (currentStep === "strategy") setCurrentStep("business_info");
    else if (currentStep === "market") setCurrentStep("strategy");
    else if (currentStep === "review") setCurrentStep("market");
  };

  const steps: { id: Step; label: string }[] = [
    { id: "business_info", label: "Identidade" },
    { id: "strategy", label: "Estratégia" },
    { id: "market", label: "Mercado" },
    { id: "review", label: "Revisão" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Wizard */}
      <div className="space-y-6 lg:col-span-2">
        {/* Progress Bar */}
        <div className="flex items-center justify-between px-2 mb-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  currentStep === s.id 
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : steps.findIndex(x => x.id === currentStep) > i
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                )}
              >
                {steps.findIndex(x => x.id === currentStep) > i ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                currentStep === s.id ? "text-primary" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <form action={formAction} className="space-y-6">
          <Card className="overflow-hidden border-primary/5">
            <CardHeader className="bg-secondary/30 pb-6 border-b border-border/50">
              <CardTitle className="flex items-center gap-3 text-xl">
                {currentStep === "business_info" && <Building2 className="h-5 w-5 text-primary" />}
                {currentStep === "strategy" && <Search className="h-5 w-5 text-primary" />}
                {currentStep === "market" && <Crosshair className="h-5 w-5 text-primary" />}
                {currentStep === "review" && <MessageSquare className="h-5 w-5 text-primary" />}
                {steps.find(s => s.id === currentStep)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {currentStep === "business_info" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Nome da empresa
                      </label>
                      <input
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Segmento
                      </label>
                      <input
                        name="segment"
                        value={formData.segment}
                        onChange={handleInputChange}
                        placeholder="Ex: Clínica, SaaS, E-commerce..."
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Localização e Abrangência
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Ex: São Paulo - SP, ou Atendimento Nacional"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "strategy" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      Serviços ou produtos principais
                    </label>
                    <textarea
                      name="offerings"
                      rows={4}
                      value={formData.offerings}
                      onChange={handleInputChange}
                      placeholder="Descreva o que a empresa vende e as ofertas de maior volume ou rentabilidade."
                      className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Crosshair className="h-4 w-4 text-muted-foreground" />
                      Perfil do Cliente Ideal (ICP)
                    </label>
                    <textarea
                      name="customer_profile"
                      rows={4}
                      value={formData.customer_profile}
                      onChange={handleInputChange}
                      placeholder="Explique quem compra de você, principais dores e problemas resolvidos."
                      className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {currentStep === "market" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Palavras-chave Iniciais
                      </label>
                      <textarea
                        name="desired_keywords"
                        rows={4}
                        value={formData.desired_keywords}
                        onChange={handleInputChange}
                        placeholder="Ideias de palavras soltas. Separadas por vírgula."
                        className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Principais Concorrentes
                      </label>
                      <textarea
                        name="competitors"
                        rows={4}
                        value={formData.competitors}
                        onChange={handleInputChange}
                        placeholder="Sites concorrentes de SEO ou de mercado direto."
                        className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Por que você escolheu essas palavras?
                    </label>
                    <textarea
                      name="keyword_motivation"
                      rows={3}
                      value={formData.keyword_motivation}
                      onChange={handleInputChange}
                      placeholder="Explique o motivo por trás dessas escolhas..."
                      className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {currentStep === "review" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="rounded-xl border border-border bg-secondary/20 p-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Negócio</span>
                        <p className="mt-1 font-medium text-foreground">{formData.business_name} ({formData.segment})</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Local</span>
                        <p className="mt-1 font-medium text-foreground">{formData.location || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Principais Ofertas</span>
                      <p className="mt-1 text-sm text-foreground line-clamp-2">{formData.offerings}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keywords Alvo</span>
                      <p className="mt-1 text-sm text-foreground italic">{formData.desired_keywords || "Nenhuma lista fornecida"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Observações Finais de Tom e Estilo
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Informações adicionais para a IA..."
                      className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  {/* Hidden fields for the form action */}
                  <input type="hidden" name="business_name" value={formData.business_name} />
                  <input type="hidden" name="segment" value={formData.segment} />
                  <input type="hidden" name="location" value={formData.location} />
                  <input type="hidden" name="offerings" value={formData.offerings} />
                  <input type="hidden" name="customer_profile" value={formData.customer_profile} />
                  <input type="hidden" name="desired_keywords" value={formData.desired_keywords} />
                  <input type="hidden" name="competitors" value={formData.competitors} />
                  <input type="hidden" name="keyword_motivation" value={formData.keyword_motivation} />
                </div>
              )}

              {state.error ? (
                <div className="mt-6 flex items-start gap-2 rounded-lg bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{state.error}</p>
                </div>
              ) : null}
              {state.success ? (
                <div className="mt-6 flex items-start gap-2 rounded-lg bg-green-50 p-4">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <p className="text-sm text-green-700">{state.success}</p>
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={prevStep}
                  disabled={currentStep === "business_info" || isPending}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>

                {currentStep === "review" ? (
                  <Button disabled={isPending} className="gap-2 shadow-lg shadow-primary/20">
                    {isPending ? "Salvando..." : "Finalizar Briefing"}
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="gap-2 shadow-lg shadow-primary/20"
                  >
                    Próximo passo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* AI Sidebar */}
      <div className="space-y-6">
        <AiSuggestionCard 
          title={
            currentStep === "business_info" ? "Contexto de Oferta" :
            currentStep === "strategy" ? "Palavras e Mercado" :
            "Pronto para começar?"
          }
          suggestion={
            currentStep === "business_info" ? aiSuggestion?.offerings ? `Como você atua com ${formData.segment}, sugiro focar em: ${aiSuggestion.offerings}` : undefined :
            currentStep === "strategy" ? aiSuggestion?.desired_keywords :
            "Seu briefing está completo e pronto para alimentar a automação."
          }
          isLoading={isAiLoading}
          onApply={applySuggestion}
        />

        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <HelpCircle className="h-4 w-4 text-primary" />
              Por que isso importa?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-xs leading-relaxed text-muted-foreground">
              O briefing é o "cérebro" da sua automação. Quanto mais preciso, melhores serão os temas e artigos gerados pela IA.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

