import { PageHeader } from "@/components/page-header";
import { AutomationTopicsPanel } from "@/components/automation-topics-panel";
import { loadAutomationWorkspaceData } from "../data";

export default async function AutomationTopicsPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tópicos Sugeridos"
        title="Curadoria dos temas gerados pela IA."
        description="Revise, edite e aprove os tópicos para criar briefings de conteúdo. Cada aprovação dispara um job de geração automática."
      />
      <AutomationTopicsPanel topics={data.topics} />
    </div>
  );
}
