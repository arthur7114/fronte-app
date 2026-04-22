import { redirect } from "next/navigation";

type LegacyStrategyKeywordsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyStrategyKeywordsPage({
  params,
}: LegacyStrategyKeywordsPageProps) {
  const { id } = await params;
  redirect(`/app/plano?strategy=${id}&tab=keywords`);
}
