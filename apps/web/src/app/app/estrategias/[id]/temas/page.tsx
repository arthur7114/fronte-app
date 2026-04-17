import { AutomationTopicsPanel } from "@/components/automation-topics-panel";
import { loadAutomationWorkspaceData } from "../../data";

export default async function AutomationTopicsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAutomationWorkspaceData();
  
  const strategyTopics = data.topics.filter((t) => t.strategy_id === id);
  const strategyBriefs = data.briefs.filter((b) => b.strategy_id === id);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <AutomationTopicsPanel 
        topics={strategyTopics} 
        strategies={data.strategies}
        briefs={strategyBriefs}
      />
    </div>
  );
}

