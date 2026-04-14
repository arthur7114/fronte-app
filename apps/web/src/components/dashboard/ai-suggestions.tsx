import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export interface SuggestionData {
  id: string
  title: string
  description: string
  icon: React.ElementType
  priority: "high" | "medium" | "low"
}

interface AISuggestionsProps {
  suggestions: SuggestionData[]
}

const priorityStyles = {
  high: "border-l-green-500 bg-green-50/50",
  medium: "border-l-amber-500 bg-amber-50/50",
  low: "border-l-blue-500 bg-blue-50/50",
}

export function AISuggestions({ suggestions }: AISuggestionsProps) {
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
        
        {suggestions.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            A IA está avaliando seu projeto. Suas sugestões aparecerão aqui em breve.
          </div>
        )}

        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`cursor-pointer rounded-lg border-l-4 p-4 transition-all hover:shadow-sm ${
              priorityStyles[suggestion.priority] || priorityStyles.low
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

        {suggestions.length > 0 && (
          <button className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            Ver mais sugestões
          </button>
        )}
      </CardContent>
    </Card>
  )
}
