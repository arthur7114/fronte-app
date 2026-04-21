"use client"

import { useMemo, useState } from "react"
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Target,
  ArrowUpDown,
  Search,
  Filter,
  Download,
  Plus,
  Sparkles,
  Ban,
  Trash2,
  ShieldOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { KeywordItem } from "@/lib/strategies"
import { KEYWORDS } from "@/lib/strategies"
import { RejectItemDialog } from "./reject-item-dialog"
import {
  getBannedForStrategy,
  isRejected,
  unbanItem,
  useWorkspaceStore,
} from "@/lib/workspace-store"

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

type KeywordsTableProps = {
  keywords?: KeywordItem[]
  strategyId?: string
  strategyName?: string
  showActions?: boolean
}

export function KeywordsTable({
  keywords = KEYWORDS,
  strategyId,
  strategyName,
  showActions = true,
}: KeywordsTableProps) {
  // força re-render ao rejeitar/banir
  useWorkspaceStore()

  const [rejecting, setRejecting] = useState<KeywordItem | null>(null)

  const effective = useMemo(
    () =>
      keywords.map((k) =>
        isRejected(k.id) ? { ...k, status: "rejected" as const } : k,
      ),
    [keywords],
  )

  const approvedCount = effective.filter((k) => k.status === "approved").length
  const pendingCount = effective.filter((k) => k.status === "pending").length
  const rejectedCount = effective.filter((k) => k.status === "rejected").length

  const activeList = effective.filter((k) => k.status !== "rejected")
  const rejectedList = effective.filter((k) => k.status === "rejected")

  const bannedInStrategy = strategyId
    ? getBannedForStrategy(strategyId, "keyword")
    : []

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Palavras-chave
              {strategyName && (
                <Badge variant="secondary" className="ml-1 font-normal">
                  {strategyName}
                </Badge>
              )}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {effective.length} no total · {approvedCount} aprovadas ·{" "}
              {pendingCount} aguardando · {rejectedCount} reprovadas
            </p>
          </div>
          {showActions && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar palavra-chave..."
                  className="ml-2 w-44 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="outline" size="icon" aria-label="Filtrar">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Sugerir mais
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Ativas ({activeList.length})</TabsTrigger>
            <TabsTrigger value="rejected">
              Reprovadas ({rejectedList.length})
            </TabsTrigger>
            {strategyId && (
              <TabsTrigger value="banned">
                Banidas ({bannedInStrategy.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="active" className="m-0">
            <KeywordsContent
              keywords={activeList}
              onReject={setRejecting}
              emptyHint="Peça à IA para sugerir oportunidades para esta estratégia."
            />
          </TabsContent>

          <TabsContent value="rejected" className="m-0">
            <KeywordsContent
              keywords={rejectedList}
              emptyHint="Nenhuma palavra-chave reprovada."
              rejectedView
            />
          </TabsContent>

          {strategyId && (
            <TabsContent value="banned" className="m-0">
              <BannedStrategyKeywords
                items={bannedInStrategy}
                strategyName={strategyName}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {rejecting && (
        <RejectItemDialog
          open={!!rejecting}
          onOpenChange={(open) => !open && setRejecting(null)}
          itemId={rejecting.id}
          kind="keyword"
          term={rejecting.keyword}
          strategyId={strategyId}
          strategyName={strategyName}
        />
      )}
    </Card>
  )
}

function KeywordsContent({
  keywords,
  onReject,
  emptyHint,
  rejectedView = false,
}: {
  keywords: KeywordItem[]
  onReject?: (kw: KeywordItem) => void
  emptyHint: string
  rejectedView?: boolean
}) {
  if (keywords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">Nada por aqui ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyHint}</p>
        </div>
      </div>
    )
  }

  return (
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
            <TableHead>Dificuldade</TableHead>
            <TableHead>Tráfego</TableHead>
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
                  className={cn("capitalize", difficultyColors[kw.difficulty])}
                >
                  {kw.difficulty}
                </Badge>
              </TableCell>
              <TableCell>{kw.traffic}/mês</TableCell>
              <TableCell>
                <Badge variant="secondary" className={stageColors[kw.stage]}>
                  {kw.stage}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{kw.type}</span>
              </TableCell>
              <TableCell className="text-right">
                {rejectedView ? (
                  <Badge variant="secondary" className="text-muted-foreground">
                    Reprovada
                  </Badge>
                ) : kw.status === "pending" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject?.(kw)}
                    >
                      Reprovar
                    </Button>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Gerar tópico
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Badge className="bg-green-100 text-green-700">Aprovada</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label="Reprovar"
                      onClick={() => onReject?.(kw)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function BannedStrategyKeywords({
  items,
  strategyName,
}: {
  items: ReturnType<typeof getBannedForStrategy>
  strategyName?: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <Ban className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            Nenhuma palavra banida nesta estratégia
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ao reprovar, você pode optar por banir o termo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Palavra banida</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Banido em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.term}</TableCell>
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
      {strategyName && (
        <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          Estas palavras não serão mais sugeridas pela IA em {strategyName}.
        </div>
      )}
    </div>
  )
}
