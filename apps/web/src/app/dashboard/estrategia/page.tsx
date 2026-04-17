import { PageHeader } from "@/components/page-header";
import { StrategySelector } from "@/components/strategy-selector";
import { loadAutomationWorkspaceData } from "@/app/app/estrategias/data";

export default async function StrategyPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Estrategia"
        title="Escolha a frente editorial que quer mover agora."
        description="Cada estrategia representa uma linha de conteudo com foco proprio. O modelo continua multi-estrategia, mas a navegacao e a hierarquia agora seguem a experiencia do prototipo."
      />

      <div className="px-2 sm:px-4">
        <StrategySelector strategies={data.strategies} />
      </div>
    </div>
  );
}
