"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Tables } from "@super/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  enqueueKeywordStrategy,
  enqueueTopicResearch,
  type KeywordStrategyState,
  type ResearchTopicsState,
} from "@/app/app/estrategias/actions";

type StrategyDetailPanelProps = {
  strategy: Tables<"strategies">;
  briefing: Tables<"business_briefings"> | null;
  keywordCount: number;
  approvedKeywordCount: number;
  topicCount: number;
  approvedTopicCount: number;
  postCount: number;
  pendingJobsCount: number;
};

const initialKeywordState: KeywordStrategyState = {};
const initialTopicState: ResearchTopicsState = {};

function StatusPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function StrategyDetailPanel({
  strategy,
  briefing,
  keywordCount,
  approvedKeywordCount,
  topicCount,
  approvedTopicCount,
  postCount,
  pendingJobsCount,
}: StrategyDetailPanelProps) {
  const [keywordState, keywordAction, keywordPending] = useActionState(
    enqueueKeywordStrategy,
    initialKeywordState,
  );
  const [topicState, topicAction, topicPending] = useActionState(
    enqueueTopicResearch,
    initialTopicState,
  );

  const desiredKeywords = briefing?.desired_keywords ?? [];
  const competitors = briefing?.competitors ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_22rem]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{strategy.operation_mode}</Badge>
            <Badge variant="outline">{strategy.status}</Badge>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground">
            {strategy.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {strategy.focus ||
              "Esta estrategia organiza uma frente editorial do produto. O detalhe abaixo resume contexto de negocio, sinais atuais e os proximos passos operacionais."}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <StatusPill label="Keywords" value={keywordCount} />
            <StatusPill label="Keywords aprovadas" value={approvedKeywordCount} />
            <StatusPill label="Temas" value={topicCount} />
            <StatusPill label="Temas aprovados" value={approvedTopicCount} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Conversa estrategica
          </p>
          <div className="mt-6 space-y-4">
            <article className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                IA
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm leading-7 text-foreground">
                Seu foco atual e <strong>{strategy.name}</strong>. A partir daqui o produto
                concentra pesquisa de keywords, descoberta de temas e producao editorial
                sem distorcer a hierarquia definida no prototipo visual.
              </div>
            </article>

            {briefing ? (
              <article className="flex gap-3 justify-end">
                <div className="max-w-2xl rounded-2xl bg-primary px-4 py-3 text-sm leading-7 text-primary-foreground">
                  Negocio: {briefing.business_name}. Segmento: {briefing.segment}. Oferta:
                  {" "}
                  {briefing.offerings}
                </div>
              </article>
            ) : null}

            <article className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                IA
              </div>
              <div className="w-full rounded-2xl bg-muted px-4 py-4 text-sm text-foreground">
                <p className="font-medium">O que essa estrategia precisa agora</p>
                <ul className="mt-3 space-y-2 leading-7 text-muted-foreground">
                  <li>Gerar ou curar keywords alinhadas ao contexto do negocio.</li>
                  <li>Transformar keywords aprovadas em temas priorizados.</li>
                  <li>Levar temas aprovados para o calendario e para a mesa editorial.</li>
                </ul>
              </div>
            </article>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <form action={keywordAction}>
              <input type="hidden" name="strategy_id" value={strategy.id} />
              <Button type="submit" disabled={keywordPending}>
                {keywordPending ? "Enfileirando..." : "Gerar keywords"}
              </Button>
            </form>

            <form action={topicAction}>
              <input type="hidden" name="strategy_id" value={strategy.id} />
              <Button type="submit" disabled={topicPending} variant="outline">
                {topicPending ? "Enfileirando..." : "Pesquisar temas"}
              </Button>
            </form>

            <Button asChild variant="outline">
              <Link href={`/app/plano?strategy=${strategy.id}&tab=keywords`}>Abrir plano</Link>
            </Button>
          </div>

          {keywordState.error ? (
            <p className="mt-3 text-sm text-destructive">{keywordState.error}</p>
          ) : null}
          {keywordState.success ? (
            <p className="mt-3 text-sm text-emerald-600">{keywordState.success}</p>
          ) : null}
          {topicState.error ? (
            <p className="mt-2 text-sm text-destructive">{topicState.error}</p>
          ) : null}
          {topicState.success ? (
            <p className="mt-2 text-sm text-emerald-600">{topicState.success}</p>
          ) : null}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Resumo do negocio
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-foreground">
            <p>
              <span className="text-muted-foreground">Segmento:</span>{" "}
              {briefing?.segment || "Nao informado"}
            </p>
            <p>
              <span className="text-muted-foreground">Localizacao:</span>{" "}
              {briefing?.location || "Nao informada"}
            </p>
            <p>
              <span className="text-muted-foreground">Fila ativa:</span> {pendingJobsCount} jobs
            </p>
            <p>
              <span className="text-muted-foreground">Artigos na base:</span> {postCount}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Keywords de partida
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {desiredKeywords.length > 0 ? (
              desiredKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma keyword inicial foi registrada.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Concorrentes citados
          </p>
          <div className="mt-4 space-y-2 text-sm text-foreground">
            {competitors.length > 0 ? (
              competitors.map((competitor) => (
                <div key={competitor} className="rounded-lg bg-muted px-3 py-2">
                  {competitor}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhum concorrente cadastrado ainda.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Proximos passos
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link href={`/app/plano?strategy=${strategy.id}&tab=topics`}>
                Ver temas desta estrategia
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/app/artigos?strategy=${strategy.id}`}>
                Abrir artigos
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/configuracoes/automation">
                Ajustar automacao
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
