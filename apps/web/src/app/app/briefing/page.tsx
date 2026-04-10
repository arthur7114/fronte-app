import { PageHeader } from "@/components/page-header";
import { BusinessBriefingPanel } from "@/components/business-briefing-panel";
import { getAuthContext } from "@/lib/auth-context";
import {
  listContentBriefsForTenant,
  listTopicCandidatesForTenant,
} from "@/lib/automation-data";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

export default async function BusinessBriefingPage() {
  const { tenant, site } = await getAuthContext();

  if (!tenant || !site) {
    return null;
  }

  const [briefing, topics, briefs] = await Promise.all([
    getBusinessBriefingForTenant(tenant.id),
    listTopicCandidatesForTenant(tenant.id),
    listContentBriefsForTenant(tenant.id),
  ]);
  const desiredKeywordsCount = briefing?.desired_keywords?.length ?? 0;
  const pendingTopics = topics.filter((topic) => topic.status === "pending").length;
  const approvedBriefs = briefs.filter((brief) => brief.status === "approved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Estrategia"
        title="Defina o raciocinio por tras do conteudo."
        description="O briefing do negocio virou a base da estrategia. Quanto melhor o contexto aqui, menos atrito depois em temas, briefings e artigos."
        badge={<span>{briefing ? "Ativo" : "Novo"}</span>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Status da estrategia
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {briefing ? "Definida" : "Pendente"}
          </p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Keywords desejadas
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{desiredKeywordsCount}</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Sinais em espera
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {pendingTopics} temas / {approvedBriefs} briefings
          </p>
        </article>
      </section>

      <BusinessBriefingPanel
        briefing={briefing}
        tenantName={tenant.name}
        siteName={site.name}
      />
    </div>
  );
}
