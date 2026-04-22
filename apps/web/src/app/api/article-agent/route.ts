import { NextResponse } from "next/server"
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import {
  runResearchPhase,
  runStructurePhase,
  runWritePhase,
  runReviewPhase,
} from "@/lib/article-agent"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = getOptionalAdminSupabaseClient() ?? getServerSupabaseClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { generationId, tenantId, phase } = body

    if (!generationId || !tenantId || !phase) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result
    switch (phase) {
      case "research":
        result = await runResearchPhase(generationId, tenantId)
        break
      case "structure":
        result = await runStructurePhase(generationId, tenantId)
        break
      case "write":
        result = await runWritePhase(generationId, tenantId)
        break
      case "review":
        result = await runReviewPhase(generationId, tenantId)
        break
      default:
        return NextResponse.json({ error: "Invalid phase" }, { status: 400 })
    }

    return NextResponse.json({ success: true, phase, result })
  } catch (error: any) {
    console.error("Article Agent Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
