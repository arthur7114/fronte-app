import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getAuthContext } from "@/lib/auth-context";
import { listAutomationJobsForTenant, listContentBriefsForTenant, listTopicCandidatesForTenant } from "@/lib/automation-data";
import { listPostsForSite } from "@/lib/post-data";

export default async function OverviewPage() {
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
  const pendingTopics = topics.filter((topic) => topic.status === "pending").length;
  const readyBriefs = briefs.filter((brief) => brief.status === "approved").length;
  const activeJobs = jobs.filter((job) => job.status === "pending" || job.status === "running").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Visao geral"
        title="O centro de operacao do seu workspace."
        description="Daqui voce acompanha o estado do site, do conteudo e da automacao sem quebrar o fluxo entre areas."
        badge={<span>{site.subdomain}</span>}
        actions={
          <>
            <Link
              href="/app/posts/new"
              className="inline-flex h-11 items-center justify-center border border-[#f97316] bg-[#f97316] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition duration-200 hover:-translate-y-0.5"
            >
              Novo post
            </Link>
            <Link
              href="/app/automation"
              className="inline-flex h-11 items-center justify-center border border-black/10 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-black transition duration-200 hover:-translate-y-0.5"
            >
              Abrir automacao
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Posts publicados
          </p>
          <p className="mt-3 text-4xl font-semibold text-black">{publishedPosts}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Temas pendentes
          </p>
          <p className="mt-3 text-4xl font-semibold text-black">{pendingTopics}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Briefings prontos
          </p>
          <p className="mt-3 text-4xl font-semibold text-black">{readyBriefs}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
            Jobs ativos
          </p>
          <p className="mt-3 text-4xl font-semibold text-black">{activeJobs}</p>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Atalhos operacionais
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Link
              href="/app/posts"
              className="rounded-2xl border border-black/10 bg-[#f8fafc] px-4 py-4 transition duration-200 hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold text-black">Abrir posts</p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Criar, revisar e publicar conteudo.
              </p>
            </Link>
            <Link
              href="/app/automation/topics"
              className="rounded-2xl border border-black/10 bg-[#f8fafc] px-4 py-4 transition duration-200 hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold text-black">Revisar temas</p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Curadoria dos temas gerados pelo worker.
              </p>
            </Link>
            <Link
              href="/app/settings/site"
              className="rounded-2xl border border-black/10 bg-[#f8fafc] px-4 py-4 transition duration-200 hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold text-black">Editar site</p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Ajuste nome, idioma e subdominio.
              </p>
            </Link>
            <Link
              href="/app/jobs"
              className="rounded-2xl border border-black/10 bg-[#f8fafc] px-4 py-4 transition duration-200 hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold text-black">Ver jobs</p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Acompanhe a fila e os resultados.
              </p>
            </Link>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Contexto atual
          </p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-black/65">
            <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-4">
              <span>Workspace</span>
              <span className="font-medium text-black">{tenant.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-4">
              <span>Site</span>
              <span className="font-medium text-black">{site.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-4">
              <span>Subdominio</span>
              <span className="font-medium text-black">{site.subdomain}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Blog publico</span>
              <StatusBadge tone="info">/blog/{site.subdomain}</StatusBadge>
            </div>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
