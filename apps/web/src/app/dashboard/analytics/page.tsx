import { PageHeader } from "@/components/page-header";
import { getAuthContext } from "@/lib/auth-context";
import {
  listAutomationJobsForTenant,
  listContentBriefsForTenant,
  listTopicCandidatesForTenant,
} from "@/lib/automation-data";
import { listPostsForSite } from "@/lib/post-data";

export default async function AnalyticsPage() {
  const { tenant, site } = await getAuthContext();

  if (!tenant || !site) {
    return null;
  }

  const [posts, topics, briefs, jobs] = await Promise.all([
    listPostsForSite(tenant.id, site.id),
    listTopicCandidatesForTenant(tenant.id),
    listContentBriefsForTenant(tenant.id),
    listAutomationJobsForTenant(tenant.id),
  ]);

  const publishedPosts = posts.filter((post) => post.status === "published").length;
  const approvalRate =
    topics.length === 0
      ? 0
      : Math.round(
          (topics.filter((topic) => topic.status === "approved").length / topics.length) * 100,
        );
  const draftConversion =
    briefs.length === 0
      ? 0
      : Math.round((posts.length / Math.max(briefs.length, 1)) * 100);
  const healthyJobs = jobs.filter((job) => job.status === "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Leitura operacional do conteudo."
        description="Enquanto integracoes externas ainda nao entraram, a pagina assume o que ja existe de verdade: pipeline editorial, saude dos jobs e volume de conteudo publicado."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Publicados
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{publishedPosts}</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Taxa de aprovacao
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{approvalRate}%</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Conversao em draft
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{draftConversion}%</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Jobs concluidos
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{healthyJobs}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="dashboard-surface rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            O que ja conseguimos medir
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-white/86 p-4">
              <p className="text-sm font-semibold text-foreground">Pipeline editorial</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Topics aprovados, briefings gerados e artigos efetivamente criados.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white/86 p-4">
              <p className="text-sm font-semibold text-foreground">Saude do worker</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Ritmo de execucao, falhas e lotes concluidos pelo motor.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white/86 p-4">
              <p className="text-sm font-semibold text-foreground">Maturidade do projeto</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Briefing definido, blog pronto e volume de conteudo publicado.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/35 p-4">
              <p className="text-sm font-semibold text-foreground">Proxima camada</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Search Console, GA4 e metricas de keyword entram numa fase posterior.
              </p>
            </div>
          </div>
        </article>

        <article className="dashboard-surface rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Sinais de alerta
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-border bg-white/86 p-4">
              <p className="text-sm font-semibold text-foreground">
                {publishedPosts === 0 ? "Nenhum artigo publicado" : "Base publica ativa"}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {publishedPosts === 0
                  ? "Sem artigos publicados, ainda nao existe distribuicao real para aprender com o resultado."
                  : "Ja existe material suficiente para acompanhar evolucao de volume e consistencia."}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white/86 p-4">
              <p className="text-sm font-semibold text-foreground">
                {approvalRate < 40 ? "Curadoria travando o fluxo" : "Curadoria saudavel"}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Temas aprovados: {topics.filter((topic) => topic.status === "approved").length} de{" "}
                {topics.length}.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white/86 p-4">
              <p className="text-sm font-semibold text-foreground">
                {jobs.some((job) => job.status === "failed") ? "Existem falhas recentes" : "Sem falhas recentes"}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {jobs.some((job) => job.status === "failed")
                  ? "Vale revisar a fila de jobs antes de aumentar o volume."
                  : "A automacao esta seguindo sem erro registrado no recorte atual."}
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
