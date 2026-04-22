import { redirect } from "next/navigation";

type LegacyStrategyTopicsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyStrategyTopicsPage({
  params,
}: LegacyStrategyTopicsPageProps) {
  const { id } = await params;
  redirect(`/app/plano?strategy=${id}&tab=topics`);
}
