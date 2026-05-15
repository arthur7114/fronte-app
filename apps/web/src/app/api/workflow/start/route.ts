import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth-context";
import { mastra } from "@/lib/mastra";
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const maxDuration = 60;

type StartBody = {
  generationId: string;
  postId: string;
  strategyId?: string | null;
  topic: string;
  primaryKeyword?: string | null;
  tone?: string | null;
  targetLength?: string | null;
  additionalInstructions?: string | null;
  operationMode?: "manual" | "assisted" | "automatic";
  qualityThreshold?: number;
};

export async function POST(req: Request) {
  try {
    const { tenant } = await getAuthContext();
    if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as StartBody;
    if (!body.generationId || !body.postId || !body.topic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If strategy_id is set, look up its operation_mode so workflow defaults match
    let mode: "manual" | "assisted" | "automatic" = body.operationMode ?? "manual";
    let threshold = body.qualityThreshold ?? 70;

    if (body.strategyId) {
      const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
      const { data: strategy } = await db
        .from("strategies")
        .select("operation_mode, quality_threshold")
        .eq("id", body.strategyId)
        .eq("tenant_id", tenant.id)
        .single<{ operation_mode?: string | null; quality_threshold?: number | null }>();

      if (strategy?.operation_mode === "manual" || strategy?.operation_mode === "assisted" || strategy?.operation_mode === "automatic") {
        mode = strategy.operation_mode;
      }
      if (typeof strategy?.quality_threshold === "number") {
        threshold = strategy.quality_threshold;
      }
    }

    const workflow = mastra.getWorkflow("createArticleWorkflow");
    const run = await workflow.createRunAsync();

    // Fire-and-forget; pollers check Supabase for state.
    void run.start({
      inputData: {
        generationId: body.generationId,
        tenantId: tenant.id,
        postId: body.postId,
        strategyId: body.strategyId ?? null,
        topic: body.topic,
        primaryKeyword: body.primaryKeyword ?? null,
        tone: body.tone ?? "profissional e acessível",
        targetLength: body.targetLength ?? "médio (1000 palavras)",
        additionalInstructions: body.additionalInstructions ?? null,
        operationMode: mode,
        qualityThreshold: threshold,
      },
    });

    return NextResponse.json({
      success: true,
      runId: run.runId,
      operationMode: mode,
      qualityThreshold: threshold,
    });
  } catch (error) {
    console.error("[workflow/start]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
