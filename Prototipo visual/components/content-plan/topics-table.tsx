"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Edit2, Trash2, Plus, CheckCircle2 } from "lucide-react"

const topics = [
  {
    id: 1,
    title: "10 Dicas para Manter os Dentes Brancos",
    keywords: ["clareamento dental", "dentes brancos", "sorriso"],
    stage: "Consciência",
    priority: "alta",
    estimatedTraffic: "850",
    status: "approved",
  },
  {
    id: 2,
    title: "Quanto Custa um Implante Dentário em 2024",
    keywords: ["implante dentário preço", "valor implante"],
    stage: "Consideração",
    priority: "alta",
    estimatedTraffic: "1.2K",
    status: "approved",
  },
  {
    id: 3,
    title: "Clareamento Dental: Caseiro ou no Consultório?",
    keywords: ["clareamento dental", "clareamento caseiro"],
    stage: "Consideração",
    priority: "média",
    estimatedTraffic: "650",
    status: "pending",
  },
  {
    id: 4,
    title: "Por Que Meus Dentes Doem com Frio?",
    keywords: ["sensibilidade dental", "dor de dente"],
    stage: "Consciência",
    priority: "média",
    estimatedTraffic: "420",
    status: "pending",
  },
  {
    id: 5,
    title: "Guia Completo do Aparelho Invisível",
    keywords: ["aparelho invisível", "invisalign", "alinhadores"],
    stage: "Decisão",
    priority: "alta",
    estimatedTraffic: "980",
    status: "approved",
  },
]

const priorityColors = {
  alta: "bg-red-100 text-red-700",
  média: "bg-amber-100 text-amber-700",
  baixa: "bg-green-100 text-green-700",
}

const stageColors = {
  Consciência: "bg-blue-100 text-blue-700",
  Consideração: "bg-purple-100 text-purple-700",
  Decisão: "bg-green-100 text-green-700",
}

export function TopicsTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-primary" />
            Tópicos Sugeridos
          </CardTitle>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar tópico
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-muted-foreground">
          Tópicos gerados pela IA com base nas suas palavras-chave. Edite ou aprove para incluir no calendário.
        </p>

        <div className="space-y-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-xl border border-border p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{topic.title}</h3>
                    {topic.status === "approved" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topic.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className={stageColors[topic.stage as keyof typeof stageColors]}
                    >
                      {topic.stage}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={priorityColors[topic.priority as keyof typeof priorityColors]}
                    >
                      Prioridade {topic.priority}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ~{topic.estimatedTraffic} visitas/mês
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {topic.status === "pending" && (
                    <Button size="sm" className="ml-2">
                      Aprovar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
