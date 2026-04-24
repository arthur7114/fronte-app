import type { CSSProperties } from "react"
import { notFound, redirect } from "next/navigation"
import { ArticleCard } from "@/components/blog/public/article-card"
import { PublicBlogFooter } from "@/components/blog/public/blog-footer"
import { PublicBlogHeader } from "@/components/blog/public/blog-header"
import {
  getAllPublicPosts,
  getPublicPostWithSiteBySlug,
  getPublicSiteBySubdomain,
} from "@/lib/blog-public-server"

type Params = Promise<{ subdomain: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { subdomain } = await params
  const site = await getPublicSiteBySubdomain(subdomain)
  if (!site) {
    const postWithSite = await getPublicPostWithSiteBySlug(subdomain)
    if (!postWithSite) return {}

    return {
      title: `${postWithSite.post.title} | ${postWithSite.site.name}`,
      description: postWithSite.post.excerpt,
    }
  }

  return {
    title: `Blog | ${site.name}`,
    description: `Artigos publicados por ${site.name}.`,
  }
}

export default async function TenantBlogPage({ params }: { params: Params }) {
  const { subdomain } = await params
  const site = await getPublicSiteBySubdomain(subdomain)
  if (!site) {
    const postWithSite = await getPublicPostWithSiteBySlug(subdomain)
    if (!postWithSite) notFound()

    redirect(`/blog/${postWithSite.site.subdomain}/${postWithSite.post.slug}`)
  }

  const posts = await getAllPublicPosts(site.id)
  const [featured, ...rest] = posts
  const basePath = `/blog/${site.subdomain}`

  return (
    <div
      className={site.font_family === "serif" ? "font-serif" : site.font_family === "mono" ? "font-mono" : undefined}
      style={{ "--primary": site.primary_color } as CSSProperties}
    >
      <PublicBlogHeader siteName={site.name} logoUrl={site.logo_url} basePath={basePath} />
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Blog</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground text-balance md:text-5xl">
            Conteudos de {site.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-pretty">
            Artigos, guias e respostas para ajudar seus visitantes a tomar melhores decisoes.
          </p>
        </section>

        {featured && (
          <section className="mt-14">
            <ArticleCard post={featured} variant="featured" basePath={basePath} />
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
                <ArticleCard key={post.slug} post={post} basePath={basePath} />
              ))}
            </div>
          </section>
        )}

        {posts.length === 0 && (
          <section className="mt-20 py-20 text-center">
            <h2 className="text-xl font-medium text-foreground">Nenhum artigo publicado ainda</h2>
            <p className="mt-2 text-muted-foreground">Volte em breve para novidades.</p>
          </section>
        )}
      </div>
      <PublicBlogFooter siteName={site.name} logoUrl={site.logo_url} basePath={basePath} />
    </div>
  )
}
