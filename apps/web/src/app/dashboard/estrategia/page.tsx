import Link from "next/link";
import { ArrowRight, Lightbulb, Plus, Sparkles } from "lucide-react";
import { loadAutomationWorkspaceData } from "@/app/app/estrategias/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function StrategyPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Estrategia de Conteudo</h1>
          <p className="mt-1 text-muted-foreground">
            Escolha uma estrategia para abrir a experiencia de conversa do prototipo.
          </p>
        </div>
        <Button className="w-fit gap-2">
          <Plus className="h-4 w-4" />
          Nova estrategia
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">Fluxo multi-estrategia</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta tela e apenas o seletor. A interface fiel ao prototipo fica em cada detalhe de estrategia.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.strategies.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Nenhuma estrategia criada</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Crie sua primeira frente editorial para abrir a conversa estrategica do prototipo.
              </p>
            </CardContent>
          </Card>
        ) : data.strategies.map((strategy) => (
          <Link key={strategy.id} href={`/dashboard/estrategia/${strategy.id}`}>
            <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">{strategy.status ?? "ativa"}</Badge>
                </div>
                <h2 className="font-semibold text-foreground">{strategy.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {strategy.focus || "Abra a estrategia para conversar com a IA, revisar contexto e gerar o plano editorial."}
                </p>
                <div className="mt-5 flex items-center text-sm font-medium text-primary">
                  Abrir conversa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
