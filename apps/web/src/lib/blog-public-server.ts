import "server-only"
import type { Tables } from "@super/db"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import type { BlogPost } from "@/lib/blog-content"

const DEFAULT_AUTHOR = {
  name: "Equipe editorial",
  role: "Conteudo revisado pela equipe",
  initials: "ED",
}

export const DEMO_BLOG_SITE = {
  name: "Clinica Dental",
  subdomain: "clinicadental",
  logo_url: null,
  primary_color: "#14b8a6",
  font_family: "inter",
  theme_id: "minimal",
} as const

type PostRow = Tables<"posts">
type BlogDb = NonNullable<ReturnType<typeof getOptionalAdminSupabaseClient>>
type PostWithSite = PostRow & {
  sites?: { subdomain: string } | { subdomain: string }[] | null
}

function mapPostToBlogPost(post: PostRow): BlogPost {
  const rawContent = post.content || ""
  const cleanExcerpt = rawContent.replace(/\s+/g, " ").substring(0, 150) + (rawContent.length > 150 ? "..." : "")
  const wordCount = rawContent.split(/\s+/).filter(Boolean).length
  const readTimeMins = Math.max(1, Math.ceil(wordCount / 200))

  let formattedDate = "Recente"
  if (post.published_at || post.created_at) {
    const date = new Date(post.published_at || post.created_at)
    formattedDate = date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const bodyBlocks = rawContent
    .split(/\n{1,2}/)
    .filter((paragraph) => paragraph.trim().length > 0)
    .map((paragraph) => ({
      type: "p" as const,
      text: paragraph.trim(),
    }))

  return {
    slug: post.slug,
    articleId: post.id,
    title: post.title,
    excerpt: cleanExcerpt || "Artigo publicado no blog.",
    category: "Artigo",
    cover: "/blog/dentes-brancos.jpg",
    publishedAt: formattedDate,
    readTime: `${readTimeMins} min de leitura`,
    author: DEFAULT_AUTHOR,
    keywords: [],
    body: bodyBlocks.length > 0 ? bodyBlocks : [{ type: "p", text: "Nenhum conteudo publicado." }],
  }
}

async function getDb(): Promise<BlogDb> {
  return (getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient())) as BlogDb
}

export async function getPublicSiteBySubdomain(subdomain: string): Promise<Tables<"sites"> | null> {
  const db = await getDb()
  const { data, error } = await db
    .from("sites")
    .select("*")
    .eq("subdomain", subdomain)
    .maybeSingle()

  if (error) {
    console.error("[blog-public-server] Erro ao buscar site:", error)
    return null
  }

  return data
}

export async function getPublicSiteByHost(host: string): Promise<Tables<"sites"> | null> {
  const normalizedHost = host.split(":")[0]?.toLowerCase() ?? ""
  if (!normalizedHost) return null

  const db = await getDb()
  const { data, error } = await db
    .from("sites")
    .select("*")
    .eq("custom_domain", normalizedHost)
    .eq("custom_domain_status", "active")
    .maybeSingle()

  if (error) {
    console.error("[blog-public-server] Erro ao buscar site por host:", error)
    return null
  }

  return data
}

export async function getAllPublicPosts(siteId?: string): Promise<BlogPost[]> {
  const db = await getDb()
  let query = db
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })

  if (siteId) {
    query = query.eq("site_id", siteId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[blog-public-server] Erro ao buscar posts:", error)
    return []
  }

  return (data ?? []).map(mapPostToBlogPost)
}

export async function getAllPublicPostsWithBasePath(): Promise<Array<BlogPost & { basePath: string }>> {
  const db = await getDb()
  const { data, error } = await db
    .from("posts")
    .select("*, sites!inner(subdomain)")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })

  if (error) {
    console.error("[blog-public-server] Erro ao buscar posts com site:", error)
    return []
  }

  return ((data ?? []) as PostWithSite[]).map((row) => {
    const site = Array.isArray(row.sites) ? row.sites[0] : row.sites
    const post = mapPostToBlogPost(row)
    return {
      ...post,
      basePath: site?.subdomain ? `/blog/${site.subdomain}` : "/blog",
    }
  })
}

export async function getPublicPostBySlug(slug: string, siteId?: string): Promise<BlogPost | undefined> {
  const db = await getDb()
  let query = db
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)

  if (siteId) {
    query = query.eq("site_id", siteId)
  }

  const { data, error } = await query.maybeSingle()

  if (error || !data) {
    if (error) console.error(`[blog-public-server] Erro ao buscar post ${slug}:`, error)
    return undefined
  }

  return mapPostToBlogPost(data)
}
