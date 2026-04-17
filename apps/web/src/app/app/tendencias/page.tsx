import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getAuthContext } from "@/lib/auth-context";
import { listTopicCandidatesForTenant } from "@/lib/automation-data";

export default async function TrendsPage() {
  const { tenant } = await getAuthContext();

  if (!tenant) {
    return null;
  }

  const topics = await listTopicCandidatesForTenant(tenant.id);
  const rankedTopics = [...topics].sort((left, right) => (right.score ?? 0) - (left.score ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tendencias"
        title="Radar dos sinais que chegaram ao projeto."
        description="Enquanto fontes externas ainda nao entram no produto, usamos os topic candidates como radar honesto do que o motor encontrou e do que merece sua atencao."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Sinais coletados
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{topics.length}</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Em curadoria
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">
            {topics.filter((topic) => topic.status === "pending").length}
          </p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Score medio
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">
            {topics.length === 0
              ? "0"
              : Math.round(
                  topics.reduce((total, topic) => total + (topic.score ?? 0), 0) / topics.length,
                )}
          </p>
        </article>
      </section>

      <section className="dashboard-surface rounded-lg p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Sinais mais fortes
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Ordenados por score e prontos para virar conversa de negocio.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {rankedTopics.length === 0 ? (
            <div className="rounded-lg border border-border bg-white/86 px-4 py-5 text-sm leading-7 text-muted-foreground">
              Nenhum topic candidate disponivel ainda. A primeira pesquisa de temas alimenta esta tela.
            </div>
          ) : (
            rankedTopics.slice(0, 8).map((topic) => (
              <article
                key={topic.id}
                className="rounded-lg border border-border bg-white/86 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{topic.topic}</p>
                  <StatusBadge
                    tone={
                      topic.status === "approved"
                        ? "success"
                        : topic.status === "rejected"
                          ? "danger"
                          : "info"
                    }
                  >
                    {topic.status}
                  </StatusBadge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Score: {topic.score ?? "-"}</span>
                  <span>Fonte: {topic.source ?? "nao informada"}</span>
                  <span>
                    Coletado em {new Date(topic.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
