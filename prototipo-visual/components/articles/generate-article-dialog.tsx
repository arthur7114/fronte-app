"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, FileText, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type GenerateArticleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated: (articleId: string) => void
}

const suggestedTopics = [
  "Clareamento dental: caseiro ou no consultório?",
  "Como escolher a escova de dentes ideal",
  "Quanto tempo dura um implante dentário?",
  "Sensibilidade dental: causas e tratamentos",
]

const lengthOptions = [
  { id: "short", label: "Curto", words: "500-800", icon: FileText },
  { id: "medium", label: "Médio", words: "800-1500", icon: FileText, recommended: true },
  { id: "long", label: "Longo", words: "1500-2500", icon: FileText },
]

const toneOptions = [
  { id: "friendly", label: "Amigável", description: "Próximo e acolhedor" },
  { id: "professional", label: "Profissional", description: "Técnico e confiável" },
  { id: "educational", label: "Educacional", description: "Didático e claro" },
]

export function GenerateArticleDialog({
  open,
  onOpenChange,
  onGenerated,
}: GenerateArticleDialogProps) {
  const [step, setStep] = useState<"form" | "generating">("form")
  const [topic, setTopic] = useState("")
  const [keyword, setKeyword] = useState("")
  const [brief, setBrief] = useState("")
  const [length, setLength] = useState("medium")
  const [tone, setTone] = useState("friendly")

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setStep("generating")
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2400))
    onGenerated("new")
    // Reset for next time
    setTimeout(() => {
      setStep("form")
      setTopic("")
      setKeyword("")
      setBrief("")
    }, 300)
  }

  const handleReset = () => {
    setStep("form")
    setTopic("")
    setKeyword("")
    setBrief("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleReset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        {step === "form" ? (
          <>
            <DialogHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Gerar novo artigo com IA</DialogTitle>
              <DialogDescription>
                Nos conte sobre o que você quer escrever. Nossa IA vai gerar um artigo
                otimizado pronto para você revisar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">
                  Tema do artigo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="topic"
                  placeholder="Ex: Benefícios do clareamento dental profissional"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground">Sugestões:</span>
                  {suggestedTopics.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTopic(s)}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword */}
              <div className="space-y-2">
                <Label htmlFor="keyword">Palavra-chave principal</Label>
                <Input
                  id="keyword"
                  placeholder="Ex: clareamento dental"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A IA vai otimizar o conteúdo em torno desta palavra-chave.
                </p>
              </div>

              {/* Length */}
              <div className="space-y-2">
                <Label>Tamanho do artigo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {lengthOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setLength(option.id)}
                      className={cn(
                        "relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                        length === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {option.recommended && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-2 right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0"
                        >
                          Recomendado
                        </Badge>
                      )}
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.words} palavras
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label>Tom de voz</Label>
                <div className="grid grid-cols-3 gap-2">
                  {toneOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTone(option.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                        tone === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brief */}
              <div className="space-y-2">
                <Label htmlFor="brief">Instruções adicionais (opcional)</Label>
                <Textarea
                  id="brief"
                  placeholder="Ex: Inclua uma seção sobre cuidados pós-clareamento e mencione nossos horários de atendimento..."
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={!topic.trim()} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Gerar artigo
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Gerando seu artigo...
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Nossa IA está pesquisando o tema, estruturando o conteúdo e otimizando
                para buscadores.
              </p>

              <div className="mt-8 w-full max-w-sm space-y-3 text-left">
                {[
                  { icon: Target, label: "Analisando palavras-chave", done: true },
                  { icon: FileText, label: "Estruturando o artigo", done: true },
                  { icon: Zap, label: "Escrevendo o conteúdo", loading: true },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        s.done
                          ? "bg-primary/10 text-primary"
                          : s.loading
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {s.loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : s.done ? (
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <s.icon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
