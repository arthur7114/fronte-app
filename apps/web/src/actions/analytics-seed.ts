"use server"

import { getServerSupabaseClient } from "@/lib/supabase/server"
import { getAuthContext } from "@/lib/auth-context"

/**
 * Seed action that generates realistic analytics_daily + contacts data
 * for testing the Analytics dashboard. DEV ONLY.
 */
export async function seedAnalyticsDataAction() {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Unauthorized")

  const supabase = await getServerSupabaseClient()
  const db = supabase as any

  // 1. Get existing posts for this tenant
  const { data: posts } = await db
    .from("posts")
    .select("id, title, slug, status, created_at")
    .eq("tenant_id", tenant.id)

  if (!posts || posts.length === 0) {
    return { success: false, message: "Nenhum post encontrado neste tenant. Crie posts antes de rodar o seed." }
  }

  // 2. Clear existing analytics_daily for this tenant (idempotent re-run)
  await db.from("analytics_daily").delete().eq("tenant_id", tenant.id)

  // 3. Generate last 8 months of daily data per post
  const now = new Date()
  const sources = ["organic", "direct", "social", "referral"]
  const sourceWeights = [0.58, 0.22, 0.14, 0.06] // realistic distribution

  const dailyRows: Array<Record<string, unknown>> = []

  for (const post of posts) {
    const postCreated = new Date(post.created_at)
    const startMonth = new Date(now.getFullYear(), now.getMonth() - 7, 1)
    const effectiveStart = postCreated > startMonth ? postCreated : startMonth

    // Each post gets a "growth factor" that ramps up over time
    const postAge = (now.getTime() - postCreated.getTime()) / (1000 * 60 * 60 * 24) // days
    const maturityMultiplier = Math.min(postAge / 60, 3) // older posts get more traffic

    let currentDate = new Date(effectiveStart)
    while (currentDate <= now) {
      // Day-of-week effect: weekdays get more traffic
      const dayOfWeek = currentDate.getDay()
      const weekdayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1.0

      // Growth curve: traffic increases month over month
      const monthDiff = (currentDate.getMonth() - effectiveStart.getMonth()) +
        (currentDate.getFullYear() - effectiveStart.getFullYear()) * 12
      const growthFactor = 1 + (monthDiff * 0.15) // 15% monthly growth

      // Randomness factor
      const randomness = 0.7 + Math.random() * 0.6

      // Base metrics for this day
      const baseViews = Math.round(15 * maturityMultiplier * weekdayMultiplier * growthFactor * randomness)

      // Distribute across sources
      for (let si = 0; si < sources.length; si++) {
        const sourceViews = Math.max(1, Math.round(baseViews * sourceWeights[si]))
        const sourceCtr = 0.02 + Math.random() * 0.04 // 2-6% CTR
        const sourceClicks = Math.max(0, Math.round(sourceViews * sourceCtr))
        const uniqueRatio = 0.65 + Math.random() * 0.2  // 65-85% unique
        const uniqueVisitors = Math.max(1, Math.round(sourceViews * uniqueRatio))
        const avgTime = Math.round(30 + Math.random() * 180) // 30-210 seconds
        const bounce = Math.round((40 + Math.random() * 35) * 100) / 100 // 40-75%

        dailyRows.push({
          tenant_id: tenant.id,
          post_id: post.id,
          date: currentDate.toISOString().split("T")[0],
          page_views: sourceViews,
          unique_visitors: uniqueVisitors,
          clicks: sourceClicks,
          avg_time_on_page: avgTime,
          bounce_rate: bounce,
          source: sources[si],
        })
      }

      // Advance to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  // 4. Insert in batches of 500
  let inserted = 0
  for (let i = 0; i < dailyRows.length; i += 500) {
    const batch = dailyRows.slice(i, i + 500)
    const { error } = await db.from("analytics_daily").insert(batch)
    if (error) {
      console.error("Seed analytics insert error:", error)
      return { success: false, message: `Erro ao inserir batch ${i}: ${error.message}` }
    }
    inserted += batch.length
  }

  // 5. Seed contacts if < 20 exist
  const { count: contactCount } = await db
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)

  let contactsInserted = 0
  if ((contactCount ?? 0) < 20) {
    const contactSources = ["blog_organic", "social_instagram", "direct", "blog_organic", "referral_partner", "blog_organic"]
    const interests = ["newsletter", "consultoria", "newsletter", "orcamento", "newsletter"]
    const names = [
      "Marina Silva", "João Pedro", "Ana Costa", "Ricardo Oliveira", "Carla Mendes",
      "Pedro Santos", "Juliana Almeida", "Bruno Ferreira", "Patrícia Lima", "Lucas Rocha",
      "Amanda Barbosa", "Thiago Nunes", "Fernanda Souza", "Gabriel Torres", "Isabela Martins",
      "Matheus Gomes", "Larissa Costa", "Daniel Ribeiro", "Camila Carvalho", "Rafael Nascimento",
      "Beatriz Moura", "Gustavo Pereira", "Vanessa Dias", "André Cardoso", "Letícia Araújo",
      "Felipe Monteiro", "Débora Santos", "Vinícius Lopes", "Mariana Correia", "Diego Campos",
    ]
    const articles = posts.map((p: any) => p.slug)

    const contactRows = []
    for (let i = 0; i < 30; i++) {
      const monthsAgo = Math.floor(Math.random() * 8)
      const daysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate() - daysAgo)
      if (createdAt > now) createdAt.setTime(now.getTime() - 86400000)

      contactRows.push({
        tenant_id: tenant.id,
        email: `${names[i].toLowerCase().replace(/\s/g, ".")}${i}@email.com`,
        name: names[i],
        source: contactSources[i % contactSources.length],
        source_article: articles[i % articles.length] ?? null,
        interest: interests[i % interests.length],
        status: Math.random() > 0.2 ? "active" : "pending",
        created_at: createdAt.toISOString(),
      })
    }

    const { error: contactError } = await db.from("contacts").insert(contactRows)
    if (contactError) {
      console.error("Seed contacts error:", contactError)
    } else {
      contactsInserted = contactRows.length
    }
  }

  // 6. Update post_metrics totals to match the daily aggregates
  for (const post of posts) {
    const postAnalytics = dailyRows.filter(r => r.post_id === post.id)
    const totalViews = postAnalytics.reduce((s, r) => s + (r.page_views as number), 0)
    const totalClicks = postAnalytics.reduce((s, r) => s + (r.clicks as number), 0)

    await db
      .from("post_metrics")
      .upsert(
        {
          post_id: post.id,
          views: totalViews,
          clicks: totalClicks,
          rank_position: Math.floor(Math.random() * 15) + 1,
        },
        { onConflict: "post_id" }
      )
  }

  return {
    success: true,
    message: `Seed concluído: ${inserted} registros de analytics, ${contactsInserted} contatos, ${posts.length} post_metrics atualizados.`,
  }
}
