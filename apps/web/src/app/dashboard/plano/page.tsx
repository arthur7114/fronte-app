"use client";

import { ContentCalendar } from "@/components/content-plan/content-calendar";
import { KeywordsTable } from "@/components/content-plan/keywords-table";
import { TopicsTable } from "@/components/content-plan/topics-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlanoConteudoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Plano de Conteudo</h1>
        <p className="mt-1 text-muted-foreground">
          Visualize e gerencie sua estrategia de palavras-chave e topicos.
        </p>
      </div>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
          <TabsTrigger value="topics">Topicos</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords">
          <KeywordsTable />
        </TabsContent>
        <TabsContent value="topics">
          <TopicsTable />
        </TabsContent>
        <TabsContent value="calendar">
          <ContentCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
