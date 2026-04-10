import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getAuthContext } from "@/lib/auth-context";
import {
  listAutomationJobsForTenant,
  listContentBriefsForTenant,
  listTopicCandidatesForTenant,
} from "@/lib/automation-data";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";
import { listPostsForSite } from "@/lib/post-data";

export default async function OverviewPage() {
  const { tenant, site } = await getAuthContext();

  if (!tenant || !site) {
    return null;
  }

  const [posts, topics, briefs, jobs, businessBriefing] = await Promise.all([
    listPostsForSite(tenant.id, site.id),
    listTopicCandidatesForTenant(tenant.id),
    listContentBriefsForTenant(tenant.id),
    listAutomationJobsForTenant(tenant.id),
    getBusinessBriefingForTenant(tenant.id),
  ]);

  const publishedPosts = posts.filter((post) => post.status === "published").length;
  const scheduledPosts = posts.filter((post) => post.status === "scheduled").length;
  const draftPosts = posts.filter((post) => post.status === "draft").length;
  const pendingTopics = topics.filter((topic) => topic.status === "pending").length;
  const readyBriefs = briefs.filter((brief) => brief.status === "approved").length;
  const activeJobs = jobs.filter(
    (job) => job.status === "pending" || job.status === "running",
  ).length;

  const nextStep = !businessBriefing
    ? {
        href: "/app/briefing",
        label: "Fechar estrategia inicial",
        description: "Preencha o briefing do negocio para guiar temas, plano e artigos.",
      }
    : pendingTopics > 0
      ? {
          href: "/app/automation/topics",
          label: "Revisar temas pendentes",
          description: "Existem sinais aguardando curadoria antes de virarem briefing.",
        }
      : readyBriefs > 0
        ? {
            href: "/app/automation/briefs",
            label: "Gerar novos artigos",
            description: "Ja ha briefings aprovados que podem virar rascunho agora.",
          }
        : {
            href: "/app/posts/new",
            label: "Abrir novo artigo",
            description: "Comece um rascunho manual e mantenha o ritmo editorial.",
          };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Bom te ver por aqui, ${tenant.name}.`}
        description="Este painel virou o ponto de comando do projeto: estrategia, plano de conteudo, artigos e saude operacional no mesmo fluxo."
        badge={<span>{site.subdomain}</span>}
        actions={
          <>
            <Link
              href="/app/posts/new"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition duration-200 hover:-translate-y-0.5"
            >
              Novo artigo
            </Link>
            <Link
              href={nextStep.href}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/85 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5"
            >
              Proximo passo
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Artigos publicados
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{publishedPosts}</p>
          <p className="mt-2 text-sm text-muted-foreground">{draftPosts} rascunhos em andamento</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Temas em curadoria
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{pendingTopics}</p>
          <p className="mt-2 text-sm text-muted-foreground">Aprovacao humana antes do briefing</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Briefings prontos
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{readyBriefs}</p>
          <p className="mt-2 text-sm text-muted-foreground">Prontos para gerar drafts</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Operacao ativa
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{activeJobs}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {scheduledPosts} artigos com publicacao agendada
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="dashboard-surface rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Proxima melhor jogada
          </p>
          <div className="mt-5 rounded-lg border border-border bg-secondary/35 p-5">
            <p className="text-xl font-semibold text-foreground">{nextStep.label}</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              {nextStep.description}
            </p>
            <Link
              href={nextStep.href}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition duration-200 hover:-translate-y-0.5"
            >
              Abrir agora
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Link
              href="/app/site"
              className="rounded-lg border border-border bg-white/88 px-4 py-4 transition duration-200 hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold text-foreground">Meu blog</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ajuste identidade do site e confira a rota publica.
              </p>
            </Link>
            <Link
              href="/app/posts"
              className="rounded-lg border border-border bg-white/88 px-4 py-4 transition duration-200 hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold text-foreground">Artigos</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Edite rascunhos e acompanhe o ritmo editorial.
              </p>
            </Link>
            <Link
              href="/app/analytics"
              className="rounded-lg border border-border bg-white/88 px-4 py-4 transition duration-200 hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold text-foreground">Analytics</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Leia saude do pipeline e maturidade da operacao.
              </p>
            </Link>
          </div>
        </article>

        <article className="dashboard-surface rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Contexto do projeto
          </p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <span>Workspace</span>
              <span className="font-medium text-foreground">{tenant.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <span>Site</span>
              <span className="font-medium text-foreground">{site.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <span>Subdominio</span>
              <span className="font-medium text-foreground">{site.subdomain}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <span>Estrategia</span>
              <StatusBadge tone={businessBriefing ? "success" : "warning"}>
                {businessBriefing ? "Definida" : "Pendente"}
              </StatusBadge>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <span>Pipeline</span>
              <StatusBadge tone={activeJobs > 0 ? "info" : "neutral"}>
                {activeJobs > 0 ? "Em movimento" : "Aguardando"}
              </StatusBadge>
            </div>
            <div className="rounded-lg border border-border bg-secondary/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Rota publica
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">/blog/{site.subdomain}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Blog pronto para receber artigos publicados.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="dashboard-surface rounded-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Artigos recentes
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                O que foi atualizado por ultimo no editorial.
              </p>
            </div>
            <Link href="/app/posts" className="text-sm font-semibold text-primary">
              Ver tudo
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {posts.length === 0 ? (
              <div className="rounded-lg border border-border bg-white/80 px-4 py-5 text-sm leading-7 text-muted-foreground">
                Nenhum artigo criado ainda. O primeiro rascunho nasce em Artigos.
              </div>
            ) : (
              posts.slice(0, 4).map((post) => (
                <Link
                  key={post.id}
                  href={`/app/posts/${post.id}`}
                  className="block rounded-lg border border-border bg-white/86 px-4 py-4 transition duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{post.title}</p>
                    <StatusBadge tone={post.status === "published" ? "success" : "neutral"}>
                      {post.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Atualizado em {new Date(post.updated_at).toLocaleDateString("pt-BR")}
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="dashboard-surface rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Movimento da automacao
          </p>
          <div className="mt-5 space-y-3">
            {jobs.length === 0 ? (
              <div className="rounded-lg border border-border bg-white/80 px-4 py-5 text-sm leading-7 text-muted-foreground">
                Ainda nao houve execucoes no worker deste projeto.
              </div>
            ) : (
              jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="rounded-lg border border-border bg-white/86 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{job.type}</p>
                    <StatusBadge
                      tone={
                        job.status === "completed"
                          ? "success"
                          : job.status === "failed"
                            ? "danger"
                            : "info"
                      }
                    >
                      {job.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Atualizado em {new Date(job.updated_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))
            )}
            <Link href="/app/jobs" className="inline-flex text-sm font-semibold text-primary">
              Abrir fila completa
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
