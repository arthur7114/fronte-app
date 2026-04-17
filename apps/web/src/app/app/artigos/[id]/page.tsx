import { redirect } from "next/navigation";

type LegacyArticleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyArticleDetailPage({
  params,
}: LegacyArticleDetailPageProps) {
  const { id } = await params;
  redirect(`/dashboard/artigos/${id}`);
}
