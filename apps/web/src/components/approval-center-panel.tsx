"use client";

import type { Tables } from "@super/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  MessageSquare, 
  Search, 
  FileText, 
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PendingItem = {
  id: string;
  type: "keyword" | "tema" | "artigo";
  title: string;
  strategyName: string;
  strategyId: string;
  date: string;
  urgency: number; // 0-100 logic
};

export function ApprovalCenterPanel({
  keywords,
  topics,
  posts,
  strategies
}: {
  keywords: Tables<"keyword_candidates">[];
  topics: Tables<"topic_candidates">[];
  posts: Tables<"posts">[];
  strategies: Tables<"strategies">[];
}) {
  const pendingKeywords = keywords.filter(k => k.status === "pending");
  const pendingTopics = topics.filter(t => t.status === "pending");
  // Post pending review? Let's assume posts with status draft/review
  const pendingPosts = posts.filter(p => !p.published_at);

  const items: PendingItem[] = [
    ...pendingKeywords.map(k => ({
      id: k.id,
      type: "keyword" as const,
      title: k.keyword,
      strategyId: k.strategy_id || "",
      strategyName: strategies.find(s => s.id === k.strategy_id)?.name || "Geral",
      date: k.created_at,
      urgency: 30,
    })),
    ...pendingTopics.map(t => ({
      id: t.id,
      type: "tema" as const,
      title: t.topic,
      strategyId: t.strategy_id || "",
      strategyName: strategies.find(s => s.id === t.strategy_id)?.name || "Geral",
      date: t.created_at,
      urgency: 60,
    })),
    ...pendingPosts.map(p => ({
      id: p.id,
      type: "artigo" as const,
      title: p.title || "Artigo sem título",
      strategyId: "", // Posts might not have strategy_id directly yet in the DB
      strategyName: "Produção",
      date: p.created_at,
      urgency: 90,
    })),
  ].sort((a, b) => b.urgency - a.urgency);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Artigos em Revisão" count={pendingPosts.length} color="text-primary" />
        <StatCard title="Temas Pendentes" count={pendingTopics.length} color="text-amber-600" />
        <StatCard title="Keywords Estratégicas" count={pendingKeywords.length} color="text-blue-600" />
      </div>

      <Card className="border-none shadow-xl shadow-black/5">
        <CardHeader className="border-b border-black/5 bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-black/50">
            Feed de Operação (Prioridade Máxima)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-black">Tudo sob controle!</h3>
              <p className="text-sm text-black/40">Não há itens pendentes de aprovação no momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {items.map((item) => (
                <div key={`${item.type}-${item.id}`} className="group flex items-center justify-between p-6 transition-all hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <TypeIcon type={item.type} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                          {item.strategyName}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-black/10" />
                        <span className="text-[10px] font-bold text-black/40">
                          {new Intl.DateTimeFormat("pt-BR").format(new Date(item.date))}
                        </span>
                      </div>
                      <h4 className="mt-0.5 text-sm font-bold tracking-tight text-black group-hover:text-primary">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <Link 
                    href={getLink(item)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white text-black transition-all hover:bg-black hover:text-white"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <Card className="border-none shadow-md shadow-black/5">
      <CardContent className="pt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">{title}</p>
        <p className={cn("mt-1 text-3xl font-black", color)}>{count}</p>
      </CardContent>
    </Card>
  );
}

function TypeIcon({ type }: { type: PendingItem["type"] }) {
  switch (type) {
    case "artigo":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
      );
    case "tema":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <MessageSquare className="h-5 w-5" />
        </div>
      );
    case "keyword":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Search className="h-5 w-5" />
        </div>
      );
  }
}

function getLink(item: PendingItem) {
  switch (item.type) {
    case "artigo": return "/app/artigos";
    case "tema": return `/app/estrategias/${item.strategyId}/temas`;
    case "keyword": return `/app/estrategias/${item.strategyId}/keywords`;
  }
}
