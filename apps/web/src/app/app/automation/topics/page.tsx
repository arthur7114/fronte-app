import { PageHeader } from "@/components/page-header";
import { AutomationTopicsPanel } from "@/components/automation-topics-panel";
import { loadAutomationWorkspaceData } from "../data";

export default async function AutomationTopicsPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automacao"
        title="Curadoria dos temas sugeridos."
        description="Aqui o time revisa os temas recebidos do worker, ajusta o texto quando preciso e decide o que segue para briefing."
      />
      <AutomationTopicsPanel topics={data.topics} />
    </div>
  );
}
