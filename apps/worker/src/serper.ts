import { createAdminClient } from "@super/db";

export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerpContextResult {
  results: SerperOrganicResult[];
  contextString: string;
}

export async function fetchSerpWithCache(
  keyword: string,
  tenantId: string
): Promise<SerpContextResult> {
  const db = createAdminClient();

  // 1. Check cache (unexpired)
  const { data: snapshot } = await (db as any)
    .from("serp_snapshots")
    .select("id, snapshot_data")
    .eq("tenant_id", tenantId)
    .eq("keyword", keyword)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  let organicResults: SerperOrganicResult[] = []

  if (snapshot && snapshot.snapshot_data) {
    const data = snapshot.snapshot_data
    if (data.organic && Array.isArray(data.organic)) {
      organicResults = data.organic.slice(0, 10).map((res: any) => ({
        title: res.title,
        link: res.link,
        snippet: res.snippet,
        position: res.position,
      }))
    }
  } else {
    // 2. Fetch from Serper.dev
    const apiKey = process.env.SERPER_API_KEY
    if (!apiKey) {
      console.warn("SERPER_API_KEY not found. Skipping real SERP fetch.")
      return { results: [], contextString: "" }
    }

    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: keyword, gl: "br", hl: "pt-br" }),
      })

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`)
      }

      const data = await response.json()

      // Calculate expiration (72h from now)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 72)

      // 3. Save Snapshot
      const { data: insertedSnapshot, error: snapErr } = await (db as any)
        .from("serp_snapshots")
        .insert({
          tenant_id: tenantId,
          keyword: keyword,
          snapshot_data: data,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (snapErr) {
        console.error("Error saving serp_snapshot:", snapErr)
      }

      if (data.organic && Array.isArray(data.organic)) {
        organicResults = data.organic.slice(0, 10).map((res: any) => ({
          title: res.title,
          link: res.link,
          snippet: res.snippet,
          position: res.position,
        }))

        // 4. Save Results
        if (insertedSnapshot) {
          const resultsToInsert = organicResults.map((r) => ({
            snapshot_id: insertedSnapshot.id,
            position: r.position,
            title: r.title,
            link: r.link,
            snippet: r.snippet,
          }))

          if (resultsToInsert.length > 0) {
            await (db as any).from("serp_results").insert(resultsToInsert)
          }

          // 5. Update Workspace Competitors
          const domains = organicResults
            .map((r) => {
              try {
                const url = new URL(r.link)
                return url.hostname.replace(/^www\./, "")
              } catch {
                return null
              }
            })
            .filter(Boolean) as string[]

          // Deduplicate domains in this SERP
          const uniqueDomains = Array.from(new Set(domains))

          // Upsert score (basic implementation for MVP: increment score)
          for (const domain of uniqueDomains) {
            // Check if exists
            const { data: existingComp } = await (db as any)
              .from("workspace_competitors")
              .select("id, frequency_score")
              .eq("tenant_id", tenantId)
              .eq("domain", domain)
              .maybeSingle()

            if (existingComp) {
              await (db as any)
                .from("workspace_competitors")
                .update({
                  frequency_score: existingComp.frequency_score + 1,
                  last_seen: new Date().toISOString(),
                })
                .eq("id", existingComp.id)
            } else {
              await (db as any).from("workspace_competitors").insert({
                tenant_id: tenantId,
                domain: domain,
                frequency_score: 1,
                last_seen: new Date().toISOString(),
              })
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch SERP:", err)
      return { results: [], contextString: "" }
    }
  }

  // Generate a context string for the AI prompt
  const contextString = organicResults
    .map((r) => `Pos ${r.position}: "${r.title}"\nSnippet: ${r.snippet}`)
    .join("\n\n")

  return {
    results: organicResults,
    contextString,
  }
}
