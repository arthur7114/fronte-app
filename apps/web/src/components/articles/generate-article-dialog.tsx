"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { Sparkles, Loader2, FileText, Target, Zap, SearchCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { startArticleWizard } from "@/app/dashboard/artigos/actions"

type GenerateArticleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated?: (articleId: string) => void
  strategyId?: string | null
}

type GenerationPhase = "research" | "structure" | "write" | "review"

type ArticleAgentResponse = {
  success?: boolean
  error?: string
}

const suggestedTopics = [
  "Clareamento dental: caseiro ou no consultório?",
  "Como escolher a escova de dentes ideal",
  "Quanto tempo dura um implante dentário?",
  "Sensibilidade dental: causas e tratamentos",
]

const lengthOptions = [
  { id: "short", label: "Curto", words: "500-800", target: "curto (500-800 palavras)", icon: FileText },
  { id: "medium", label: "Médio", words: "800-1500", target: "médio (800-1500 palavras)", icon: FileText, recommended: true },
  { id: "long", label: "Longo", words: "1500-2500", target: "longo (1500-2500 palavras)", icon: FileText },
]

const toneOptions = [
  { id: "friendly", label: "Amigável", description: "Próximo e acolhedor", value: "amigável e acolhedor" },
  { id: "professional", label: "Profissional", description: "Técnico e confiável", value: "profissional e confiável" },
  { id: "educational", label: "Educacional", description: "Didático e claro", value: "educacional, didático e claro" },
]

const generationPhases: {
  id: GenerationPhase
  label: string
  icon: typeof FileText
}[] = [
  { id: "research", label: "Analisando palavras-chave", icon: Target },
  { id: "structure", label: "Estruturando o artigo", icon: FileText },
  { id: "write", label: "Escrevendo o conteúdo", icon: Zap },
  { id: "review", label: "Revisando SEO", icon: SearchCheck },
]

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erro inesperado."
}

async function runArticlePhase(
  generationId: string,
  tenantId: string,
  phase: GenerationPhase,
) {
  const response = await fetch("/api/article-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generationId, tenantId, phase }),
  })

  const data = (await response.json()) as ArticleAgentResponse

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Falha na fase ${phase}.`)
  }
}

export function GenerateArticleDialog({
  open,
  onOpenChange,
  onGenerated,
  strategyId,
}: GenerateArticleDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "generating">("form")
  const [topic, setTopic] = useState("")
  const [keyword, setKeyword] = useState("")
  const [brief, setBrief] = useState("")
  const [length, setLength] = useState("medium")
  const [tone, setTone] = useState("friendly")
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase | null>(null)
  const [completedPhases, setCompletedPhases] = useState<GenerationPhase[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    const selectedLength = lengthOptions.find((option) => option.id === length) ?? lengthOptions[1]
    const selectedTone = toneOptions.find((option) => option.id === tone) ?? toneOptions[0]
    const trimmedTopic = topic.trim()

    if (!trimmedTopic) return

    setStep("generating")
    setIsGenerating(true)
    setCompletedPhases([])

    try {
      const result = await startArticleWizard(strategyId ?? null, {
        topic: trimmedTopic,
        primary_keyword: keyword.trim() || undefined,
        tone: selectedTone.value,
        target_length: selectedLength.target,
        additional_instructions: brief.trim() || undefined,
      })

      if (result.error || !result.generationId || !result.tenantId || !result.postId) {
        throw new Error(result.error || "Não foi possível iniciar a geração.")
      }

      for (const phase of generationPhases) {
        setCurrentPhase(phase.id)
        await runArticlePhase(result.generationId, result.tenantId, phase.id)
        setCompletedPhases((previous) => [...previous, phase.id])
      }

      toast.success("Artigo gerado com sucesso.")
      router.refresh()
      onOpenChange(false)
      onGenerated?.(result.postId)
      setTimeout(handleReset, 300)
    } catch (error) {
      toast.error("Não foi possível gerar o artigo.", {
        description: getErrorMessage(error),
      })
      setStep("form")
    } finally {
      setCurrentPhase(null)
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setStep("form")
    setTopic("")
    setKeyword("")
    setBrief("")
    setCurrentPhase(null)
    setCompletedPhases([])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isGenerating) return
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
                  onChange={(event) => setTopic(event.target.value)}
                />
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground">Sugestões:</span>
                  {suggestedTopics.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setTopic(suggestion)}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {suggestion}
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
                  onChange={(event) => setKeyword(event.target.value)}
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
                  onChange={(event) => setBrief(event.target.value)}
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
                Nossa IA está pesquisando o tema, estruturando o conteúdo,
                escrevendo e revisando a otimização para buscadores.
              </p>

              <div className="mt-8 w-full max-w-sm space-y-3 text-left">
                {generationPhases.map((phase) => {
                  const isDone = completedPhases.includes(phase.id)
                  const isLoading = currentPhase === phase.id && !isDone
                  const PhaseIcon = phase.icon

                  return (
                    <div key={phase.id} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full",
                          isDone || isLoading
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isDone ? (
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
                          <PhaseIcon className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="text-sm text-foreground">{phase.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
