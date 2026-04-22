import "server-only"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { getGeoTrafficFromGA4 } from "@/lib/ga4-server"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MonthlyDataPoint = {
  name: string
  value: number
}

export type TopPostMetric = {
  title: string
  slug: string
  views: number
  clicks: number
  ctr: string
}

export type SeoKpis = {
  totalViews: number
  totalClicks: number
  avgCtr: number
  avgPosition: number
  viewsChange: number
  clicksChange: number
}

export type ConversionKpis = {
  totalConversions: number
  conversionRate: number
  qualifiedLeads: number
  conversionsChange: number
}

export type ConversionEvent = {
  date: string
  type: string
  origin: string
  user: string
  status: string
}

export type GeoTrafficSource = {
  dimension: string
  sessions: number
}

export type AnalyticsData = {
  seo: {
    kpis: SeoKpis
    trafficOverTime: MonthlyDataPoint[]
    ctrOverTime: MonthlyDataPoint[]
    topPosts: TopPostMetric[]
    lowPerforming: TopPostMetric[]
  }
  conversions: {
    kpis: ConversionKpis
    conversionOverTime: MonthlyDataPoint[]
    conversionBySource: { name: string; value: number; color: string }[]
    recentEvents: ConversionEvent[]
  }
  geo: {
    trafficSources: GeoTrafficSource[]
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

function getMonthName(dateStr: string): string {
  const d = new Date(dateStr)
  return MONTH_NAMES[d.getMonth()] ?? dateStr
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// ─── Main fetcher ─────────────────────────────────────────────────────────────

export async function getAnalyticsData(tenantId: string): Promise<AnalyticsData> {
  const supabase = await getServerSupabaseClient()
  const db = supabase as any

  // Date boundaries: last 8 months
  const now = new Date()
  const eightMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 7, 1)
  const fourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const startDate = eightMonthsAgo.toISOString().split("T")[0]

  // ─── 1. SEO: Fetch analytics_daily ──────────────────────────────────────

  const { data: dailyRows } = await db
    .from("analytics_daily")
    .select("date, page_views, clicks, unique_visitors, source, post_id")
    .eq("tenant_id", tenantId)
    .gte("date", startDate)
    .order("date", { ascending: true })

  const analytics = (dailyRows ?? []) as Array<{
    date: string
    page_views: number
    clicks: number
    unique_visitors: number
    source: string
    post_id: string | null
  }>

  // Aggregate by month for traffic chart
  const monthlyTraffic = new Map<string, number>()
  const monthlyCtr = new Map<string, { views: number; clicks: number }>()

  for (const row of analytics) {
    const monthKey = row.date.substring(0, 7) // "2026-01"
    const monthName = getMonthName(row.date)
    monthlyTraffic.set(monthName, (monthlyTraffic.get(monthName) ?? 0) + row.page_views)

    const existing = monthlyCtr.get(monthName) ?? { views: 0, clicks: 0 }
    existing.views += row.page_views
    existing.clicks += row.clicks
    monthlyCtr.set(monthName, existing)
  }

  const trafficOverTime: MonthlyDataPoint[] = Array.from(monthlyTraffic.entries()).map(
    ([name, value]) => ({ name, value })
  )

  const ctrOverTime: MonthlyDataPoint[] = Array.from(monthlyCtr.entries()).map(
    ([name, { views, clicks }]) => ({
      name,
      value: views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0,
    })
  )

  // Total KPIs
  const totalViews = analytics.reduce((s, r) => s + r.page_views, 0)
  const totalClicks = analytics.reduce((s, r) => s + r.clicks, 0)
  const avgCtr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0

  // Split into "recent" (last 4 months) vs "older" for change calculation
  const fourMonthsStr = fourMonthsAgo.toISOString().split("T")[0]
  const recentViews = analytics.filter(r => r.date >= fourMonthsStr).reduce((s, r) => s + r.page_views, 0)
  const olderViews = analytics.filter(r => r.date < fourMonthsStr).reduce((s, r) => s + r.page_views, 0)
  const recentClicks = analytics.filter(r => r.date >= fourMonthsStr).reduce((s, r) => s + r.clicks, 0)
  const olderClicks = analytics.filter(r => r.date < fourMonthsStr).reduce((s, r) => s + r.clicks, 0)

  // Avg position from post_metrics (still useful as a static snapshot)
  const { data: positionData } = await db
    .from("post_metrics")
    .select("rank_position, post_id, posts!inner(tenant_id)")
    .eq("posts.tenant_id", tenantId)

  const positions = ((positionData ?? []) as any[])
    .map((p: any) => p.rank_position)
    .filter((p: number | null): p is number => p !== null)
  const avgPosition = positions.length > 0
    ? Math.round((positions.reduce((s: number, p: number) => s + p, 0) / positions.length) * 10) / 10
    : 0

  // ─── 2. Top posts by views ───────────────────────────────────────────────

  const postViewsMap = new Map<string, { views: number; clicks: number }>()
  for (const row of analytics) {
    if (!row.post_id) continue
    const existing = postViewsMap.get(row.post_id) ?? { views: 0, clicks: 0 }
    existing.views += row.page_views
    existing.clicks += row.clicks
    postViewsMap.set(row.post_id, existing)
  }

  // Fetch post titles for the top performing ones
  const topPostIds = Array.from(postViewsMap.entries())
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 6)
    .map(([id]) => id)

  let topPosts: TopPostMetric[] = []
  let lowPerforming: TopPostMetric[] = []

  if (topPostIds.length > 0) {
    const allPostIds = Array.from(postViewsMap.keys())
    const { data: postData } = await db
      .from("posts")
      .select("id, title, slug")
      .in("id", allPostIds)

    const postMap = new Map<string, { id: string; title: string; slug: string }>(
      ((postData ?? []) as Array<{ id: string; title: string; slug: string }>).map((p) => [p.id, p])
    )

    const allPostMetrics = Array.from(postViewsMap.entries())
      .map(([id, stats]) => {
        const post = postMap.get(id)
        if (!post) return null
        const ctr = stats.views > 0 ? ((stats.clicks / stats.views) * 100) : 0
        return {
          title: post.title,
          slug: post.slug,
          views: stats.views,
          clicks: stats.clicks,
          ctr: `${ctr.toFixed(1)}%`,
        }
      })
      .filter(Boolean) as TopPostMetric[]

    allPostMetrics.sort((a, b) => b.views - a.views)
    topPosts = allPostMetrics.slice(0, 4)
    lowPerforming = allPostMetrics.slice(-2).reverse()
  }

  // ─── 3. Conversions: contacts as leads ──────────────────────────────────

  const { data: contactRows } = await db
    .from("contacts")
    .select("id, created_at, source, email, name, source_article, status, interest")
    .eq("tenant_id", tenantId)
    .gte("created_at", eightMonthsAgo.toISOString())
    .order("created_at", { ascending: false })

  const contacts = (contactRows ?? []) as Array<{
    id: string
    created_at: string
    source: string | null
    email: string
    name: string | null
    source_article: string | null
    status: string
    interest: string
  }>

  // Monthly conversions
  const monthlyConversions = new Map<string, number>()
  const sourceCount = new Map<string, number>()

  for (const c of contacts) {
    const monthName = getMonthName(c.created_at)
    monthlyConversions.set(monthName, (monthlyConversions.get(monthName) ?? 0) + 1)

    const src = c.source ?? "direto"
    const normalizedSrc = src.toLowerCase().includes("blog") || src.toLowerCase().includes("organic")
      ? "Orgânico"
      : src.toLowerCase().includes("social")
        ? "Social"
        : src.toLowerCase().includes("referr")
          ? "Referência"
          : "Direto"
    sourceCount.set(normalizedSrc, (sourceCount.get(normalizedSrc) ?? 0) + 1)
  }

  const conversionOverTime: MonthlyDataPoint[] = Array.from(monthlyConversions.entries()).map(
    ([name, value]) => ({ name, value })
  )

  const sourceColors: Record<string, string> = {
    "Orgânico": "hsl(var(--primary))",
    "Direto": "hsl(var(--chart-2, 221 83% 53%))",
    "Social": "hsl(var(--chart-3, 142 71% 45%))",
    "Referência": "hsl(var(--chart-4, 38 92% 50%))",
  }

  const totalContacts = contacts.length
  const conversionBySource = Array.from(sourceCount.entries()).map(([name, count]) => ({
    name,
    value: totalContacts > 0 ? Math.round((count / totalContacts) * 100) : 0,
    color: sourceColors[name] ?? "hsl(var(--muted-foreground))",
  }))

  // Recent conversion events
  const recentEvents: ConversionEvent[] = contacts.slice(0, 8).map((c) => {
    const d = new Date(c.created_at)
    const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    return {
      date: dateStr,
      type: c.interest === "newsletter" ? "Lead via formulário" : c.interest === "whatsapp" ? "Clique no WhatsApp" : "Lead via formulário",
      origin: c.source_article ? `/blog/${c.source_article}` : c.source ?? "/home",
      user: c.email,
      status: c.status === "active" ? "confirmado" : "pendente",
    }
  })

  // Conversion KPIs
  const recentContacts = contacts.filter(c => c.created_at >= fourMonthsAgo.toISOString()).length
  const olderContacts = contacts.filter(c => c.created_at < fourMonthsAgo.toISOString()).length
  const conversionRate = totalViews > 0 ? Math.round((totalContacts / totalViews) * 1000) / 10 : 0
  const qualifiedLeads = contacts.filter(c => c.status === "active").length

  // ─── 4. GEO: Tráfego IAs via GA4 Mestre ─────────────────────────────────

  const geoTraffic = await getGeoTrafficFromGA4(tenantId, "30daysAgo", "today")

  return {
    seo: {
      kpis: {
        totalViews,
        totalClicks,
        avgCtr,
        avgPosition,
        viewsChange: calculateChange(recentViews, olderViews),
        clicksChange: calculateChange(recentClicks, olderClicks),
      },
      trafficOverTime,
      ctrOverTime,
      topPosts,
      lowPerforming,
    },
    conversions: {
      kpis: {
        totalConversions: totalContacts,
        conversionRate,
        qualifiedLeads,
        conversionsChange: calculateChange(recentContacts, olderContacts),
      },
      conversionOverTime,
      conversionBySource,
      recentEvents,
    },
    geo: {
      trafficSources: geoTraffic,
    },
  }
}
