import { PageHeader } from "@/components/page-header";
import { AutomationBriefsPanel } from "@/components/automation-briefs-panel";
import { loadAutomationWorkspaceData } from "../../data";

export default async function AutomationBriefsPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plano de conteudo"
        title="Briefings prontos para virar draft."
        description="Aqui o plano vira producao. Valide angulo e keywords antes de mandar para a geracao do artigo."
      />
      <AutomationBriefsPanel briefs={data.briefs} />
    </div>
  );
}
