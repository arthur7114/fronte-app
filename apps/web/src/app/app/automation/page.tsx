import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { AutomationOverviewPanel } from "@/components/automation-overview-panel";
import { loadAutomationWorkspaceData } from "./data";

export default async function AutomationPage() {
  const data = await loadAutomationWorkspaceData();
  const pendingTopics = data.topics.filter((topic) => topic.status === "pending").length;
  const approvedBriefs = data.briefs.filter((brief) => brief.status === "approved").length;
  const activeJobs = data.jobs.filter(
    (job) => job.status === "pending" || job.status === "running",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plano de conteudo"
        title="Transforme estrategia em fila de publicacao."
        description="Este espaco junta curadoria de temas, briefings prontos e configuracao do motor. A operacao continua transparente, sem esconder os bastidores."
        actions={
          <>
            <Link
              href="/app/automation/strategy"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/85 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5"
            >
              Estratégia
            </Link>
            <Link
              href="/app/automation/topics"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/85 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5"
            >
              Temas
            </Link>
            <Link
              href="/app/automation/briefs"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition duration-200 hover:-translate-y-0.5"
            >
              Briefings
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Keywords
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{data.keywords.length}</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Temas aguardando
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{pendingTopics}</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Briefings aprovados
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{approvedBriefs}</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Jobs ativos
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{activeJobs}</p>
        </article>
      </section>

      <AutomationOverviewPanel
        tenantName={data.tenant.name}
        site={data.site}
        automationConfig={data.automationConfig}
        aiPreferences={data.aiPreferences}
        topics={data.topics}
        briefs={data.briefs}
        jobs={data.jobs}
      />
    </div>
  );
}
