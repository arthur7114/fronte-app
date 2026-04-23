import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/auth-context"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"

export type JobStatus = "idle" | "pending" | "running" | "completed" | "failed"

export interface JobStatusResponse {
  status: JobStatus
  errorMessage?: string
  /** ISO timestamp of the job row — lets the client filter out stale results */
  jobCreatedAt?: string
}

const VALID_JOB_TYPES = new Set([
  "generate_keyword_strategy",
  "research_topics",
  "generate_brief",
  "generate_post",
  "publish_post",
])

// Look-back window: jobs created in the last 15 minutes are considered "recent"
const LOOKBACK_MINUTES = 15

export async function GET(req: Request) {
  try {
    const { tenant } = await getAuthContext()
    const { searchParams } = new URL(req.url)
    const strategyId = searchParams.get("strategy_id")
    const jobType = searchParams.get("type")

    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!strategyId || !jobType) {
      return NextResponse.json(
        { error: "Missing strategy_id or type" },
        { status: 400 },
      )
    }

    if (!VALID_JOB_TYPES.has(jobType)) {
      return NextResponse.json({ error: "Invalid job type" }, { status: 400 })
    }

    const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient())
    const lookback = new Date(Date.now() - LOOKBACK_MINUTES * 60 * 1000).toISOString()

    const { data, error } = await (db as any)
      .from("automation_jobs")
      .select("status, error_message, finished_at, created_at")
      .eq("tenant_id", tenant.id)
      .eq("type", jobType)
      .contains("payload_json", { strategy_id: strategyId })
      .gte("created_at", lookback)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ status: "idle" } satisfies JobStatusResponse)
    }

    const dbStatus: string = data.status
    let status: JobStatus = "idle"

    if (dbStatus === "pending") status = "pending"
    else if (dbStatus === "running") status = "running"
    else if (dbStatus === "completed") status = "completed"
    else if (dbStatus === "failed") status = "failed"

    const response: JobStatusResponse = {
      status,
      jobCreatedAt: data.created_at,
      ...(status === "failed" && data.error_message
        ? { errorMessage: data.error_message }
        : {}),
    }

    return NextResponse.json(response)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
