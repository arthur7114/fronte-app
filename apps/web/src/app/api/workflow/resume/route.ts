import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth-context";
import { mastra } from "@/lib/mastra";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type ResumeBody = {
  runId: string;
  stepId: "research" | "structure" | "review";
  approved: boolean;
  rejectReason?: string;
  edits?: {
    title?: string;
    meta_description?: string;
    content?: string;
  };
};

export async function POST(req: Request) {
  try {
    const { tenant } = await getAuthContext();
    if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as ResumeBody;
    if (!body.runId || !body.stepId) {
      return NextResponse.json({ error: "Missing runId or stepId" }, { status: 400 });
    }

    const workflow = mastra.getWorkflow("createArticleWorkflow");
    const run = await workflow.createRunAsync({ runId: body.runId });

    void run.resume({
      step: body.stepId,
      resumeData: {
        approved: body.approved,
        rejectReason: body.rejectReason,
        edits: body.edits,
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
