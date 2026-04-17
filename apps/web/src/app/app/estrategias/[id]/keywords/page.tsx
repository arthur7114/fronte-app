import { AutomationKeywordsPanel } from "@/components/automation-keywords-panel";
import { loadAutomationWorkspaceData } from "../../data";

export default async function StrategyKeywordsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAutomationWorkspaceData();
  
  const strategyKeywords = data.keywords.filter((k) => k.strategy_id === id);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <AutomationKeywordsPanel 
        keywords={strategyKeywords} 
        jobs={data.jobs}
        strategies={data.strategies}
      />
    </div>
  );
}

