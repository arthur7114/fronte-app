import { redirect } from "next/navigation";

type LegacyArticleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyArticleDetailPage({
  params,
}: LegacyArticleDetailPageProps) {
  const { id } = await params;
  redirect(`/app/artigos?id=${id}`);
}
