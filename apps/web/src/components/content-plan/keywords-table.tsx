"use client";

import { ArrowUpDown, Download, Filter, Search, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const keywords = [
  { id: 1, keyword: "dentista sao paulo zona sul", difficulty: "baixa", traffic: "1.2K", stage: "Decisao", type: "Long tail", status: "approved" },
  { id: 2, keyword: "clareamento dental preco", difficulty: "media", traffic: "2.8K", stage: "Consideracao", type: "Long tail", status: "approved" },
  { id: 3, keyword: "implante dentario", difficulty: "alta", traffic: "8.1K", stage: "Consciencia", type: "Short tail", status: "pending" },
  { id: 4, keyword: "quanto custa um canal", difficulty: "baixa", traffic: "1.5K", stage: "Consideracao", type: "Long tail", status: "approved" },
  { id: 5, keyword: "dor de dente o que fazer", difficulty: "media", traffic: "4.2K", stage: "Consciencia", type: "Long tail", status: "pending" },
  { id: 6, keyword: "aparelho ortodontico invisivel", difficulty: "alta", traffic: "3.6K", stage: "Consideracao", type: "Long tail", status: "rejected" },
];

const difficultyColors = {
  baixa: "bg-green-100 text-green-700",
  media: "bg-amber-100 text-amber-700",
  alta: "bg-red-100 text-red-700",
};

const stageColors = {
  Consciencia: "bg-blue-100 text-blue-700",
  Consideracao: "bg-orange-100 text-orange-700",
  Decisao: "bg-green-100 text-green-700",
};

export function KeywordsTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Palavras-chave
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
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
          Estas sao as palavras-chave identificadas para seu negocio. Aprove ou rejeite para ajustar sua estrategia.
        </p>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {["Palavra-chave", "Dificuldade", "Trafego", "Estagio", "Tipo"].map((header) => (
                  <TableHead key={header}>
                    <button type="button" className="flex items-center gap-1 hover:text-foreground">
                      {header}
                      {header !== "Tipo" ? <ArrowUpDown className="h-3 w-3" /> : null}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((keyword) => (
                <TableRow key={keyword.id}>
                  <TableCell className="font-medium">{keyword.keyword}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("capitalize", difficultyColors[keyword.difficulty as keyof typeof difficultyColors])}>
                      {keyword.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{keyword.traffic}/mes</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={stageColors[keyword.stage as keyof typeof stageColors]}>
                      {keyword.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{keyword.type}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {keyword.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">Rejeitar</Button>
                        <Button size="sm">Aprovar</Button>
                      </div>
                    ) : keyword.status === "approved" ? (
                      <Badge className="bg-green-100 text-green-700">Aprovada</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">Rejeitada</Badge>
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
            <Button variant="outline" size="sm" disabled>Anterior</Button>
            <Button variant="outline" size="sm">Proximo</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
