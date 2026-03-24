import { PageHeader } from "@/components/page-header";
import { AutomationBriefsPanel } from "@/components/automation-briefs-panel";
import { loadAutomationWorkspaceData } from "../data";

export default async function AutomationBriefsPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automacao"
        title="Briefings prontos para virar draft."
        description="O painel mostra os briefings aprovados, com angulo e palavras-chave, antes da geracao do post no CMS."
      />
      <AutomationBriefsPanel briefs={data.briefs} />
    </div>
  );
}
