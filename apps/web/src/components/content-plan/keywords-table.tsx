"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Target, ArrowUpDown, Search, Filter, Download, Sparkles,
  ShieldBan, Trash2, ShieldOff, MoreHorizontal, CheckCircle2, Loader2,
  Clock, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KeywordItem } from "@/lib/strategies";
import { KEYWORDS } from "@/lib/strategies";
import { RejectItemDialog } from "./reject-item-dialog";
import {
  getBannedForStrategy, isRejected, unbanItem, useWorkspaceStore,
} from "@/lib/workspace-store";
import {
  addManualKeywords, triggerKeywordStrategy, massApproveKeywords, massRejectKeywords, massDeleteKeywords,
} from "@/app/dashboard/estrategias/actions";
import { useJobStatus } from "@/hooks/use-job-status";
import { JobStatusBanner } from "@/components/ui/job-status-banner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const difficultyColors = {
  baixa: "bg-green-100 text-green-700",
  média: "bg-amber-100 text-amber-700",
  alta: "bg-red-100 text-red-700",
};

const stageColors: Record<string, string> = {
  consciência: "bg-blue-100 text-blue-700",
  consideração: "bg-purple-100 text-purple-700",
  decisão: "bg-green-100 text-green-700",
  awareness: "bg-blue-100 text-blue-700",
  consideration: "bg-purple-100 text-purple-700",
  decision: "bg-green-100 text-green-700",
};

type EnrichedKwData = {
  search_volume_int?: number
  difficulty?: number
  cpc?: number
  competition_level?: string
  search_intent?: string
}

const intentLabels: Record<string, string> = {
  informational: "informacional",
  navigational: "navegacional",
  commercial: "comercial",
  transactional: "transacional",
}

function getVolumeBadge(vol: number | null | undefined) {
  if (!vol) return null;
  const fmt = new Intl.NumberFormat("pt-BR").format(vol);
  let color = "bg-yellow-100 text-yellow-700";
  if (vol >= 10000) color = "bg-green-100 text-green-700";
  else if (vol >= 1000) color = "bg-blue-100 text-blue-700";
  return <Badge variant="secondary" className={color}>{fmt}/mês</Badge>;
}

function getCpcBadge(cpc: number | null | undefined) {
  if (!cpc) return null;
  const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cpc);
  return <Badge variant="secondary" className="bg-purple-100 text-purple-700">{fmt}</Badge>;
}

function getIntentBadge(intent: string | null | undefined) {
  if (!intent) return null;
  const label = intentLabels[intent] ?? intent;
  return <Badge variant="secondary" className="bg-sky-100 text-sky-700 capitalize">{label}</Badge>;
}

function getDifficultyBadge(difficulty: number | string | undefined) {
  if (typeof difficulty === "number") {
    let color = "bg-green-100 text-green-700";
    let label = "Baixa";
    if (difficulty > 60) {
      color = "bg-red-100 text-red-700";
      label = "Alta";
    } else if (difficulty > 30) {
      color = "bg-amber-100 text-amber-700";
      label = "Média";
    }
    return <Badge variant="secondary" className={color}>{label} ({difficulty})</Badge>;
  }

  const diff = String(difficulty || "baixa").toLowerCase();
  const color = difficultyColors[diff as keyof typeof difficultyColors] || difficultyColors.baixa;
  return <Badge variant="secondary" className={cn("capitalize", color)}>{diff}</Badge>;
}

type KeywordsTableProps = {
  keywords?: KeywordItem[];
  strategyId?: string;
  strategyName?: string;
  showActions?: boolean;
};

export function KeywordsTable({
  keywords = KEYWORDS, strategyId, strategyName, showActions = true,
}: KeywordsTableProps) {
  useWorkspaceStore();

  const [rejecting, setRejecting] = useState<KeywordItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const jobStatus = useJobStatus(strategyId ?? "", "generate_keyword_strategy");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [enrichedData, setEnrichedData] = useState<Record<string, EnrichedKwData>>({});

  const handleEnrich = async (kw: KeywordItem) => {
    if (!strategyId || enrichingId) return;
    setEnrichingId(kw.id);
    try {
      const res = await fetch("/api/dataforseo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw.keyword, strategy_id: strategyId, save: true }),
      });
      const data = await res.json();
      if (data.primary) {
        setEnrichedData((prev) => ({
          ...prev,
          [kw.id]: {
            search_volume_int: data.primary.search_volume,
            difficulty: data.primary.keyword_difficulty,
            cpc: data.primary.cpc,
            competition_level: data.primary.competition_level,
            search_intent: data.primary.search_intent,
          },
        }));
        toast.success("Dados DataForSEO carregados!");
      }
    } catch {
      toast.error("Erro ao enriquecer keyword");
    } finally {
      setEnrichingId(null);
    }
  };

  const handleSelectAll = (checked: boolean, list: KeywordItem[]) => {
    setSelectedItems(checked ? list.map((i) => i.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedItems((prev) => checked ? [...prev, id] : prev.filter((i) => i !== id));
  };

  const handleMassAction = (action: "approve" | "reject" | "delete") => {
    if (selectedItems.length === 0) return;
    startTransition(async () => {
      let result;
      if (action === "approve") result = await massApproveKeywords(selectedItems);
      else if (action === "reject") result = await massRejectKeywords(selectedItems);
      else result = await massDeleteKeywords(selectedItems);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setSelectedItems([]);
      }
    });
  };

  const handleSuggestMore = (keywordCount = 10) => {
    if (!strategyId) return;
    jobStatus.trigger();
    startTransition(async () => {
      const result = await triggerKeywordStrategy(strategyId, keywordCount);
      if (result.error) toast.error(result.error);
      else setSuggestOpen(false);
    });
  };

  const effective = useMemo(
    () => keywords.map((k) => isRejected(k.id) ? { ...k, status: "rejected" as const } : k),
    [keywords],
  );

  const approvedCount = effective.filter((k) => k.status === "approved").length;
  const suggestedCount = effective.filter((k) => k.status === "suggested").length;
  const rejectedCount = effective.filter((k) => k.status === "rejected").length;

  const suggestedList = effective.filter((k) => k.status === "suggested");
  const approvedList = effective.filter((k) => k.status === "approved");
  const rejectedList = effective.filter((k) => k.status === "rejected");
  const bannedInStrategy = strategyId ? getBannedForStrategy(strategyId, "keyword") : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Palavras-chave
              {strategyName && <Badge variant="secondary" className="ml-1 font-normal">{strategyName}</Badge>}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {effective.length} no total · {approvedCount} aprovadas · {suggestedCount} sugestões · {rejectedCount} descartadas
            </p>
          </div>
          {showActions && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Buscar palavra-chave..." className="ml-2 w-44 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </div>
              <Button variant="outline" size="icon" aria-label="Filtrar"><Filter className="h-4 w-4" /></Button>
              <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
              <Button variant="outline" className="gap-2" onClick={() => setAddOpen(true)} disabled={!strategyId}>
                <Plus className="h-4 w-4" />Adicionar palavras-chave
              </Button>
              <Button className="gap-2" onClick={() => setSuggestOpen(true)} disabled={isPending || jobStatus.isRunning || !strategyId}>
                <Sparkles className="h-4 w-4" />
                {isPending ? "Enviando..." : "Sugerir"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <JobStatusBanner
          status={jobStatus.status}
          jobLabel="keywords"
          count={keywords.length}
          errorMessage={jobStatus.errorMessage}
          onRetry={() => handleSuggestMore()}
          onDismiss={jobStatus.dismiss}
          className="mb-4"
        />
        <Tabs defaultValue="suggested" className="space-y-4">
          <TabsList>
            <TabsTrigger value="suggested">Sugestões ({suggestedList.length})</TabsTrigger>
            <TabsTrigger value="approved">Aprovadas ({approvedList.length})</TabsTrigger>
            <TabsTrigger value="rejected">Descartadas ({rejectedList.length})</TabsTrigger>
            {strategyId && <TabsTrigger value="banned">Blacklist ({bannedInStrategy.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="suggested" className="m-0">
            <KeywordsContent
              keywords={suggestedList} onReject={setRejecting}
              emptyHint="Peça à IA para sugerir oportunidades para esta estratégia."
              selectedItems={selectedItems} onSelect={handleSelect}
              onSelectAll={(c) => handleSelectAll(c, suggestedList)}
              enrichedData={enrichedData} enrichingId={enrichingId}
              onEnrich={strategyId ? handleEnrich : undefined}
            />
          </TabsContent>

          <TabsContent value="approved" className="m-0">
            <KeywordsContent
              keywords={approvedList} onReject={setRejecting}
              emptyHint="Nenhuma palavra-chave aprovada."
              selectedItems={selectedItems} onSelect={handleSelect}
              onSelectAll={(c) => handleSelectAll(c, approvedList)}
              enrichedData={enrichedData} enrichingId={enrichingId}
              onEnrich={strategyId ? handleEnrich : undefined}
            />
          </TabsContent>

          <TabsContent value="rejected" className="m-0">
            <KeywordsContent
              keywords={rejectedList} emptyHint="Nenhuma palavra-chave descartada."
              rejectedView selectedItems={selectedItems}
              onSelect={handleSelect} onSelectAll={(c) => handleSelectAll(c, rejectedList)}
            />
          </TabsContent>

          {strategyId && (
            <TabsContent value="banned" className="m-0">
              <BlacklistKeywords items={bannedInStrategy} strategyName={strategyName} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {rejecting && (
        <RejectItemDialog
          open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}
          itemId={rejecting.id} kind="keyword" term={rejecting.keyword}
          strategyId={strategyId} strategyName={strategyName}
        />
      )}

      {strategyId && (
        <>
          <AddKeywordsDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            strategyId={strategyId}
          />
          <SuggestKeywordsDialog
            open={suggestOpen}
            onOpenChange={setSuggestOpen}
            pending={isPending || jobStatus.isRunning}
            onSubmit={handleSuggestMore}
          />
        </>
      )}

      {/* Floating Action Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-primary/20 bg-background/95 backdrop-blur px-6 py-3 shadow-2xl animate-in slide-in-from-bottom-10 border-solid ring-1 ring-primary/5">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">{selectedItems.length} selecionadas</span>
          <div className="h-4 w-px bg-border mx-1" />
          <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-muted" onClick={() => setSelectedItems([])} disabled={isPending}>Cancelar</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleMassAction("reject")} disabled={isPending}>
            <ShieldBan className="h-3.5 w-3.5" />Blacklist
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-red-200 hover:bg-red-50" onClick={() => handleMassAction("delete")} disabled={isPending}>
            <Trash2 className="h-3.5 w-3.5" />Excluir
          </Button>
          <Button size="sm" className="gap-1.5 bg-primary shadow-lg hover:shadow-primary/20 transition-all" onClick={() => handleMassAction("approve")} disabled={isPending}>
            <CheckCircle2 className="h-3.5 w-3.5" />Aprovar Todas
          </Button>
        </div>
      )}
    </Card>
  );
}

function KeywordsContent({
  keywords, onReject, emptyHint, rejectedView = false,
  selectedItems, onSelect, onSelectAll,
  enrichedData, enrichingId, onEnrich,
}: {
  keywords: KeywordItem[];
  onReject?: (kw: KeywordItem) => void;
  emptyHint: string;
  rejectedView?: boolean;
  selectedItems?: string[];
  onSelect?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  enrichedData?: Record<string, EnrichedKwData>;
  enrichingId?: string | null;
  onEnrich?: (kw: KeywordItem) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDeleteOne = (kwId: string) => {
    startTransition(async () => {
      const result = await massDeleteKeywords([kwId]);
      if (result.error) toast.error(result.error);
      else toast.success("Palavra-chave excluída.");
    });
  };

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
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox checked={keywords.length > 0 && keywords.every(k => selectedItems?.includes(k.id))} onCheckedChange={(c) => onSelectAll?.(!!c)} />
            </TableHead>
            <TableHead className="w-[300px]">
              <button className="flex items-center gap-1 hover:text-foreground">Palavra-chave<ArrowUpDown className="h-3 w-3" /></button>
            </TableHead>
            <TableHead>Dificuldade</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>CPC</TableHead>
            <TableHead>Intenção</TableHead>
            <TableHead>Potencial</TableHead>
            <TableHead>Estágio</TableHead>
            <TableHead className="w-[110px]">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((kw) => {
            const enriched = enrichedData?.[kw.id];
            const volumeInt = enriched?.search_volume_int ?? kw.search_volume_int;
            const difficulty = enriched?.difficulty ?? kw.difficulty;
            const cpc = enriched?.cpc ?? kw.cpc;
            const intent = enriched?.search_intent ?? kw.search_intent;
            return (
              <TableRow
                key={kw.id}
                className={cn(
                  "group transition-colors",
                  kw.status === "approved"
                    ? "hover:bg-green-50/40"
                    : "hover:bg-muted/50 border-l-2 border-l-amber-300",
                )}
              >
                <TableCell><Checkbox checked={selectedItems?.includes(kw.id)} onCheckedChange={(c) => onSelect?.(kw.id, !!c)} /></TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      {kw.status === "approved" && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      )}
                      <span className={cn(kw.status === "approved" ? "text-foreground" : "text-foreground/80")}>
                        {kw.keyword}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{kw.type}</span>
                  </div>
                </TableCell>
                <TableCell>{getDifficultyBadge(difficulty)}</TableCell>
                <TableCell>
                  {volumeInt
                    ? getVolumeBadge(volumeInt)
                    : <span className="text-sm font-medium text-muted-foreground">{kw.search_volume || kw.traffic || "---"}</span>}
                </TableCell>
                <TableCell>{getCpcBadge(cpc)}</TableCell>
                <TableCell>{getIntentBadge(intent)}</TableCell>
                <TableCell className="max-w-[200px]">
                  <p className="truncate text-xs text-muted-foreground" title={kw.estimated_potential || ""}>
                    {kw.estimated_potential || "Analisando..."}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("capitalize text-[10px] px-1.5 py-0", stageColors[String(kw.stage).toLowerCase()] || "bg-muted text-muted-foreground")}>
                    {kw.stage}
                  </Badge>
                </TableCell>
                {/* ── Status column ─────────────────────────────── */}
                <TableCell>
                  {kw.status === "approved" ? (
                    <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 text-[11px]">
                      <CheckCircle2 className="h-3 w-3" />Aprovada
                    </Badge>
                  ) : kw.status === "rejected" ? (
                    <Badge variant="secondary" className="gap-1 bg-red-100 text-red-700 text-[11px]">
                      <ShieldBan className="h-3 w-3" />Descartada
                    </Badge>
                  ) : (
                    <button
                      className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100 hover:border-amber-400 disabled:opacity-50"
                      onClick={() => massApproveKeywords([kw.id]).then(r => r.error ? toast.error(r.error) : toast.success("Aprovada!"))}
                      title="Clique para aprovar"
                    >
                      <Clock className="h-3 w-3" />Sugerida
                    </button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEnrich && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onEnrich(kw)}
                        disabled={!!enrichingId}
                        title="Enriquecer com DataForSEO"
                      >
                        {enrichingId === kw.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Sparkles className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteOne(kw.id)}
                      disabled={isPending}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {kw.status === "suggested" && (
                          <DropdownMenuItem onClick={() => massApproveKeywords([kw.id]).then(r => r.error ? toast.error(r.error) : toast.success("Aprovada!"))}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />Aprovar
                          </DropdownMenuItem>
                        )}
                        {onEnrich && (
                          <DropdownMenuItem onClick={() => onEnrich(kw)} disabled={!!enrichingId}>
                            <Sparkles className="mr-2 h-4 w-4 text-primary" />
                            {enrichingId === kw.id ? "Enriquecendo..." : "Enriquecer com DataForSEO"}
                          </DropdownMenuItem>
                        )}
                        {kw.status !== "rejected" && (
                          <DropdownMenuItem onClick={() => onReject?.(kw)}>
                            <ShieldBan className="mr-2 h-4 w-4 text-amber-600" />Descartar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteOne(kw.id)} disabled={isPending}>
                          <Trash2 className="mr-2 h-4 w-4" />Excluir definitivamente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AddKeywordsDialog({
  open,
  onOpenChange,
  strategyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategyId: string;
}) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const keywordsCount = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length;

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await addManualKeywords(strategyId, value);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success);
      setValue("");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar palavras-chave</DialogTitle>
          <DialogDescription>Informe uma palavra-chave por linha. Linhas vazias e duplicadas serao ignoradas.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={8}
          maxLength={3000}
          placeholder={"seo local\nconteudo evergreen\nplanejamento editorial"}
        />
        <p className="text-xs text-muted-foreground">{Math.min(keywordsCount, 50)} de 50 por envio</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending || keywordsCount === 0}>
            {isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SuggestKeywordsDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onSubmit: (keywordCount: number) => void;
}) {
  const [count, setCount] = useState(10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sugerir palavras-chave</DialogTitle>
          <DialogDescription>Confirme a quantidade de sugestoes que a IA deve gerar para esta estrategia.</DialogDescription>
        </DialogHeader>
        <label className="grid gap-2 text-sm font-medium">
          Quantidade
          <Input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button>
          <Button onClick={() => onSubmit(Math.max(1, Math.min(50, count || 10)))} disabled={pending}>
            {pending ? "Enviando..." : "Sugerir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BlacklistKeywords({ items, strategyName }: {
  items: ReturnType<typeof getBannedForStrategy>;
  strategyName?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <ShieldBan className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">Nenhum termo na blacklist</p>
          <p className="mt-1 text-sm text-muted-foreground">Ao reprovar, você pode adicionar o termo à blacklist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Termo bloqueado</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Adicionado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.term}</TableCell>
              <TableCell className="max-w-md"><span className="text-sm text-muted-foreground">{item.note || <em className="text-muted-foreground/70">sem nota</em>}</span></TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(item.bannedAt).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={() => unbanItem(item.id)}>
                  <ShieldOff className="h-3.5 w-3.5" />Remover da blacklist
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {strategyName && (
        <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          Estes termos não serão mais sugeridos pela IA em {strategyName}.
        </div>
      )}
    </div>
  );
}
