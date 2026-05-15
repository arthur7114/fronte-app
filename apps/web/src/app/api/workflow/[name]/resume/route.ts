import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth-context";
import { getWorkflowBySlug, isWorkflowSlug } from "@/lib/workflow-registry";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type ResumeBody = {
  runId: string;
  stepId: string;
  approved: boolean;
  rejectReason?: string;
  edits?: Record<string, unknown>;
  keywordsToKeep?: string[];
  topicsToKeep?: string[];
};

export async function POST(
  req: Request,
  context: { params: Promise<{ name: string }> },
) {
  try {
    const { tenant } = await getAuthContext();
    if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await context.params;
    if (!isWorkflowSlug(name)) {
      return NextResponse.json({ error: `Unknown workflow: ${name}` }, { status: 404 });
    }

    const body = (await req.json()) as ResumeBody;
    if (!body.runId || !body.stepId) {
      return NextResponse.json({ error: "Missing runId or stepId" }, { status: 400 });
    }

    const workflow = getWorkflowBySlug(name);
    const run = await workflow.createRunAsync({ runId: body.runId });

    void run.resume({
      step: body.stepId,
      resumeData: {
        approved: body.approved,
        rejectReason: body.rejectReason,
        edits: body.edits,
        keywordsToKeep: body.keywordsToKeep,
        topicsToKeep: body.topicsToKeep,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[workflow/resume]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
