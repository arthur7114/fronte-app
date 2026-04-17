import { redirect } from "next/navigation";

type LegacyStrategyOverviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyStrategyOverviewPage({
  params,
}: LegacyStrategyOverviewPageProps) {
  const { id } = await params;
  redirect(`/dashboard/estrategia/${id}`);
}
