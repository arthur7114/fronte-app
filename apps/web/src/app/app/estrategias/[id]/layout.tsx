import { notFound } from "next/navigation";
import { requireAutomationWorkspace } from "../data";
import { getStrategyForTenant } from "@/lib/automation-data";
import { StrategyHeader } from "@/components/strategy-header";

export default async function StrategyDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspace = await requireAutomationWorkspace();
  const strategy = await getStrategyForTenant(workspace.tenant.id, id);

  if (!strategy) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StrategyHeader name={strategy.name} strategyId={id} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
