import { PageHeader } from "@/components/page-header";
import { AutomationTopicsPanel } from "@/components/automation-topics-panel";
import { loadAutomationWorkspaceData } from "../data";

export default async function AutomationTopicsPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plano de conteudo"
        title="Curadoria dos temas sugeridos."
        description="Use este quadro para filtrar sinais, refinar a linguagem e decidir o que realmente merece virar briefing."
      />
      <AutomationTopicsPanel topics={data.topics} />
    </div>
  );
}
