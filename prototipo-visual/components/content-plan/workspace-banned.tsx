"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ban, ShieldOff } from "lucide-react"
import {
  getBannedForWorkspace,
  unbanItem,
  useWorkspaceStore,
} from "@/lib/workspace-store"

export function WorkspaceBannedCard() {
  useWorkspaceStore()
  const [tab, setTab] = useState<"keyword" | "topic">("keyword")

  const keywords = getBannedForWorkspace("keyword")
  const topics = getBannedForWorkspace("topic")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ban className="h-5 w-5 text-primary" />
          Palavras e tópicos banidos
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Termos banidos no workspace inteiro não serão sugeridos pela IA em
          nenhuma estratégia. Para banidos específicos de uma estratégia, abra
          a aba "Banidas" dentro da própria estratégia.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="keyword">
              Palavras-chave ({keywords.length})
            </TabsTrigger>
            <TabsTrigger value="topic">Tópicos ({topics.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="keyword" className="m-0 mt-4">
            <BannedTable items={keywords} empty="Nenhuma palavra-chave banida no workspace." />
          </TabsContent>
          <TabsContent value="topic" className="m-0 mt-4">
            <BannedTable items={topics} empty="Nenhum tópico banido no workspace." />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function BannedTable({
  items,
  empty,
}: {
  items: ReturnType<typeof getBannedForWorkspace>
  empty: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
          <Ban className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{empty}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Termo</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Banido em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {item.term}
                  <Badge variant="outline" className="text-[10px] font-normal">
                    workspace
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="max-w-md">
                <span className="text-sm text-muted-foreground">
                  {item.note || (
                    <em className="text-muted-foreground/70">sem nota</em>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(item.bannedAt).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => unbanItem(item.id)}
                >
                  <ShieldOff className="h-3.5 w-3.5" />
                  Desbanir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
