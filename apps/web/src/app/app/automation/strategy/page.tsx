import { PageHeader } from "@/components/page-header";
import { AutomationKeywordsPanel } from "@/components/automation-keywords-panel";
import { loadAutomationWorkspaceData } from "../data";

export default async function AutomationStrategyPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Estratégia de Busca"
        title="Seu mapa de autoridade no Google."
        description="Analise e aprove as palavras-chave que guiarão o motor de conteúdo. Esta estratégia é gerada com base no seu briefing de negócio."
      />
      
      <AutomationKeywordsPanel keywords={data.keywords} />
    </div>
  );
}
