/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle2, Edit2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type BriefingData = {
  answers: Record<string, string>
  uploadedFiles: string[]
}

export default function ResumoPage() {
  const router = useRouter()
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null)
  const [workspace, setWorkspace] = useState("")
  const [site, setSite] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const briefing = sessionStorage.getItem("onboarding_briefing")
    const workspaceData = sessionStorage.getItem("onboarding_workspace")
    const siteData = sessionStorage.getItem("onboarding_site")

    if (briefing) setBriefingData(JSON.parse(briefing))
    if (workspaceData) setWorkspace(JSON.parse(workspaceData).name)
    if (siteData) setSite(JSON.parse(siteData).name)
  }, [])

  const handleContinue = async () => {
    setIsLoading(true)
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/onboarding/estrategias")
  }

  const handleEdit = () => {
    const path = sessionStorage.getItem("onboarding_path")
    if (path === "ia") {
      router.push("/onboarding/estrategia")
    } else {
      router.push("/onboarding/escolher")
    }
  }

  const checklistItems = [
    { label: "Workspace criado", value: workspace },
    { label: "Site configurado", value: site },
    briefingData?.answers?.segment && { label: "Tipo de negócio", value: briefingData.answers.segment },
    briefingData?.answers?.services && { label: "Principais serviços", value: briefingData.answers.services },
    briefingData?.answers?.location && { label: "Localização", value: briefingData.answers.location },
    briefingData?.answers?.audience && { label: "Cliente ideal", value: briefingData.answers.audience },
    briefingData?.answers?.differentiator && { label: "Diferencial", value: briefingData.answers.differentiator },
    briefingData?.answers?.goal && { label: "Objetivo", value: briefingData.answers.goal },
    briefingData && briefingData.uploadedFiles.length > 0 && {
      label: "Documentos de referência",
      value: `${briefingData.uploadedFiles.length} arquivo${briefingData.uploadedFiles.length > 1 ? "s" : ""}`,
    },
  ].filter((item): item is { label: string; value: string } => Boolean(item))

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {[
            { label: "Criar conta", done: true },
            { label: "Workspace", done: true },
            { label: "Site", done: true },
            { label: "Estratégia", done: true },
            { label: "Resumo", done: false, active: true },
            { label: "Concluir", done: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <div className={cn("h-px w-8", s.done || s.active ? "bg-primary" : "bg-border")} />
              )}
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  s.done
                    ? "bg-primary/20 text-primary"
                    : s.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s.done ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={cn(s.active ? "text-foreground font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Resumo do seu briefing
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Aqui está tudo que coletamos sobre o seu negócio. Revise, edite se necessário, e prossiga para ver as estratégias sugeridas.
          </p>
        </div>

        {/* Checklist Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Informações Coletadas</h2>
          <div className="space-y-3">
            {checklistItems.map((item, i) => (
              <Card key={i} className="border-border">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-base font-medium text-foreground mt-1 break-words">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Documents Summary */}
        {briefingData?.uploadedFiles && briefingData.uploadedFiles.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Arquivos de Referência</CardTitle>
              <CardDescription>A IA analisará esses documentos para personalizar as estratégias</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefingData.uploadedFiles.map((file, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {file}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Ver Estratégias Sugeridas
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Próximo passo</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                A IA vai analisar tudo isso e sugerir quantas estratégias (2-5) você deve criar, com direcionamentos específicos para cada uma. Você pode personalizar, editar ou criar estratégias adicionais depois.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
