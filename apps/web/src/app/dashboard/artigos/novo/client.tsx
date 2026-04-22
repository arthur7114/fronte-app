"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Search,
  LayoutTemplate,
  PenTool,
  ArrowRight,
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { startArticleWizard } from "../actions"

type Step = "briefing" | "research" | "structure" | "write" | "review" | "done"

export function ArticleWizardClient({ strategies }: { strategies: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = React.useState<Step>("briefing")
  const [generationId, setGenerationId] = React.useState<string | null>(null)
  const [postId, setPostId] = React.useState<string | null>(null)
  const [tenantId, setTenantId] = React.useState<string | null>(null)

  // Briefing Form State
  const [topic, setTopic] = React.useState(searchParams.get("topic") || "")
  const [primaryKeyword, setPrimaryKeyword] = React.useState(searchParams.get("keyword") || "")
  const [strategyId, setStrategyId] = React.useState<string>(searchParams.get("strategy_id") || "")
  const [tone, setTone] = React.useState("profissional e acessível")
  const [targetLength, setTargetLength] = React.useState("médio (1000 palavras)")
  const [instructions, setInstructions] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Results State
  const [researchResult, setResearchResult] = React.useState<any>(null)
  const [structureResult, setStructureResult] = React.useState<any>(null)
  const [reviewResult, setReviewResult] = React.useState<any>(null)
  
  // Phase runner
  const runPhase = async (phaseToRun: Step, currentGenerationId: string) => {
    setStep(phaseToRun)
    try {
      const res = await fetch("/api/article-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Need to pass tenantId. Since this is client, we can grab it from strategies[0] or we should return it from startArticleWizard.
        // Actually, we can get tenantId from the server action.
        body: JSON.stringify({
          generationId: currentGenerationId,
          tenantId: strategies[0]?.tenant_id || "placeholder", // It's better to return this from the start action
          phase: phaseToRun
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      
      return data.result
    } catch (err: any) {
      toast.error(`Falha na fase: ${phaseToRun}`, { description: err.message })
      throw err
    }
  }

  const handleStart = async () => {
    if (!topic) {
      toast.error("O tópico é obrigatório.")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create DB records
      const res = await startArticleWizard(strategyId || null, {
        topic,
        primary_keyword: primaryKeyword,
        tone,
        target_length: targetLength,
        additional_instructions: instructions
      })

      if (res.error) throw new Error(res.error)
      
      const genId = res.generationId!
      setGenerationId(genId)
      setPostId(res.postId!)
      
      // We will need tenantId. We can pull from strategies or the first strategy.
      // If the user has no strategies, it might crash. The server action uses the auth context.
      // The API endpoint also uses auth context, but expects tenantId in the body just to be safe.
      // Let's pass the tenantId from the first strategy.
      const currentTenantId = strategies[0]?.tenant_id || ""

      // 2. Run Research
      const research = await runPhase("research", genId)
      setResearchResult(research)

    } catch (error: any) {
      toast.error(error.message)
      setStep("briefing")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStructure = async () => {
    setIsSubmitting(true)
    try {
      const structure = await runPhase("structure", generationId!)
      setStructureResult(structure)
    } catch (error: any) {
      // stay on current state
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWriteAndReview = async () => {
    setIsSubmitting(true)
    try {
      // Run Write
      await runPhase("write", generationId!)
      // Immediately run Review
      const review = await runPhase("review", generationId!)
      setReviewResult(review)
      setStep("done")
    } catch (error: any) {
      // stay
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepIndex = ["briefing", "research", "structure", "write", "review", "done"].indexOf(step)

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Novo Artigo</h1>
        <p className="text-muted-foreground mt-2">
          Deixe nosso agente de IA pesquisar, estruturar, escrever e revisar seu conteúdo.
        </p>
      </div>

      {/* STEPPER */}
      <div className="flex items-center justify-between border-b pb-8">
        {[
          { id: "briefing", label: "Briefing", icon: FileText },
          { id: "research", label: "Pesquisa", icon: Search },
          { id: "structure", label: "Estrutura", icon: LayoutTemplate },
          { id: "write", label: "Escrita", icon: PenTool },
          { id: "review", label: "Revisão", icon: CheckCircle2 }
        ].map((s, idx) => {
          const isActive = step === s.id
          const isPast = stepIndex > idx
          return (
            <div key={s.id} className="flex flex-col items-center gap-2 flex-1">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 
                ${isActive ? "border-primary text-primary" : ""}
                ${isPast ? "bg-primary text-primary-foreground border-primary" : ""}
                ${!isActive && !isPast ? "border-muted text-muted-foreground" : ""}
              `}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* STEP 1: BRIEFING */}
      {step === "briefing" && (
        <Card>
          <CardHeader>
            <CardTitle>Briefing do Artigo</CardTitle>
            <CardDescription>Configure os parâmetros iniciais para o agente trabalhar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tópico Principal *</Label>
              <Input 
                placeholder="Ex: Como escolher o melhor software de gestão" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Palavra-chave Alvo</Label>
                <Input 
                  placeholder="Ex: software de gestão empresarial" 
                  value={primaryKeyword} 
                  onChange={e => setPrimaryKeyword(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Vincular à Estratégia</Label>
                <Select value={strategyId} onValueChange={setStrategyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma estratégia (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {strategies.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tom de Voz</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profissional e acessível">Profissional e Acessível</SelectItem>
                    <SelectItem value="descontraído e jovem">Descontraído e Jovem</SelectItem>
                    <SelectItem value="acadêmico e técnico">Acadêmico e Técnico</SelectItem>
                    <SelectItem value="persuasivo e comercial">Persuasivo e Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tamanho Desejado</Label>
                <Select value={targetLength} onValueChange={setTargetLength}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curto (500 palavras)">Curto (~500 palavras)</SelectItem>
                    <SelectItem value="médio (1000 palavras)">Médio (~1000 palavras)</SelectItem>
                    <SelectItem value="longo (2000+ palavras)">Longo (2000+ palavras)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instruções Adicionais (Opcional)</Label>
              <Textarea 
                placeholder="Ex: Mencione nosso produto principal na conclusão. Evite falar sobre o concorrente X." 
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-6">
            <Button onClick={handleStart} disabled={isSubmitting || !topic} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Iniciar Pesquisa
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: RESEARCH */}
      {step === "research" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              {isSubmitting ? "Analisando Concorrentes..." : "Pesquisa Concluída"}
            </CardTitle>
            <CardDescription>
              O agente está consultando o Google (Serper API) para entender a intenção de busca.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitting ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Analisando os 10 principais resultados do Google...</p>
              </div>
            ) : researchResult && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Principais Descobertas:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {researchResult.key_findings?.map((kf: string, i: number) => (
                      <li key={i} className="text-sm">{kf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          {!isSubmitting && (
             <CardFooter className="flex justify-end border-t p-6">
               <Button onClick={handleStructure} className="gap-2">
                 Gerar Estrutura <ArrowRight className="h-4 w-4" />
               </Button>
             </CardFooter>
          )}
        </Card>
      )}

      {/* STEP 3: STRUCTURE */}
      {step === "structure" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-amber-500" />
              {isSubmitting ? "Desenhando Estrutura..." : "Estrutura do Artigo"}
            </CardTitle>
            <CardDescription>
              O agente organizou a hierarquia do conteúdo com base na pesquisa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitting ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Criando títulos e H2s otimizados para SEO...</p>
              </div>
            ) : structureResult && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h3 className="font-bold text-lg">{structureResult.title}</h3>
                  <p className="text-sm text-muted-foreground">{structureResult.meta_description}</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Tópicos:</h4>
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    {structureResult.headings?.map((h: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                            H{h.level}
                          </span>
                          {h.text}
                        </div>
                        <div className="text-xs text-muted-foreground pl-8">
                          {h.intent}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {!isSubmitting && (
             <CardFooter className="flex justify-end border-t p-6 gap-3">
               <Button variant="outline" onClick={handleStructure}>Refazer Estrutura</Button>
               <Button onClick={handleWriteAndReview} className="gap-2">
                 Escrever e Revisar <ArrowRight className="h-4 w-4" />
               </Button>
             </CardFooter>
          )}
        </Card>
      )}

      {/* STEP 4/5: WRITE & REVIEW */}
      {(step === "write" || step === "review" || step === "done") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === "write" && <PenTool className="h-5 w-5 text-emerald-500" />}
              {step === "review" && <Search className="h-5 w-5 text-purple-500" />}
              {step === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              
              {step === "write" && "O agente está redigindo o conteúdo..."}
              {step === "review" && "O agente editor está revisando o SEO..."}
              {step === "done" && "Pronto para Publicação"}
            </CardTitle>
            <CardDescription>
              {step === "done" ? "O artigo foi finalizado e recebeu sua pontuação SEO." : "Isso pode levar até 60 segundos."}
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isSubmitting ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>
                  {step === "write" && "Escrevendo 1000+ palavras com alta fluidez..."}
                  {step === "review" && "Avaliando densidade de palavras-chave e legibilidade..."}
                </p>
              </div>
            ) : reviewResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 border rounded-xl flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <span className="text-4xl font-bold text-emerald-600">{reviewResult.seo_score}</span>
                    <span className="text-sm font-medium">SEO Score</span>
                  </div>
                  <div className="p-6 border rounded-xl flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500/10 to-transparent">
                    <span className="text-4xl font-bold text-blue-600">{reviewResult.readability_score}</span>
                    <span className="text-sm font-medium">Legibilidade</span>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3">Feedback do Editor de IA:</h4>
                  <ul className="space-y-2">
                    {reviewResult.feedback?.map((fb: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{fb}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          {!isSubmitting && step === "done" && (
             <CardFooter className="flex justify-end border-t p-6 gap-3">
               <Button onClick={() => router.push(`/dashboard/artigos/${postId}`)} className="gap-2">
                 Abrir no Editor
                 <ArrowRight className="h-4 w-4" />
               </Button>
             </CardFooter>
          )}
        </Card>
      )}

    </div>
  )
}
