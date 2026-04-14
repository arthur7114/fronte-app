"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Target, ArrowUpDown, Search, Filter, Download } from "lucide-react"
import { cn } from "@/lib/utils"

const keywords = [
  {
    id: 1,
    keyword: "dentista são paulo zona sul",
    difficulty: "baixa",
    traffic: "1.2K",
    stage: "Decisão",
    type: "Long tail",
    status: "approved",
  },
  {
    id: 2,
    keyword: "clareamento dental preço",
    difficulty: "média",
    traffic: "2.8K",
    stage: "Consideração",
    type: "Long tail",
    status: "approved",
  },
  {
    id: 3,
    keyword: "implante dentário",
    difficulty: "alta",
    traffic: "8.1K",
    stage: "Consciência",
    type: "Short tail",
    status: "pending",
  },
  {
    id: 4,
    keyword: "quanto custa um canal",
    difficulty: "baixa",
    traffic: "1.5K",
    stage: "Consideração",
    type: "Long tail",
    status: "approved",
  },
  {
    id: 5,
    keyword: "dor de dente o que fazer",
    difficulty: "média",
    traffic: "4.2K",
    stage: "Consciência",
    type: "Long tail",
    status: "pending",
  },
  {
    id: 6,
    keyword: "aparelho ortodôntico invisível",
    difficulty: "alta",
    traffic: "3.6K",
    stage: "Consideração",
    type: "Long tail",
    status: "rejected",
  },
]

const difficultyColors = {
  baixa: "bg-green-100 text-green-700",
  média: "bg-amber-100 text-amber-700",
  alta: "bg-red-100 text-red-700",
}

const stageColors = {
  Consciência: "bg-blue-100 text-blue-700",
  Consideração: "bg-purple-100 text-purple-700",
  Decisão: "bg-green-100 text-green-700",
}

export function KeywordsTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Palavras-chave
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar palavra-chave..."
                className="ml-2 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Estas são as palavras-chave identificadas para seu negócio. Aprove ou rejeite para ajustar sua estratégia.
        </p>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <button className="flex items-center gap-1 hover:text-foreground">
                    Palavra-chave
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground">
                    Dificuldade
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground">
                    Tráfego
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((kw) => (
                <TableRow key={kw.id}>
                  <TableCell className="font-medium">{kw.keyword}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "capitalize",
                        difficultyColors[kw.difficulty as keyof typeof difficultyColors]
                      )}
                    >
                      {kw.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{kw.traffic}/mês</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={stageColors[kw.stage as keyof typeof stageColors]}
                    >
                      {kw.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{kw.type}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {kw.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          Rejeitar
                        </Button>
                        <Button size="sm">Aprovar</Button>
                      </div>
                    ) : kw.status === "approved" ? (
                      <Badge className="bg-green-100 text-green-700">
                        Aprovada
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Rejeitada
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando 6 de 156 palavras-chave</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
