import { redirect } from "next/navigation";

type LegacyStrategyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyStrategyPage({ params }: LegacyStrategyPageProps) {
  const { id } = await params;
  redirect(`/dashboard/estrategia/${id}`);
}
