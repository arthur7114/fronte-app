import { redirect } from "next/navigation";

type LegacyStrategyArticlesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyStrategyArticlesPage({
  params,
}: LegacyStrategyArticlesPageProps) {
  const { id } = await params;
  redirect(`/app/artigos?strategy=${id}`);
}
