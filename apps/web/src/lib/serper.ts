import { getDb } from "@super/db"

export interface SerperResult {
  title: string
  link: string
  snippet: string
  position: number
}

export interface SerpSnapshot {
  id: string
  tenant_id: string
  keyword: string
  query_time: string
  expires_at: string
  snapshot_data: any
  results?: SerperResult[]
}

const CACHE_HOURS = 72

export async function fetchSerpWithCache(keyword: string, tenantId: string): Promise<SerpSnapshot | null> {
  const db = await getDb()

  // 1. Check Cache
  const { data: cached } = await (db as any)
    .from("serp_snapshots")
    .select(`
      id, tenant_id, keyword, query_time, expires_at, snapshot_data,
      serp_results ( position, title, link, snippet, is_competitor )
    `)
    .eq("tenant_id", tenantId)
    .eq("keyword", keyword)
    .gt("expires_at", new Date().toISOString())
    .order("query_time", { ascending: false })
    .limit(1)
    .single()

  if (cached) {
    return {
      ...cached,
      results: cached.serp_results,
    }
  }

  // 2. Fetch from Serper.dev API
  const SERPER_API_KEY = process.env.SERPER_API_KEY
  if (!SERPER_API_KEY || SERPER_API_KEY === "your_serper_api_key_here") {
    console.warn("SERPER_API_KEY is not set or invalid.")
    return null
  }

  let serperData
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: keyword, gl: "br", hl: "pt-br" }),
    })

    if (!res.ok) {
      console.error(`Serper API error: ${res.statusText}`)
      return null
    }

    serperData = await res.json()
  } catch (error) {
    console.error("Failed to fetch from Serper API", error)
    return null
  }

  // 3. Save Snapshot
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + CACHE_HOURS)

  const { data: snapshot, error: snapshotError } = await (db as any)
    .from("serp_snapshots")
    .insert({
      tenant_id: tenantId,
      keyword,
      expires_at: expiresAt.toISOString(),
      snapshot_data: serperData,
    })
    .select()
    .single()

  if (snapshotError || !snapshot) {
    console.error("Failed to save SERP snapshot", snapshotError)
    return null
  }

  // 4. Save Results & Update Competitors
  const organicResults = serperData.organic || []
  const resultsToInsert = organicResults.map((r: any) => ({
    snapshot_id: snapshot.id,
    position: r.position,
    title: r.title,
    link: r.link,
    snippet: r.snippet,
    is_competitor: true, // Assuming organic results are competitors by default
  }))

  if (resultsToInsert.length > 0) {
    await (db as any).from("serp_results").insert(resultsToInsert)

    // Update Competitors Share of Voice
    for (const r of organicResults) {
      try {
        const url = new URL(r.link)
        const domain = url.hostname.replace("www.", "")
        
        // Upsert workspace_competitor
        // First try to check if it exists
        const { data: existingCompetitor } = await (db as any)
          .from("workspace_competitors")
          .select("id, frequency_score")
          .eq("tenant_id", tenantId)
          .eq("domain", domain)
          .single()

        if (existingCompetitor) {
          await (db as any)
            .from("workspace_competitors")
            .update({
              frequency_score: existingCompetitor.frequency_score + 1,
              last_seen: new Date().toISOString(),
            })
            .eq("id", existingCompetitor.id)
        } else {
          await (db as any)
            .from("workspace_competitors")
            .insert({
              tenant_id: tenantId,
              domain,
              frequency_score: 1,
              last_seen: new Date().toISOString(),
            })
        }
      } catch (err) {
        console.error("Failed to parse URL for competitor tracking", r.link)
      }
    }
  }

  return {
    ...snapshot,
    results: resultsToInsert,
  }
}
