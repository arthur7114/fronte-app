"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  Globe, 
  Building2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { normalizeTenantSlug } from "@/lib/tenant";
import { completeOnboarding, type FullOnboardingData } from "@/app/onboarding/actions";

type Message = {
  role: "assistant" | "user";
  content: string;
};

export function ConversationalOnboarding() {
  const router = useRouter();
  
  // States
  const [step, setStep] = useState<"initial" | "chat" | "saving">("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data State (Step 0)
  const [tenantName, setTenantName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou seu guia estratégico. Vamos tirar o seu blog do papel? Para começar, me conte um pouco mais sobre o seu negócio. Qual o segmento principal de atuação?" }
  ]);
  const [input, setInput] = useState("");
  const [structuredData, setStructuredData] = useState<FullOnboardingData["briefing"]>({
    segment: "",
    offerings: "",
    customer_profile: "",
    location: "",
    desired_keywords: [],
    competitors: []
  });
  const [isComplete, setIsComplete] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handlers
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !subdomain) return;
    setStep("chat");
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || isComplete) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }],
          context: { tenantName, siteName: tenantName, subdomain }
        })
      });

      const result = await response.json();

      if (result.message) {
        setMessages(prev => [...prev, { role: "assistant", content: result.message }]);
      }
      
      if (result.data) {
        setStructuredData(prev => ({
          ...prev,
          ...result.data
        }));
      }

      if (result.is_complete) {
        setIsComplete(true);
      }
    } catch (err) {
      console.error(err);
      setError("Falha na conexão com a IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setStep("saving");
    setLoading(true);
    
    const finalData: FullOnboardingData = {
      tenantName,
      tenantSlug: normalizeTenantSlug(tenantName),
      siteName: tenantName,
      subdomain,
      briefing: structuredData
    };

    const result = await completeOnboarding(finalData);

    if (result.success) {
      router.push("/app/dashboard");
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao salvar.");
      setStep("chat");
      setLoading(false);
    }
  };

  // Rendering
  if (step === "saving") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Configurando seu universo...</h2>
          <p className="text-sm text-muted-foreground">Estamos criando seu workspace, site e estratégia personalizada.</p>
        </div>
      </div>
    );
  }

  if (step === "initial") {
    return (
      <Card className="overflow-hidden border-none bg-white shadow-xl">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-[1fr_0.8fr]">
            <div className="p-8 sm:p-12">
              <div className="mb-8">
                <Badge variant="outline" className="mb-4 border-primary/20 text-primary uppercase tracking-widest text-[10px]">
                  Fase 1: Estrutura
                </Badge>
                <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                  Primeiro, o básico.
                </h2>
                <p className="mt-2 text-lg text-slate-500">
                  Como devemos chamar o seu novo espaço de trabalho?
                </p>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Nome do Negócio
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                    <input
                      required
                      value={tenantName}
                      onChange={e => setTenantName(e.target.value)}
                      placeholder="Ex: Minha Empresa Inc."
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-lg outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Subdomínio Fronte
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                    <input
                      required
                      value={subdomain}
                      onChange={e => setSubdomain(normalizeTenantSlug(e.target.value))}
                      placeholder="minha-empresa"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-32 text-lg outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                      .fronte.app
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={!tenantName || !subdomain}
                  className="h-14 w-full text-base font-bold uppercase tracking-[0.2em]"
                >
                  Continuar para o Chat
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>

            <div className="hidden flex-col justify-center bg-slate-50 p-12 lg:flex">
              <div className="space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Por que pedimos isso?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Estes são os identificadores técnicos do seu projeto. O nome define o workspace e o subdomínio será o endereço inicial do seu blog na internet.
                </p>
                <div className="space-y-3">
                  {["Configuração instantânea", "SSL incluso", "Fácil de mudar depois"].map(feature => (
                    <div key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-500">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-6 lg:flex-row">
      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-none">Guia Estratégico</h3>
              <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>
          {isComplete && (
            <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700 font-bold uppercase tracking-wider text-xs px-6">
              Concluir Onboarding
            </Button>
          )}
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 space-y-6 overflow-y-auto bg-slate-50/50 p-6"
          style={{ height: '500px' }}
        >
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={cn(
                "flex max-w-[85%] items-start gap-3",
                m.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                m.role === "assistant" ? "bg-slate-800" : "bg-primary"
              )}>
                {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={cn(
                "rounded-2xl px-5 py-3 text-sm shadow-sm",
                m.role === "assistant" 
                  ? "bg-white text-slate-700 border border-slate-100" 
                  : "bg-primary text-primary-foreground"
              )}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 text-sm shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            </div>
          )}
          {isComplete && (
            <div className="rounded-xl border border-dashed border-green-200 bg-green-50/50 p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
              <h4 className="mt-2 font-bold text-green-800">Briefing Consolidado!</h4>
              <p className="mt-1 text-sm text-green-600">
                Já tenho informações suficientes para montar sua estratégia. Deseja adicionar mais algo ou podemos finalizar?
              </p>
              <Button 
                onClick={handleFinish}
                size="sm"
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                Tudo pronto, vamos lá!
              </Button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-100 bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              disabled={loading || isComplete}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isComplete ? "Briefing concluído" : "Digite sua mensagem..."}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
            />
            <Button 
              type="submit" 
              disabled={loading || isComplete || !input.trim()}
              className="h-12 w-12 rounded-xl p-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Progress / Context Sidebar */}
      <div className="w-full space-y-4 lg:w-[320px]">
        <div className="rounded-2xl bg-slate-900 p-6 text-white">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Building2 className="h-4 w-4" />
            Seu Projeto
          </h4>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Nome</p>
              <p className="font-bold">{tenantName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Blog</p>
              <p className="font-bold">{subdomain}.fronte.app</p>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Estratégia Capturada
            </h4>
            <div className="mt-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Segmento</p>
                <p className="text-sm font-medium">{structuredData.segment || "â€”"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Público</p>
                <p className="text-sm font-medium line-clamp-2">{structuredData.customer_profile || "â€”"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Ofertas</p>
                <p className="text-sm font-medium line-clamp-2">{structuredData.offerings || "â€”"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

