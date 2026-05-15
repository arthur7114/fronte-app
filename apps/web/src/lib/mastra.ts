import "server-only";

import { mastra } from "@super/ai";

export { mastra };

export type WorkflowSuspendInfo = {
  stepId: string;
  payload: Record<string, unknown>;
};

export type WorkflowSnapshot = {
  runId: string;
  workflowId: string;
  status: "pending" | "running" | "suspended" | "completed" | "failed";
  suspended: WorkflowSuspendInfo[];
  output?: Record<string, unknown>;
  error?: string;
};
