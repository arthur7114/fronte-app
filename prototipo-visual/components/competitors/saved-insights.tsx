"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bookmark, Lightbulb, Target, Trash2 } from "lucide-react"
import {
  removeInsight,
  type SavedInsight,
} from "@/lib/competitors-store"

type Props = {
  insights: SavedInsight[]
  onContinue: () => void
}

export function SavedInsights({ insights, onContinue }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bookmark className="h-4 w-4 text-primary" />
            Insights salvos
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {insights.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Itens que vão alimentar tópicos, palavras-chave e ângulos desta estratégia.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              Nenhum insight salvo ainda. Salve oportunidades, lacunas ou temas
              relevantes dos concorrentes.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {insights.map((i) => (
              <li
                key={i.id}
                className="group rounded-md border border-border px-3 py-2.5 text-sm"
              >
                <div className="flex items-start gap-2">
                  <KindIcon kind={i.kind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {i.title}
                    </p>
                    {i.subtitle && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {i.subtitle}
                      </p>
                    )}
                    {i.appliedAs && (
                      <Badge
                        variant="outline"
                        className="mt-1.5 text-[10px] font-normal capitalize"
                      >
                        vira{" "}
                        {i.appliedAs === "topic"
                          ? "tópico"
                          : i.appliedAs === "keyword"
                            ? "palavra-chave"
                            : "ângulo"}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remover"
                    onClick={() => removeInsight(i.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button
          onClick={onContinue}
          disabled={insights.length === 0}
          className="w-full gap-2"
          size="sm"
        >
          Continuar para tópicos
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}

function KindIcon({ kind }: { kind: SavedInsight["kind"] }) {
  const Icon =
    kind === "opportunity" ? Lightbulb : kind === "competitor" ? Target : Bookmark
  return (
    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
    </div>
  )
}
