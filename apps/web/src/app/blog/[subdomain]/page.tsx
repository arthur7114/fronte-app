import { notFound } from "next/navigation";
import { BlogFrame } from "@/components/blog-frame";
import { BlogIndexPanel } from "@/components/blog-index-panel";
import { listPublishedPostsForSite } from "@/lib/post-data";
import { getSiteBySubdomain } from "@/lib/site-data";

type BlogIndexPageProps = {
  params: Promise<{
    subdomain: string;
  }>;
};

export default async function BlogIndexPage({ params }: BlogIndexPageProps) {
  const { subdomain } = await params;
  const site = await getSiteBySubdomain(subdomain);

  if (!site) {
    notFound();
  }

  const posts = await listPublishedPostsForSite(site.id);

  return (
    <BlogFrame
      subdomain={subdomain}
      title={site.name}
      description="O blog publico aparece por caminho neste bloco. Ele valida leitura, navegacao e o recorte dos posts publicados sem depender de subdominio real."
      aside={
        <div className="w-full max-w-sm space-y-4 border border-black/12 bg-[rgba(255,255,255,0.84)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Publicacao
          </p>
          <p className="mt-3 text-sm leading-7 text-black/65">
            A rota publica mostra apenas conteudo com status publicado.
          </p>
        </div>
      }
    >
      <BlogIndexPanel site={site} posts={posts} />
    </BlogFrame>
  );
}
