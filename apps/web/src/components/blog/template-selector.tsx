"use client"

import { useActionState, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Layout } from "lucide-react"
import { cn } from "@/lib/utils"
import { saveBlogTemplate, type SiteState } from "@/app/app/blog/actions"

const templates = [
  {
    id: "minimal",
    name: "Minimalista",
    description: "Limpo e elegante, foco no conteúdo",
    preview: "bg-white",
  },
  {
    id: "modern",
    name: "Moderno",
    description: "Design contemporâneo com cards",
    preview: "bg-slate-50",
  },
  {
    id: "magazine",
    name: "Magazine",
    description: "Estilo editorial com destaques",
    preview: "bg-stone-50",
  },
  {
    id: "bold",
    name: "Impactante",
    description: "Tipografia grande e chamativa",
    preview: "bg-zinc-50",
  },
]

const initialState: SiteState = {}

export function TemplateSelector({ currentTemplate = "minimal" }: { currentTemplate?: string | null }) {
  const [state, formAction, pending] = useActionState(saveBlogTemplate, initialState)
  const [selected, setSelected] = useState(currentTemplate === "starter" ? "minimal" : currentTemplate ?? "minimal")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layout className="h-5 w-5 text-primary" />
          Escolha o Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-muted-foreground">
          Selecione o estilo visual que melhor representa sua marca. Você pode trocar a qualquer momento.
        </p>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <form key={template.id} action={formAction}>
              <input type="hidden" name="theme_id" value={template.id} />
              <button
                type="submit"
                disabled={pending}
                onClick={() => setSelected(template.id)}
                className={cn(
                  "group relative h-full w-full rounded-xl border-2 p-4 text-left transition-all disabled:opacity-60",
                  selected === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                {selected === template.id && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                
                <div className={cn("mb-3 h-24 rounded-lg border border-border", template.preview)}>
                  <div className="flex h-full flex-col p-3">
                    <div className="mb-2 h-2 w-1/3 rounded bg-muted" />
                    <div className="h-2 w-full rounded bg-muted/60" />
                    <div className="mt-1 h-2 w-2/3 rounded bg-muted/60" />
                    <div className="mt-auto flex gap-2">
                      <div className="h-6 w-6 rounded bg-muted" />
                      <div className="h-6 w-6 rounded bg-muted" />
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-foreground">{template.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {template.description}
                </p>
              </button>
            </form>
          ))}
        </div>
        {(state.error || state.success) && (
          <p className={cn("mt-4 text-sm", state.error ? "text-destructive" : "text-green-700")}>
            {state.error || state.success}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
