import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth-context";
import { getWorkflowBySlug, isWorkflowSlug } from "@/lib/workflow-registry";
import { getOptionalAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type StartBody = Record<string, unknown> & {
  operationMode?: "manual" | "assisted" | "automatic";
  strategyId?: string | null;
  qualityThreshold?: number;
};

async function resolveStrategyDefaults(
  strategyId: string | undefined | null,
  tenantId: string,
): Promise<{ operationMode?: "manual" | "assisted" | "automatic"; qualityThreshold?: number }> {
  if (!strategyId) return {};
  const db = getOptionalAdminSupabaseClient() ?? (await getServerSupabaseClient());
  const { data } = await db
    .from("strategies")
    .select("operation_mode, quality_threshold")
    .eq("id", strategyId)
    .eq("tenant_id", tenantId)
    .single<{ operation_mode?: string | null; quality_threshold?: number | null }>();

  const out: { operationMode?: "manual" | "assisted" | "automatic"; qualityThreshold?: number } = {};
  if (
    data?.operation_mode === "manual" ||
    data?.operation_mode === "assisted" ||
    data?.operation_mode === "automatic"
  ) {
    out.operationMode = data.operation_mode;
  }
  if (typeof data?.quality_threshold === "number") {
    out.qualityThreshold = data.quality_threshold;
  }
  return out;
}

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

    const body = (await req.json()) as StartBody;
    const defaults = await resolveStrategyDefaults(
      (body.strategyId as string | undefined) ?? undefined,
      tenant.id,
    );

    const inputData = {
      tenantId: tenant.id,
      operationMode: body.operationMode ?? defaults.operationMode ?? "manual",
      qualityThreshold: body.qualityThreshold ?? defaults.qualityThreshold ?? 70,
      ...body,
    };

    const workflow = getWorkflowBySlug(name);
    const run = await workflow.createRunAsync();
    void run.start({ inputData });

    return NextResponse.json({
      success: true,
      runId: run.runId,
      workflow: name,
      operationMode: inputData.operationMode,
    });
  } catch (error) {
    console.error("[workflow/start]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
