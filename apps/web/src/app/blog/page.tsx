import type { CSSProperties } from "react"
import Link from "next/link"
import { ArticleCard } from "@/components/blog/public/article-card"
import { PublicBlogFooter } from "@/components/blog/public/blog-footer"
import { PublicBlogHeader } from "@/components/blog/public/blog-header"
import { DEMO_BLOG_SITE, getAllPublicPostsWithBasePath } from "@/lib/blog-public-server"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Blog | Demo",
  description: "Artigos publicados no blog demo da plataforma.",
}

export default async function BlogHomePage() {
  const posts = await getAllPublicPostsWithBasePath()
  const [featured, ...rest] = posts

  return (
    <div style={{ "--primary": DEMO_BLOG_SITE.primary_color } as CSSProperties}>
      <PublicBlogHeader siteName={DEMO_BLOG_SITE.name} basePath="/blog" />
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2 text-xs text-muted-foreground">
          <Link
            href="/app/blog"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar ao painel
          </Link>
          <span>
            Visualizacao publica demo
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Blog</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground text-balance md:text-5xl">
            Artigos publicados pela sua operacao editorial
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-pretty">
            Este e o fallback publico. O blog real do cliente usa /blog/subdominio.
          </p>
        </section>

        {featured && (
          <section className="mt-14">
            <ArticleCard post={featured} variant="featured" basePath={featured.basePath} />
          </section>
        )}

        {rest.length > 0 && (
          <section className="mt-20">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Ultimos artigos
              </h2>
              <span className="text-sm text-muted-foreground">
                {posts.length} {posts.length === 1 ? "artigo" : "artigos"}
              </span>
            </div>
            <div className="mt-8 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <ArticleCard key={post.articleId} post={post} basePath={post.basePath} />
              ))}
            </div>
          </section>
        )}

        {posts.length === 0 && (
          <section className="mt-20 py-20 text-center">
            <h2 className="text-xl font-medium text-foreground">Nenhum artigo publicado ainda</h2>
            <p className="mt-2 text-muted-foreground">Publique artigos para preencher este blog.</p>
          </section>
        )}
      </div>
      <PublicBlogFooter siteName={DEMO_BLOG_SITE.name} basePath="/blog" />
    </div>
  )
}
