import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth-context";
import { mastra } from "@/lib/mastra";

export const maxDuration = 30;

export async function GET(req: Request) {
  try {
    const { tenant } = await getAuthContext();
    if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const runId = new URL(req.url).searchParams.get("runId");
    if (!runId) return NextResponse.json({ error: "Missing runId" }, { status: 400 });

    const storage = mastra.getStorage();
    if (!storage) {
      return NextResponse.json({ error: "Storage not available" }, { status: 500 });
    }

    const snapshot = await storage.loadWorkflowSnapshot({
      workflowName: "createArticleWorkflow",
      runId,
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("[workflow/status]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
