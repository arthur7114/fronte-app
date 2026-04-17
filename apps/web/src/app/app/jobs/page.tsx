import { PageHeader } from "@/components/page-header";
import { AutomationJobsPanel } from "@/components/automation-jobs-panel";
import { loadAutomationWorkspaceData } from "@/app/app/estrategias/data";

export default async function JobsPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automacao"
        title="Jobs e fila de processamento."
        description="Este dashboard exibe o que o worker esta rodando para o tenant, incluindo temas, briefings, rascunhos e publicacao agendada."
      />
      <AutomationJobsPanel jobs={data.jobs} />
    </div>
  );
}

