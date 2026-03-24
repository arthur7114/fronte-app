import { PageHeader } from "@/components/page-header";
import { AutomationOverviewPanel } from "@/components/automation-overview-panel";
import { loadAutomationWorkspaceData } from "./data";

export default async function AutomationPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automacao"
        title="Operacao de IA e linha editorial."
        description="A configuracao do pipeline, a leitura do runtime e o gatilho manual do worker ficam concentrados nesta area."
      />
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
