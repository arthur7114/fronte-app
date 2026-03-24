import { notFound } from "next/navigation";
import { BlogArticlePanel } from "@/components/blog-article-panel";
import { BlogFrame } from "@/components/blog-frame";
import {
  getPublishedPostBySlug,
  listPublishedPostsForSite,
} from "@/lib/post-data";
import { getSiteBySubdomain } from "@/lib/site-data";

type BlogArticlePageProps = {
  params: Promise<{
    subdomain: string;
    postSlug: string;
  }>;
};

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { subdomain, postSlug } = await params;
  const site = await getSiteBySubdomain(subdomain);

  if (!site) {
    notFound();
  }

  const post = await getPublishedPostBySlug(site.id, postSlug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await listPublishedPostsForSite(site.id)).filter(
    (item) => item.id !== post.id,
  );

  return (
    <BlogFrame
      subdomain={subdomain}
      title={post.title}
      description="A mesma identidade do blog aparece na pagina individual do post, com leitura limpa e foco no conteudo publicado."
      aside={
        <div className="w-full max-w-sm space-y-4 border border-black/12 bg-[rgba(255,255,255,0.84)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Post
          </p>
          <p className="mt-3 text-sm leading-7 text-black/65">
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("pt-BR")
              : "Sem data"}{" "}
            • {post.slug}
          </p>
        </div>
      }
    >
      <BlogArticlePanel site={site} post={post} relatedPosts={relatedPosts} />
    </BlogFrame>
  );
}
