import Link from "next/link"
import { getAllPosts } from "@/lib/blog-content"
import { ArticleCard } from "@/components/blog/public/article-card"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Blog | Clínica Dental",
  description:
    "Artigos sobre saúde bucal, estética dental e tratamentos odontológicos escritos pela equipe da Clínica Dental.",
}

export default function BlogHomePage() {
  const posts = getAllPosts()
  const [featured, ...rest] = posts

  return (
    <div>
      {/* Top bar link to dashboard (visual only) */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2 text-xs text-muted-foreground">
          <Link
            href="/dashboard/blog"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar ao painel
          </Link>
          <span>
            Visualização pública · <span className="text-foreground">clinicadental.contentai.com.br/blog</span>
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        {/* Hero */}
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Blog</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground text-balance md:text-5xl">
            Cuide do seu sorriso com informação de qualidade
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-pretty">
            Artigos escritos pela nossa equipe de dentistas em Moema. Sem jargão, sem promessa
            milagrosa — só o que realmente funciona na prática clínica.
          </p>
        </section>

        {/* Featured */}
        {featured && (
          <section className="mt-14">
            <ArticleCard post={featured} variant="featured" />
          </section>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <section className="mt-20">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Últimos artigos
              </h2>
              <span className="text-sm text-muted-foreground">
                {posts.length} {posts.length === 1 ? "artigo" : "artigos"}
              </span>
            </div>
            <div className="mt-8 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
