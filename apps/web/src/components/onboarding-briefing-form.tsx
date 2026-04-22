"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Send, Sparkles, User } from "lucide-react";
import { saveOnboardingBriefing } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type OnboardingBriefingFormProps = {
  tenantName: string;
  siteName: string;
};

type Message = {
  id: number;
  role: "ai" | "user";
  content: string;
  options?: readonly string[];
};

type BriefingStep = {
  key: string;
  question: string;
  options?: readonly string[];
  placeholder: string;
  hint: string;
};

const steps: BriefingStep[] = [
  {
    key: "segment",
    question: "Que tipo de negocio voce tem?",
    options: ["Clinica ou consultorio", "Restaurante ou alimentacao", "Loja fisica ou e-commerce", "Agencia ou consultoria", "Servicos locais", "Outro"],
    placeholder: "Escreva ou escolha uma opcao acima",
    hint: "Isso me ajuda a entender seu mercado e o tipo de conteudo que vai funcionar melhor.",
  },
  {
    key: "services",
    question: "Quais sao seus principais servicos ou produtos?",
    placeholder: "Ex: consultas, implantes, clareamento, acompanhamento mensal...",
    hint: "Liste os 2 ou 3 principais. Nao precisa ser perfeito.",
  },
  {
    key: "location",
    question: "Onde voce atende? Sua presenca e local, regional ou online?",
    options: ["Apenas local", "Regional", "Nacional", "Online / todo o Brasil"],
    placeholder: "Escreva sua cidade ou regiao",
    hint: "Isso define se vamos focar em SEO local ou SEO mais amplo.",
  },
  {
    key: "audience",
    question: "Quem e o seu cliente ideal? Descreva em poucas palavras.",
    placeholder: "Ex: adultos de 30 a 55 anos que buscam tratamento estetico",
    hint: "Quanto mais especifico, melhor o conteudo que a IA vai gerar.",
  },
  {
    key: "differentiator",
    question: "O que te diferencia dos concorrentes?",
    placeholder: "Ex: atendimento humanizado, metodo proprio, preco justo...",
    hint: "Vamos usar isso para destacar suas vantagens reais.",
  },
  {
    key: "goal",
    question: "Qual e seu principal objetivo com o conteudo?",
    options: ["Aparecer no Google", "Gerar mais leads", "Construir autoridade", "Vender mais produtos ou servicos"],
    placeholder: "Escreva ou escolha uma opcao acima",
    hint: "Isso define a estrategia inicial de conteudo.",
  },
];

const initialMessage: Message = {
  id: 0,
  role: "ai",
  content:
    "Ola! Sou a assistente de estrategia do ContentAI. Vou te fazer algumas perguntas rapidas para entender o seu negocio e montar um plano de conteudo personalizado. Sao apenas 6 perguntas e leva menos de 3 minutos. Vamos la?",
};

function StepProgress({ started, isComplete, currentStep }: { started: boolean; isComplete: boolean; currentStep: number }) {
  const progress = currentStep >= 0 ? (currentStep / steps.length) * 100 : isComplete ? 100 : 0;

  return (
    <div className="mb-10">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {[
          { label: "Criar conta", done: true },
          { label: "Workspace", done: true },
          { label: "Site", done: true },
          { label: "Briefing", active: true },
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
      {started ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Briefing do negocio</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OnboardingBriefingForm({ tenantName, siteName }: OnboardingBriefingFormProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function addAIMessage(content: string, options?: readonly string[], delay = 600) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((current) => [...current, { id: Date.now(), role: "ai", content, options }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, delay);
  }

  function handleStart() {
    setStarted(true);
    setCurrentStep(0);
    addAIMessage(steps[0].question, steps[0].options);
  }

  function handleAnswer(answer: string) {
    if (!answer.trim() || currentStep < 0) return;
    const step = steps[currentStep];
    const newAnswers = { ...answers, [step.key]: answer };
    const nextStep = currentStep + 1;

    setAnswers(newAnswers);
    setMessages((current) => [...current, { id: Date.now(), role: "user", content: answer }]);
    setInput("");

    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      addAIMessage(steps[nextStep].question, steps[nextStep].options);
      return;
    }

    setCurrentStep(-1);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          role: "ai",
          content:
            "Perfeito! Agora eu tenho tudo que preciso para montar sua estrategia de conteudo personalizada. Isso vai aparecer no seu painel assim que voce acessar o dashboard.",
        },
      ]);
      setIsComplete(true);
    }, 900);
  }

  function handleFinish() {
    const formData = new FormData();
    formData.set("business_name", tenantName);
    formData.set("segment", answers.segment ?? "");
    formData.set("offerings", answers.services ?? "");
    formData.set("customer_profile", answers.audience ?? "");
    formData.set("location", answers.location ?? "");
    formData.set("desired_keywords", answers.goal ?? "");
    formData.set("keyword_motivation", answers.goal ?? "");
    formData.set("competitors", "");
    formData.set("notes", `Diferencial: ${answers.differentiator ?? ""}. Site: ${siteName}.`);

    startTransition(async () => {
      setError(null);
      const result = await saveOnboardingBriefing({}, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/app/dashboard");
    });
  }

  const activeOptions = currentStep >= 0 ? steps[currentStep].options : undefined;

  return (
    <div className="container mx-auto max-w-2xl px-6 py-10">
      <StepProgress started={started} isComplete={isComplete} currentStep={currentStep} />

      <div className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex items-start gap-3", message.role === "user" && "flex-row-reverse")}>
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", message.role === "ai" ? "bg-primary/10" : "bg-muted")}>
                {message.role === "ai" ? <Sparkles className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className={cn("flex max-w-[85%] flex-col gap-2", message.role === "user" && "items-end")}>
                <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed", message.role === "ai" ? "rounded-tl-sm bg-muted text-foreground" : "rounded-tr-sm bg-primary text-primary-foreground")}>
                  {message.content}
                </div>
                {message.options && activeOptions === message.options ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleAnswer(option)}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {isTyping ? (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                <div className="flex h-4 items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border" />
        <div className="p-4">
          {!started ? (
            <Button onClick={handleStart} size="lg" className="h-12 w-full text-base font-medium">
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Comecar o briefing</span>
            </Button>
          ) : isComplete ? (
            <Button onClick={handleFinish} size="lg" className="h-12 w-full text-base font-medium" disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Gerando sua estrategia...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" />Ver meu dashboard<ArrowRight className="h-4 w-4" /></span>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAnswer(input);
                  }
                }}
                placeholder={currentStep >= 0 ? steps[currentStep].placeholder : "Escreva sua resposta..."}
                className="h-11 text-sm"
                disabled={isTyping || currentStep < 0}
              />
              <Button onClick={() => handleAnswer(input)} size="icon" className="h-11 w-11 shrink-0" disabled={!input.trim() || isTyping || currentStep < 0}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {started && !isComplete && currentStep >= 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{steps[currentStep].hint}</p>
          ) : null}
          {error ? <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p> : null}
          {!isComplete && started ? (
            <div className="mt-4 text-center">
              <button type="button" onClick={() => router.push("/app/dashboard")} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Pular por agora e configurar depois
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
