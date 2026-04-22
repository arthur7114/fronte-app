import "server-only"
import { getServerSupabaseClient } from "@/lib/supabase/server"

export type DashboardStats = {
  organicTraffic: number
  publishedArticles: number
  keywordsRanked: number
  conversions: number
}

// Emits dummy metric growth tracking logic just to preserve visual styling.
export type DashboardMetric = {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  description: string
  tooltip: string
}

export async function getDashboardStatsFromDb(tenantId: string): Promise<DashboardStats> {
  const supabase = await getServerSupabaseClient()

  // 1. Organic Traffic (SUM of views in post_metrics paired with current tenant's posts)
  const { data: trafficData } = await supabase
    .from("posts")
    .select(`
      post_metrics (
        views
      )
    `)
    .eq("tenant_id", tenantId)

  let organicTraffic = 0
  if (trafficData) {
    organicTraffic = (trafficData as any[]).reduce((acc, current) => {
      // Because it's an array of objects having post_metrics, which is either an array or object
      // Supabase's generated TS handles it as any/array.
      const metrics = Array.isArray(current.post_metrics) 
        ? current.post_metrics 
        : current.post_metrics ? [current.post_metrics] : []
        
      const views = metrics.reduce((sum: number, metric: any) => sum + (metric.views || 0), 0)
      return acc + views
    }, 0)
  }

  // 2. Published Articles (Count of posts with status 'publicado')
  const { count: publishedArticlesCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "publicado")

  // 3. Keywords Ranked (Count of keyword_candidates where status = 'approved')
  // Depending on business logic, this might be metric's 'rank_position' <= 10.
  // Using keyword_candidates approved for broader measure.
  const { count: keywordsRankedCount } = await supabase
    .from("keyword_candidates")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "approved")

  // 4. Conversions (Count of contacts linked to the tenant)
  const { count: conversionsCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)

  return {
    organicTraffic: organicTraffic,
    publishedArticles: publishedArticlesCount || 0,
    keywordsRanked: keywordsRankedCount || 0,
    conversions: conversionsCount || 0,
  }
}
