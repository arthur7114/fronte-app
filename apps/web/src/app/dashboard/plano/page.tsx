import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { AutomationKeywordsPanel } from "@/components/automation-keywords-panel";
import { AutomationTopicsPanel } from "@/components/automation-topics-panel";
import { Badge } from "@/components/ui/badge";
import { loadAutomationWorkspaceData } from "@/app/app/estrategias/data";

type PlanPageProps = {
  searchParams: Promise<{
    strategy?: string;
    tab?: string;
  }>;
};

type PlanTab = "keywords" | "topics" | "calendar";

const TABS: PlanTab[] = ["keywords", "topics", "calendar"];

function getHref(tab: PlanTab, strategyId?: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);

  if (strategyId) {
    params.set("strategy", strategyId);
  }

  return `/dashboard/plano?${params.toString()}`;
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const params = await searchParams;
  const activeTab = TABS.includes((params.tab as PlanTab) || "keywords")
    ? ((params.tab as PlanTab) || "keywords")
    : "keywords";
  const activeStrategyId = params.strategy ?? null;
  const data = await loadAutomationWorkspaceData();
  const activeStrategy = activeStrategyId
    ? data.strategies.find((strategy) => strategy.id === activeStrategyId) ?? null
    : null;

  const keywords = activeStrategyId
    ? data.keywords.filter((keyword) => keyword.strategy_id === activeStrategyId)
    : data.keywords;
  const topics = activeStrategyId
    ? data.topics.filter((topic) => topic.strategy_id === activeStrategyId)
    : data.topics;
  const briefs = activeStrategyId
    ? data.briefs.filter((brief) => brief.strategy_id === activeStrategyId)
    : data.briefs;

  const calendarEntries = [
    ...topics
      .filter((topic) => topic.status === "approved" && topic.scheduled_date)
      .map((topic) => ({
        id: topic.id,
        date: topic.scheduled_date as string,
        title: topic.topic,
        kind: "Tema aprovado",
        tone: "bg-amber-100 text-amber-700",
      })),
    ...data.posts
      .filter((post) => post.published_at)
      .map((post) => ({
        id: post.id,
        date: post.published_at as string,
        title: post.title,
        kind: post.status === "published" ? "Publicado" : "Agendado",
        tone:
          post.status === "published"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-blue-100 text-blue-700",
      })),
  ].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plano de Conteudo"
        title="Keywords, temas e calendario no mesmo contexto."
        description="O plano virou uma pagina unica, com filtro opcional por estrategia e sem espalhar a operacao em varias rotas antigas."
        badge={activeStrategy ? <span>{activeStrategy.name}</span> : <span>Todas as estrategias</span>}
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={getHref(tab, activeStrategyId ?? undefined)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "keywords" ? "Keywords" : tab === "topics" ? "Temas" : "Calendario"}
          </Link>
        ))}
      </div>

      {activeTab === "keywords" ? (
        <AutomationKeywordsPanel
          keywords={keywords}
          jobs={data.jobs}
          strategies={data.strategies}
        />
      ) : null}

      {activeTab === "topics" ? (
        <AutomationTopicsPanel topics={topics} strategies={data.strategies} briefs={briefs} />
      ) : null}

      {activeTab === "calendar" ? (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="dashboard-surface rounded-lg p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Visao geral
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Keywords</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{keywords.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Temas aprovados</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {topics.filter((topic) => topic.status === "approved").length}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Artigos</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{data.posts.length}</p>
              </div>
            </div>
          </article>

          <article className="dashboard-surface rounded-lg p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Cronograma editorial
            </p>
            <div className="mt-5 space-y-3">
              {calendarEntries.length > 0 ? (
                calendarEntries.map((entry) => (
                  <div
                    key={`${entry.kind}-${entry.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white/80 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(entry.date))}
                      </p>
                    </div>
                    <Badge className={entry.tone}>{entry.kind}</Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-white/80 px-4 py-5 text-sm leading-7 text-muted-foreground">
                  Ainda nao ha datas suficientes para montar o calendario real. Assim que temas
                  aprovados ou posts agendados entrarem na base, eles aparecem aqui.
                </div>
              )}
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
