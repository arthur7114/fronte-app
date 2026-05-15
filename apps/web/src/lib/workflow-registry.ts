import "server-only";

import { mastra } from "@/lib/mastra";

/**
 * Maps the URL slug (kebab-case) used by /api/workflow/[name]/* routes to the
 * registered workflow key in the Mastra instance (camelCase). Single source of
 * truth — adding a new workflow means one entry here plus registering it in
 * @super/ai's mastra config.
 */
const WORKFLOW_REGISTRY = {
  "create-article": "createArticleWorkflow",
  "keyword-research": "keywordResearchWorkflow",
  "topic-research": "topicResearchWorkflow",
  publish: "publishWorkflow",
} as const;

export type WorkflowSlug = keyof typeof WORKFLOW_REGISTRY;

export function isWorkflowSlug(value: string): value is WorkflowSlug {
  return value in WORKFLOW_REGISTRY;
}

export function getWorkflowBySlug(slug: WorkflowSlug) {
  const key = WORKFLOW_REGISTRY[slug];
  return mastra.getWorkflow(key);
}

export function getWorkflowKey(slug: WorkflowSlug) {
  return WORKFLOW_REGISTRY[slug];
}
