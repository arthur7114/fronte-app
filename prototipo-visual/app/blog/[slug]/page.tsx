import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAllPosts, getPostBySlug } from "@/lib/blog-content"
import { ArticleCard } from "@/components/blog/public/article-card"
import { NewsletterCTA } from "@/components/blog/public/newsletter-cta"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} | Clínica Dental`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)

  return (
    <article>
      {/* Breadcrumb */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-3 text-xs text-muted-foreground">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Todos os artigos
          </Link>
        </div>
      </div>

      {/* Header */}
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

        <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {post.author.initials}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">{post.author.role}</p>
          </div>
        </div>
      </header>

      {/* Cover */}
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

      {/* Body */}
      <div className="mx-auto mt-16 max-w-3xl px-6 pb-20">
        <div className="space-y-6">
          {post.body.map((block, i) => {
            if (block.type === "p") {
              return (
                <p
                  key={i}
                  className="text-lg leading-relaxed text-foreground/90"
                >
                  {block.text}
                </p>
              )
            }
            if (block.type === "h2") {
              return (
                <h2
                  key={i}
                  className="mt-6 pt-4 text-2xl font-semibold tracking-tight text-foreground text-balance"
                >
                  {block.text}
                </h2>
              )
            }
            if (block.type === "h3") {
              return (
                <h3
                  key={i}
                  className="mt-4 text-lg font-semibold tracking-tight text-foreground"
                >
                  {block.text}
                </h3>
              )
            }
            if (block.type === "quote") {
              return (
                <blockquote
                  key={i}
                  className="border-l-4 border-primary pl-6 py-2 my-8"
                >
                  <p className="text-xl font-medium tracking-tight text-foreground leading-relaxed text-balance">
                    &ldquo;{block.text}&rdquo;
                  </p>
                  {block.cite && (
                    <cite className="mt-2 block text-sm text-muted-foreground not-italic">
                      — {block.cite}
                    </cite>
                  )}
                </blockquote>
              )
            }
            if (block.type === "ul") {
              return (
                <ul key={i} className="space-y-2 pl-1">
                  {block.items.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-lg leading-relaxed text-foreground/90"
                    >
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )
            }
            if (block.type === "cta") {
              return (
                <NewsletterCTA
                  key={i}
                  origin="inline"
                  sourceArticle={post.title}
                />
              )
            }
            return null
          })}
        </div>

        {/* Tags */}
        <div className="mt-16 flex flex-wrap gap-2 border-t border-border pt-8">
          {post.keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
            >
              #{kw}
            </span>
          ))}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-muted/20 py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Continue lendo
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
