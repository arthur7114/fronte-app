import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArticleCard } from "@/components/blog/public/article-card"
import { NewsletterCTA } from "@/components/blog/public/newsletter-cta"
import { PublicBlogFooter } from "@/components/blog/public/blog-footer"
import { PublicBlogHeader } from "@/components/blog/public/blog-header"
import {
  getAllPublicPosts,
  getPublicPostBySlug,
  getPublicSiteBySubdomain,
} from "@/lib/blog-public-server"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

type Params = Promise<{ subdomain: string; postSlug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { subdomain, postSlug } = await params
  const site = await getPublicSiteBySubdomain(subdomain)
  if (!site) return {}

  const post = await getPublicPostBySlug(postSlug, site.id)
  if (!post) return {}

  return {
    title: `${post.title} | ${site.name}`,
    description: post.excerpt,
  }
}

export default async function TenantBlogPostPage({ params }: { params: Params }) {
  const { subdomain, postSlug } = await params
  const site = await getPublicSiteBySubdomain(subdomain)
  if (!site) notFound()

  const post = await getPublicPostBySlug(postSlug, site.id)
  if (!post) notFound()

  const basePath = `/blog/${site.subdomain}`
  const allPosts = await getAllPublicPosts(site.id)
  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 3)

  return (
    <div
      className={site.font_family === "serif" ? "font-serif" : site.font_family === "mono" ? "font-mono" : undefined}
      style={{ "--primary": site.primary_color } as CSSProperties}
    >
      <PublicBlogHeader siteName={site.name} logoUrl={site.logo_url} basePath={basePath} />
      <article>
        <div className="border-b border-border/60 bg-muted/30">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-3 text-xs text-muted-foreground">
            <Link
              href={basePath}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Todos os artigos
            </Link>
          </div>
        </div>

        <header className="mx-auto max-w-3xl px-6 pt-12 md:pt-16">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {post.publishedAt}
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground text-balance md:text-5xl">
            {post.title}
          </h1>

          <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-pretty">
            {post.excerpt}
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-4xl px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-muted">
            <Image
              src={post.cover || "/placeholder.svg"}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl px-6 pb-20">
          <div className="space-y-6">
            {post.body.map((block, index) => {
              if (block.type === "p") {
                return <p key={index} className="text-lg leading-relaxed text-foreground/90">{block.text}</p>
              }
              if (block.type === "h2") {
                return <h2 key={index} className="mt-6 pt-4 text-2xl font-semibold tracking-tight text-foreground text-balance">{block.text}</h2>
              }
              if (block.type === "h3") {
                return <h3 key={index} className="mt-4 text-lg font-semibold tracking-tight text-foreground">{block.text}</h3>
              }
              if (block.type === "quote") {
                return (
                  <blockquote key={index} className="my-8 border-l-4 border-primary py-2 pl-6">
                    <p className="text-xl font-medium tracking-tight text-foreground leading-relaxed text-balance">
                      &ldquo;{block.text}&rdquo;
                    </p>
                    {block.cite && <cite className="mt-2 block text-sm text-muted-foreground not-italic">{block.cite}</cite>}
                  </blockquote>
                )
              }
              if (block.type === "ul") {
                return (
                  <ul key={index} className="space-y-2 pl-1">
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3 text-lg leading-relaxed text-foreground/90">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
              if (block.type === "cta") {
                return <NewsletterCTA key={index} origin="inline" sourceArticle={post.title} />
              }
              return null
            })}
          </div>
        </div>

        {related.length > 0 && (
          <section className="border-t border-border bg-muted/20 py-16">
            <div className="mx-auto max-w-5xl px-6">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Continue lendo
              </h2>
              <div className="mt-8 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ArticleCard key={item.slug} post={item} basePath={basePath} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
      <PublicBlogFooter siteName={site.name} logoUrl={site.logo_url} basePath={basePath} />
    </div>
  )
}
