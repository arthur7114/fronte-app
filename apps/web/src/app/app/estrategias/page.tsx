import { PageHeader } from "@/components/page-header";
import { StrategySelector } from "@/components/strategy-selector";
import { loadAutomationWorkspaceData } from "./data";

export default async function StrategiesPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Estratégias de Conteúdo"
        title="Selecione ou crie uma nova estratégia editorial."
        description="Cada estratégia representa uma linha de conteúdo focada em um objetivo específico: autoridade, conversão imediata ou educação de mercado."
      />

      <div className="px-8">
        <StrategySelector strategies={data.strategies} />
      </div>
    </div>
  );
}
