"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Save, Sparkles, Sliders, Bot } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { saveStrategyAiConfig } from "./actions"

type OperationMode = "manual" | "assisted" | "automatic"

type AiConfigPanelProps = {
  strategyId: string
  defaults: {
    operation_mode?: OperationMode | null
    quality_threshold?: number | null
    ai_model_override?: string | null
    tone_override?: string | null
    audience_override?: string | null
  }
  tenantDefaults: {
    model?: string | null
    tone_of_voice?: string | null
  }
}

const MODE_DESC: Record<OperationMode, string> = {
  manual: "Aprovação humana em cada etapa: keywords, tópicos, brief e draft.",
  assisted:
    "Encadeia keywords → tópicos → brief sozinho. Aprovação só no draft final antes da publicação.",
  automatic:
    "Tudo automático até publicação. Cai em revisão humana se SEO score < threshold de qualidade.",
}

const MODEL_OPTIONS = ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano"]

export function AiConfigPanel({ strategyId, defaults, tenantDefaults }: AiConfigPanelProps) {
  const [mode, setMode] = useState<OperationMode>(
    (defaults.operation_mode as OperationMode | null) ?? "manual",
  )
  const [threshold, setThreshold] = useState<number>(defaults.quality_threshold ?? 70)
  const [modelOverride, setModelOverride] = useState(defaults.ai_model_override ?? "")
  const [toneOverride, setToneOverride] = useState(defaults.tone_override ?? "")
  const [audienceOverride, setAudienceOverride] = useState(defaults.audience_override ?? "")
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveStrategyAiConfig(strategyId, {
        operation_mode: mode,
        quality_threshold: threshold,
        ai_model_override: modelOverride.trim() || null,
        tone_override: toneOverride.trim() || null,
        audience_override: audienceOverride.trim() || null,
      })
      if ("error" in result) {
        toast.error("Não foi possível salvar.", { description: result.error })
        return
      }
      toast.success("Configuração de IA salva.")
    })
  }

  return (
    <div className="space-y-5">
      {/* Operation mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            Modo de operação
          </CardTitle>
          <CardDescription>
            Define quanto de intervenção humana o pipeline de IA exige.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as OperationMode)}>
            {(Object.keys(MODE_DESC) as OperationMode[]).map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30"
              >
                <RadioGroupItem value={m} id={`mode-${m}`} className="mt-1" />
                <div>
                  <span className="font-medium capitalize">{m}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">{MODE_DESC[m]}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Quality threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sliders className="h-4 w-4 text-primary" />
            Threshold de qualidade
          </CardTitle>
          <CardDescription>
            Em modo <strong>automático</strong>, artigos com SEO score abaixo deste valor são
            enviados para revisão humana (fallback HITL).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="w-20"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Sugestão: 70+ para conservador, 50-69 para permissivo, 0 para nunca cair em HITL.
          </p>
        </CardContent>
      </Card>

      {/* AI overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Overrides desta estratégia
          </CardTitle>
          <CardDescription>
            Quando vazio, usa o default do tenant (configurado em{" "}
            <a href="/app/configuracoes" className="text-primary underline-offset-2 hover:underline">
              Configurações da IA
            </a>
            ).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="model-override">Modelo OpenAI</Label>
            <Input
              id="model-override"
              list="model-options"
              placeholder={tenantDefaults.model ?? "gpt-4o-mini"}
              value={modelOverride}
              onChange={(e) => setModelOverride(e.target.value)}
            />
            <datalist id="model-options">
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-muted-foreground">
              Default do tenant: <code>{tenantDefaults.model ?? "gpt-4o-mini"}</code>
            </p>
          </div>

          <div>
            <Label htmlFor="tone-override">Tom de voz</Label>
            <Textarea
              id="tone-override"
              placeholder={tenantDefaults.tone_of_voice ?? "profissional e acessível"}
              value={toneOverride}
              onChange={(e) => setToneOverride(e.target.value)}
              rows={2}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Default do tenant: {tenantDefaults.tone_of_voice ?? "—"}
            </p>
          </div>

          <div>
            <Label htmlFor="audience-override">Audiência</Label>
            <Textarea
              id="audience-override"
              placeholder="Ex: pequenos varejistas de moda urbana, 25-40 anos, focados em..."
              value={audienceOverride}
              onChange={(e) => setAudienceOverride(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? "Salvando..." : "Salvar configuração"}
        </Button>
      </div>
    </div>
  )
}
