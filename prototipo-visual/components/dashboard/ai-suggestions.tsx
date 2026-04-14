import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, RefreshCcw, Zap } from "lucide-react"

const suggestions = [
  {
    id: 1,
    title: "Escrever sobre clareamento",
    description: "Este tema está em alta na sua região e pode trazer +500 visitas/mês",
    icon: TrendingUp,
    priority: "high",
  },
  {
    id: 2,
    title: "Atualizar artigo antigo",
    description: "\"Cuidados com implantes\" pode melhorar 3 posições com pequenas edições",
    icon: RefreshCcw,
    priority: "medium",
  },
  {
    id: 3,
    title: "Adicionar CTA ao post",
    description: "O artigo \"Dor de dente\" recebe visitas mas não tem chamada para ação",
    icon: Zap,
    priority: "medium",
  },
]

const priorityStyles = {
  high: "border-l-green-500 bg-green-50/50",
  medium: "border-l-amber-500 bg-amber-50/50",
  low: "border-l-blue-500 bg-blue-50/50",
}

export function AISuggestions() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Sugestões da IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Ações recomendadas para melhorar seus resultados:
        </p>
        
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`cursor-pointer rounded-lg border-l-4 p-4 transition-all hover:shadow-sm ${
              priorityStyles[suggestion.priority as keyof typeof priorityStyles]
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <suggestion.icon className="h-4 w-4 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {suggestion.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        <button className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          Ver mais sugestões
        </button>
      </CardContent>
    </Card>
  )
}
