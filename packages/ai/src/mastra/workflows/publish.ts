import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { supabaseDb } from "../tools/supabase";

/**
 * Publish workflow. No AI, no suspend — pure side-effects on `posts`.
 *
 * The actual push to the customer's CMS is handled by the Supabase Edge
 * Function `publish-scheduled-posts` that runs on pg_cron. This workflow only
 * decides whether to flip the post to `scheduled` (with a `scheduled_for`
 * date) or to `published` immediately and writes the row accordingly.
 */

const PublishInput = z.object({
  tenantId: z.string().uuid(),
  postId: z.string().uuid(),
  scheduledFor: z.string().nullable().optional(),
});

const PublishOutput = z.object({
  postId: z.string(),
  status: z.enum(["published", "scheduled"]),
  scheduledFor: z.string().nullable(),
});

const validateStep = createStep({
  id: "validate-post",
  inputSchema: PublishInput,
  outputSchema: PublishInput,
  execute: async ({ inputData }) => {
    const post = await supabaseDb.getPost(inputData.postId, inputData.tenantId);
    if (!post) throw new Error(`Post ${inputData.postId} not found.`);

    const status = (post as { status?: string }).status;
    if (status && ["published", "publishing"].includes(status)) {
      throw new Error(`Post already in terminal state: ${status}.`);
    }

    return inputData;
  },
});

const persistStep = createStep({
  id: "persist-publish-state",
  inputSchema: PublishInput,
  outputSchema: PublishOutput,
  execute: async ({ inputData }) => {
    const now = new Date().toISOString();
    const targetIsScheduled = Boolean(inputData.scheduledFor);

    const patch: Record<string, unknown> = {
      status: targetIsScheduled ? "scheduled" : "published",
      approved_at: now,
      updated_at: now,
    };

    if (targetIsScheduled) {
      patch.scheduled_for = inputData.scheduledFor;
    } else {
      patch.published_at = now;
      patch.scheduled_for = null;
    }

    await supabaseDb.updatePost(inputData.postId, inputData.tenantId, patch);

    return {
      postId: inputData.postId,
      status: targetIsScheduled ? ("scheduled" as const) : ("published" as const),
      scheduledFor: inputData.scheduledFor ?? null,
    };
  },
});

export const publishWorkflow = createWorkflow({
  id: "publish",
  inputSchema: PublishInput,
  outputSchema: PublishOutput,
})
  .then(validateStep)
  .then(persistStep)
  .commit();
