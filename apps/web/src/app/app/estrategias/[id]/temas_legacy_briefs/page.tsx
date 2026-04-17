import { redirect } from "next/navigation";

type LegacyStrategyBriefsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyStrategyBriefsPage({
  params,
}: LegacyStrategyBriefsPageProps) {
  const { id } = await params;
  redirect(`/dashboard/plano?strategy=${id}&tab=topics`);
}
