import { notFound } from "next/navigation";
import { StrategyChatInterface } from "@/components/strategy/strategy-chat";
import { StrategySidebar } from "@/components/strategy/strategy-sidebar";
import { loadAutomationWorkspaceData } from "@/app/app/estrategias/data";

type StrategyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StrategyDetailPage({ params }: StrategyDetailPageProps) {
  const { id } = await params;
  const data = await loadAutomationWorkspaceData();
  const strategy = data.strategies.find((item) => item.id === id);

  if (!strategy) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Estrategia de Conteudo</h1>
          <p className="mt-1 text-muted-foreground">
            Conte-nos sobre seu negocio para criarmos uma estrategia personalizada.
          </p>
        </div>
        <StrategyChatInterface />
      </div>

      <div className="w-full shrink-0 xl:w-80">
        <StrategySidebar />
      </div>
    </div>
  );
}
