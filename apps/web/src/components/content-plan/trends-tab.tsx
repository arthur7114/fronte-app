"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, RefreshCw, TrendingUp } from "lucide-react";

interface KeywordSuggestion {
  keyword: string;
  search_volume: number;
  volume_tier: "alto" | "médio" | "baixo";
  keyword_difficulty: number;
  difficulty_tier: "fácil" | "médio" | "difícil";
  cpc: number;
  competition_level: string;
  search_intent: string;
}

interface TrendsTabProps {
  strategyId: string;
  primaryKeyword: string;
}

const intentLabels: Record<string, string> = {
  informational: "informacional",
  navigational: "navegacional",
  commercial: "comercial",
  transactional: "transacional",
};

const difficultyColors: Record<string, string> = {
  fácil: "bg-green-100 text-green-700",
  médio: "bg-amber-100 text-amber-700",
  difícil: "bg-red-100 text-red-700",
};

const volumeColors = (vol: number) => {
  if (vol >= 10000) return "bg-green-100 text-green-700";
  if (vol >= 1000) return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
};

export function TrendsTab({ strategyId, primaryKeyword }: TrendsTabProps) {
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingKw, setSavingKw] = useState<string | null>(null);
  const [savedKws, setSavedKws] = useState<Set<string>>(new Set());

  const fetchTrends = async () => {
    if (!primaryKeyword) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dataforseo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: primaryKeyword, strategy_id: strategyId, save: false }),
      });
      const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions);
      else toast.error("Nenhuma sugestão encontrada");
    } catch {
      toast.error("Erro ao carregar tendências");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryKeyword]);

  const handleAdd = async (kw: KeywordSuggestion) => {
    if (savedKws.has(kw.keyword)) return;
    setSavingKw(kw.keyword);
    try {
      await fetch("/api/dataforseo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw.keyword, strategy_id: strategyId, save: true }),
      });
      setSavedKws((prev) => new Set([...prev, kw.keyword]));
      toast.success(`"${kw.keyword}" adicionada à estratégia`);
    } catch {
      toast.error("Erro ao adicionar keyword");
    } finally {
      setSavingKw(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Tendências para "{primaryKeyword}"
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sugestões long-tail com volume real e intenção de busca
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTrends} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Buscando tendências no DataForSEO...</span>
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-lg border border-dashed border-border text-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground text-sm">Nenhuma tendência carregada</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Atualizar" para buscar sugestões.</p>
          </div>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((kw) => {
            const isSaved = savedKws.has(kw.keyword);
            const isSaving = savingKw === kw.keyword;
            return (
              <Card key={kw.keyword} className="border border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex flex-col gap-3">
                  <p className="font-medium text-sm text-foreground leading-snug">{kw.keyword}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className={volumeColors(kw.search_volume)}>
                      {new Intl.NumberFormat("pt-BR").format(kw.search_volume)}/mês
                    </Badge>
                    <Badge variant="secondary" className={difficultyColors[kw.difficulty_tier] ?? "bg-muted text-muted-foreground"}>
                      {kw.difficulty_tier} ({kw.keyword_difficulty})
                    </Badge>
                    {kw.cpc > 0 && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kw.cpc)}
                      </Badge>
                    )}
                    {kw.search_intent && (
                      <Badge variant="secondary" className="bg-sky-100 text-sky-700 capitalize">
                        {intentLabels[kw.search_intent] ?? kw.search_intent}
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isSaved ? "secondary" : "outline"}
                    className="w-full gap-1.5 mt-auto"
                    onClick={() => handleAdd(kw)}
                    disabled={isSaved || isSaving}
                  >
                    {isSaving
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Plus className="h-3.5 w-3.5" />}
                    {isSaved ? "Adicionada" : "Adicionar à estratégia"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
