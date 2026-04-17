import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { AutomationOverviewPanel } from "@/components/automation-overview-panel";
import { EditorialPipeline } from "@/components/editorial-pipeline";
import { loadAutomationWorkspaceData } from "../../data";

export default async function StrategyOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAutomationWorkspaceData();
  
  // Filter data specifically for this strategy
  const strategy = data.strategies.find((s) => s.id === id);
  const strategyKeywords = data.keywords.filter((k) => k.strategy_id === id);
  const strategyTopics = data.topics.filter((t) => t.strategy_id === id);
  const strategyBriefs = data.briefs.filter((b) => b.strategy_id === id);

  const approvedKeywordsCount = strategyKeywords.filter((k) => k.status === "approved").length;
  const approvedTopicsCount = strategyTopics.filter((topic) => topic.status === "approved").length;
  const approvedBriefsCount = strategyBriefs.filter((brief) => brief.status === "approved").length;
  const draftsCount = data.posts.length; // Post filtering by strategy might be needed later

  const steps = [
    {
      id: "keywords",
      name: "Keywords",
      description: "Palavras-chave e intenção de busca.",
      status: (approvedKeywordsCount > 0 ? "complete" : "current") as any,
      href: `/app/estrategias/${id}/keywords`,
    },
    {
      id: "temas",
      name: "Temas",
      description: "Pautas e estrutura detalhada.",
      status: (approvedTopicsCount > 0 ? "complete" : (approvedKeywordsCount > 0 ? "current" : "pending")) as any,
      href: `/app/estrategias/${id}/temas`,
    },
    {
      id: "production",
      name: "Produção",
      description: "Artigos gerados pela estratégia.",
      status: (approvedBriefsCount > 0 ? "complete" : (approvedTopicsCount > 0 ? "current" : "pending")) as any,
      href: `/app/estrategias/${id}/artigos`,
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <EditorialPipeline steps={steps} />

      <AutomationOverviewPanel
        tenantName={data.tenant.name}
        site={data.site}
        automationConfig={data.automationConfig}
        aiPreferences={data.aiPreferences}
        topics={strategyTopics}
        keywords={strategyKeywords}
        briefs={strategyBriefs}
        jobs={data.jobs} // Jobs are global but could be filtered too
        posts={data.posts}
        strategyId={id}
      />
    </div>
  );
}



