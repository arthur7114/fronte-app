import Image from "next/image"
import Link from "next/link"
import type { BlogPost } from "@/lib/blog-content"
import { ArrowUpRight } from "lucide-react"

type Props = {
  post: BlogPost
  variant?: "featured" | "default"
}

export function ArticleCard({ post, variant = "default" }: Props) {
  if (variant === "featured") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-8 rounded-3xl border border-border bg-card p-4 transition-colors hover:bg-muted/30 md:grid-cols-2 md:gap-10 md:p-6"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted md:aspect-auto">
          <Image
            src={post.cover || "/placeholder.svg"}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </div>
        <div className="flex flex-col justify-center gap-4 py-2 md:py-6">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
              {post.category}
            </span>
            <span className="text-muted-foreground">{post.readTime}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance md:text-3xl">
            {post.title}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed text-pretty">
            {post.excerpt}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {post.author.initials}
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">{post.author.name}</p>
                <p>{post.publishedAt}</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={post.cover || "/placeholder.svg"}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
            {post.category}
          </span>
          <span className="text-muted-foreground">{post.readTime}</span>
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground text-balance transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 text-pretty">
          {post.excerpt}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {post.publishedAt} · {post.author.name}
        </p>
      </div>
    </Link>
  )
}
