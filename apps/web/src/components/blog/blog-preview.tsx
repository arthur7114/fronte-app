"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import type { CSSProperties } from "react"
import type { BlogPost } from "@/lib/blog-content"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react"

type DeviceType = "desktop" | "tablet" | "mobile"

type BlogPreviewProps = {
  siteName: string
  subdomain: string
  logoUrl?: string | null
  primaryColor: string
  fontFamily: string
  posts: BlogPost[]
}

export function BlogPreview({
  siteName,
  subdomain,
  logoUrl,
  primaryColor,
  fontFamily,
  posts,
}: BlogPreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop")
  const [featured, second, third] = posts

  const deviceWidths = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  }

  const blogHref = `/blog/${subdomain}`

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Visualizacao do Blog
            </h2>
            <p className="text-sm text-muted-foreground">
              Veja como seu blog aparece para os visitantes
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border border-border p-1">
              {([
                ["desktop", Monitor],
                ["tablet", Tablet],
                ["mobile", Smartphone],
              ] as const).map(([value, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDevice(value)}
                  className={cn(
                    "rounded-md p-2 transition-colors",
                    device === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <Link href={blogHref} target="_blank">
                <ExternalLink className="h-4 w-4" />
                Abrir blog
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-6">
          <div
            className={cn("overflow-hidden rounded-lg border border-border bg-white shadow-lg transition-all", deviceWidths[device])}
            style={{ "--blog-accent": primaryColor } as CSSProperties}
          >
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-xs text-muted-foreground">
                /blog/{subdomain}
              </div>
            </div>

            <div className={cn("p-6", fontFamily === "serif" && "font-serif", fontFamily === "mono" && "font-mono")}>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg" style={{ backgroundColor: primaryColor }}>
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={siteName} className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-sm font-bold text-white">{siteName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="font-semibold text-foreground">{siteName}</span>
                </div>
                <div className="hidden gap-4 text-sm text-muted-foreground sm:flex">
                  <span>Inicio</span>
                  <span>Servicos</span>
                  <span className="font-medium" style={{ color: primaryColor }}>Blog</span>
                  <span>Contato</span>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: primaryColor }}>
                  {featured?.category ?? "Blog"}
                </span>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {featured?.title ?? "Seu primeiro artigo publicado aparece aqui"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {featured?.excerpt ?? "Publique artigos para preencher automaticamente a vitrine do blog."}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {[second, third].map((post, index) => (
                  <div key={post?.slug ?? index} className="rounded-lg border border-border p-3">
                    <div className="relative h-20 overflow-hidden rounded-md bg-muted">
                      {post?.cover && (
                        <Image src={post.cover} alt={post.title} fill sizes="160px" className="object-cover" />
                      )}
                    </div>
                    <p className="mt-2 text-xs font-medium text-foreground">
                      {post?.title ?? (index === 0 ? "Novo artigo em rascunho" : "Proximo post do blog")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post?.readTime ?? "3 min de leitura"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
