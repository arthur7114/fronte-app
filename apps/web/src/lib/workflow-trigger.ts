import "server-only";

import { getWorkflowBySlug, isWorkflowSlug, type WorkflowSlug } from "@/lib/workflow-registry";

/**
 * Server-side trigger for Mastra workflows. Used by Server Actions and chat
 * tools that previously inserted into `automation_jobs`.
 *
 * Returns the runId immediately and starts the workflow asynchronously (the
 * caller does not await the workflow completion — it polls via
 * /api/workflow/[name]/status).
 */
export async function triggerWorkflow(
  slug: WorkflowSlug | string,
  inputData: Record<string, unknown>,
): Promise<{ runId: string; workflow: WorkflowSlug } | { error: string }> {
  if (!isWorkflowSlug(slug)) {
    return { error: `Unknown workflow: ${slug}` };
  }

  try {
    const workflow = getWorkflowBySlug(slug);
    const run = await workflow.createRunAsync();
    void run.start({ inputData });
    return { runId: run.runId, workflow: slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow start failed.";
    console.error(`[triggerWorkflow:${slug}]`, error);
    return { error: message };
  }
}

/**
 * Resume a suspended workflow run.
 */
export async function resumeWorkflow(
  slug: WorkflowSlug | string,
  runId: string,
  stepId: string,
  resumeData: Record<string, unknown>,
): Promise<{ success: true } | { error: string }> {
  if (!isWorkflowSlug(slug)) {
    return { error: `Unknown workflow: ${slug}` };
  }

  try {
    const workflow = getWorkflowBySlug(slug);
    const run = await workflow.createRunAsync({ runId });
    void run.resume({ step: stepId, resumeData });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow resume failed.";
    console.error(`[resumeWorkflow:${slug}]`, error);
    return { error: message };
  }
}
