"use client";

import { useState } from "react";
import { FileText, Loader2, Sparkles, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type GenerateArticleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (articleId: string) => void;
};

const suggestedTopics = [
  "Clareamento dental: caseiro ou no consultorio?",
  "Como escolher a escova de dentes ideal",
  "Quanto tempo dura um implante dentario?",
  "Sensibilidade dental: causas e tratamentos",
];

const lengthOptions = [
  { id: "short", label: "Curto", words: "500-800" },
  { id: "medium", label: "Medio", words: "800-1500", recommended: true },
  { id: "long", label: "Longo", words: "1500-2500" },
];

const toneOptions = [
  { id: "friendly", label: "Amigavel", description: "Proximo e acolhedor" },
  { id: "professional", label: "Profissional", description: "Tecnico e confiavel" },
  { id: "educational", label: "Educacional", description: "Didatico e claro" },
];

export function GenerateArticleDialog({ open, onOpenChange, onGenerated }: GenerateArticleDialogProps) {
  const [step, setStep] = useState<"form" | "generating">("form");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [brief, setBrief] = useState("");
  const [length, setLength] = useState("medium");
  const [tone, setTone] = useState("friendly");

  async function handleGenerate() {
    if (!topic.trim()) return;
    setStep("generating");
    await new Promise((resolve) => setTimeout(resolve, 900));
    onGenerated("new");
    setTimeout(() => {
      setStep("form");
      setTopic("");
      setKeyword("");
      setBrief("");
    }, 300);
  }

  function handleReset() {
    setStep("form");
    setTopic("");
    setKeyword("");
    setBrief("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleReset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
        {step === "form" ? (
          <>
            <DialogHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Gerar novo artigo com IA</DialogTitle>
              <DialogDescription>
                Nos conte sobre o que voce quer escrever. Nossa IA vai gerar um artigo otimizado pronto para revisar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="topic">Tema do artigo <span className="text-destructive">*</span></Label>
                <Input id="topic" placeholder="Ex: Beneficios do clareamento dental profissional" value={topic} onChange={(event) => setTopic(event.target.value)} />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground">Sugestoes:</span>
                  {suggestedTopics.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setTopic(suggestion)}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyword">Palavra-chave principal</Label>
                <Input id="keyword" placeholder="Ex: clareamento dental" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
                <p className="text-xs text-muted-foreground">A IA vai otimizar o conteudo em torno desta palavra-chave.</p>
              </div>
              <div className="space-y-2">
                <Label>Tamanho do artigo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {lengthOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLength(option.id)}
                      className={cn("relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all", length === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
                    >
                      {option.recommended ? <Badge variant="secondary" className="absolute -top-2 right-2 bg-primary px-1.5 py-0 text-[10px] text-primary-foreground">Recomendado</Badge> : null}
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.words} palavras</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tom de voz</Label>
                <div className="grid grid-cols-3 gap-2">
                  {toneOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTone(option.id)}
                      className={cn("flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all", tone === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brief">Instrucoes adicionais (opcional)</Label>
                <Textarea id="brief" value={brief} onChange={(event) => setBrief(event.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleGenerate} disabled={!topic.trim()} className="gap-2"><Sparkles className="h-4 w-4" />Gerar artigo</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-7 w-7 animate-pulse text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Gerando seu artigo...</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                A IA esta pesquisando o tema, estruturando o conteudo e otimizando para buscadores.
              </p>
              <div className="mt-8 w-full max-w-sm space-y-3 text-left">
                {[
                  { icon: Target, label: "Analisando palavras-chave", done: true },
                  { icon: FileText, label: "Estruturando o artigo", done: true },
                  { icon: Zap, label: "Escrevendo o conteudo", loading: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {item.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <item.icon className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
