import { redirect } from "next/navigation";
import { requireAutomationWorkspace } from "../../data";
import { listPostsForTenant } from "@/lib/automation-data";

export default async function StrategyArticlesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspace = await requireAutomationWorkspace();
  
  // For now, we redirect to the global articles page
  // In the future, we can filter by strategy_id if the schema allows 
  // or by tracing post -> brief -> theme -> strategy
  redirect(`/app/artigos?strategy_id=${id}`);
}
