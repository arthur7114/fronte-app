"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KeywordsTable } from "@/components/content-plan/keywords-table"
import { TopicsTable } from "@/components/content-plan/topics-table"
import { ContentCalendar } from "@/components/content-plan/content-calendar"

export default function PlanoConteudoPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Plano de Conteúdo
        </h1>
        <p className="mt-1 text-muted-foreground">
          Visualize e gerencie sua estratégia de palavras-chave e tópicos.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
          <TabsTrigger value="topics">Tópicos</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
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
  )
}
