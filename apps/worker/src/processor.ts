import type { Tables, TablesInsert, TablesUpdate } from "@super/db";
import { createAdminClient } from "@super/db";
import { resolveAiModel, WORKER_DEFAULTS } from "./config.js";
import { callOpenAiJson } from "./openai.js";
import {
  buildBriefPrompt,
  buildPostPrompt,
  buildResearchPrompt,
} from "./prompts.js";
import type {
  BriefGenerationResult,
  ClaimedJob,
  JobPayload,
  PostGenerationResult,
  PublishPostResult,
  TopicResearchResult,
} from "./types.js";

const JOB_TYPES = new Set([
  "research_topics",
  "generate_brief",
  "generate_post",
  "publish_post",
]);

function asPayload(job: ClaimedJob): JobPayload {
  return (job.payload_json ?? {}) as JobPayload;
}

function resolveOpenAiModel(preferences: Tables<"ai_preferences"> | null) {
  return resolveAiModel(preferences?.model?.trim() || WORKER_DEFAULTS.openAiModel);
}

async function loadAutomationContext(client: ReturnType<typeof createAdminClient>, job: ClaimedJob) {
  const payload = asPayload(job);

  if (!payload.tenant_id || !payload.site_id) {
    throw new Error("Job payload is missing tenant_id or site_id.");
  }

  let configQuery = client
    .from("automation_configs")
    .select("*")
    .eq("tenant_id", payload.tenant_id);

  if (payload.automation_config_id) {
    configQuery = configQuery.eq("id", payload.automation_config_id);
  }

  const [siteResult, configResult, preferencesResult, rulesResult, briefingResult] = await Promise.all([
    client
      .from("sites")
      .select("*")
      .eq("id", payload.site_id)
      .eq("tenant_id", payload.tenant_id)
      .maybeSingle(),
    configQuery.maybeSingle(),
    client
      .from("ai_preferences")
      .select("*")
      .eq("tenant_id", payload.tenant_id)
      .maybeSingle(),
    client
      .from("ai_rules")
      .select("*")
      .eq("tenant_id", payload.tenant_id),
    client
      .from("business_briefings")
      .select("*")
      .eq("tenant_id", payload.tenant_id)
      .maybeSingle(),
  ]);

  if (siteResult.error) {
    throw new Error(siteResult.error.message);
  }

  if (configResult.error) {
    throw new Error(configResult.error.message);
  }

  if (preferencesResult.error) {
    throw new Error(preferencesResult.error.message);
  }

  if (rulesResult.error) {
    throw new Error(rulesResult.error.message);
  }

  if (briefingResult.error) {
    throw new Error(briefingResult.error.message);
  }

  return {
    payload,
    site: siteResult.data,
    config: configResult.data,
    preferences: preferencesResult.data,
    rules: rulesResult.data ?? [],
    briefing: briefingResult.data,
  };
}

async function claimNextJobs(client: ReturnType<typeof createAdminClient>) {
  const pendingResult = await client
    .from("automation_jobs")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(WORKER_DEFAULTS.pollLimit);

  if (pendingResult.error) {
    throw new Error(pendingResult.error.message);
  }

  const claimed: ClaimedJob[] = [];
  const now = new Date().toISOString();

  for (const job of (pendingResult.data ?? []).filter((item) => {
    if (!item.scheduled_for) {
      return true;
    }

    return new Date(item.scheduled_for).getTime() <= Date.now();
  })) {
    if (job.attempts >= job.max_attempts) {
      await finishJob(client, job.id, {
        status: "failed",
        finished_at: now,
        error_message: "Numero maximo de tentativas atingido.",
      });
      continue;
    }

    const updateResult = await client
      .from("automation_jobs")
      .update({
        status: "running",
        attempts: job.attempts + 1,
        started_at: job.started_at ?? now,
        updated_at: now,
      } satisfies TablesUpdate<"automation_jobs">)
      .eq("id", job.id)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }

    if (updateResult.data) {
      claimed.push(updateResult.data as ClaimedJob);
    }
  }

  return claimed;
}

async function finishJob(
  client: ReturnType<typeof createAdminClient>,
  jobId: string,
  patch: Partial<Pick<Tables<"automation_jobs">, "status" | "error_message" | "result_json" | "started_at" | "finished_at" | "attempts">>,
) {
  const result = await client
    .from("automation_jobs")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    } satisfies TablesUpdate<"automation_jobs">)
    .eq("id", jobId)
    .select("*")
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data as ClaimedJob | null;
}

async function processResearchTopics(client: ReturnType<typeof createAdminClient>, job: ClaimedJob) {
  const context = await loadAutomationContext(client, job);

  if (!context.site || !context.config) {
    throw new Error("Missing site or automation config for research job.");
  }

  const model = resolveOpenAiModel(context.preferences);

  const aiResult = await callOpenAiJson<TopicResearchResult>({
    model,
    messages: [
      {
        role: "user",
        content: buildResearchPrompt(context.config, context.site, context.briefing),
      },
    ],
    schemaHint:
      '{ "topics": [{ "topic": "string", "score": 0, "source": "string" }] }',
  });

  if (!Array.isArray(aiResult.topics) || aiResult.topics.length === 0) {
    throw new Error("OpenAI did not return any topic suggestions.");
  }

  const topicCandidateIds: string[] = [];

  for (const topic of aiResult.topics.slice(0, 10)) {
    if (!topic.topic?.trim()) {
      continue;
    }

    const insertResult = await client
      .from("topic_candidates")
      .insert({
        tenant_id: context.payload.tenant_id,
        topic: topic.topic,
        score: topic.score ?? null,
        source: topic.source ?? "openai",
        status: "pending",
      } satisfies TablesInsert<"topic_candidates">)
      .select("*")
      .single();

    if (insertResult.error || !insertResult.data) {
      throw new Error(insertResult.error?.message ?? "Failed to insert topic candidate.");
    }

    topicCandidateIds.push(insertResult.data.id);
  }

  if (topicCandidateIds.length === 0) {
    throw new Error("OpenAI returned empty topic suggestions.");
  }

  await finishJob(client, job.id, {
    status: "completed",
    finished_at: new Date().toISOString(),
    result_json: { topic_candidate_ids: topicCandidateIds },
    error_message: null,
  });
}

async function processGenerateBrief(client: ReturnType<typeof createAdminClient>, job: ClaimedJob) {
  const context = await loadAutomationContext(client, job);
  const payload = asPayload(job);

  if (!payload.topic_candidate_id || !payload.tenant_id) {
    throw new Error("Job payload is missing topic_candidate_id.");
  }

  const topicResult = await client
    .from("topic_candidates")
    .select("*")
    .eq("id", payload.topic_candidate_id)
    .eq("tenant_id", payload.tenant_id)
    .maybeSingle();

  if (topicResult.error) {
    throw new Error(topicResult.error.message);
  }

  if (!topicResult.data) {
    throw new Error("Topic candidate not found.");
  }

  if (topicResult.data.status !== "approved") {
    throw new Error("Topic candidate must be approved before generating a brief.");
  }

  const model = resolveOpenAiModel(context.preferences);

  const aiResult = await callOpenAiJson<BriefGenerationResult>({
    model,
    messages: [
      {
        role: "user",
        content: buildBriefPrompt(topicResult.data, context.preferences, context.rules),
      },
    ],
    schemaHint: '{ "title": "string", "angle": "string", "keywords": ["string"] }',
  });

  if (!aiResult.title?.trim() || !aiResult.angle?.trim() || !Array.isArray(aiResult.keywords)) {
    throw new Error("OpenAI returned an invalid brief payload.");
  }

  const briefResult = await client
    .from("content_briefs")
    .insert({
      tenant_id: payload.tenant_id,
      topic: topicResult.data.topic,
      keywords: aiResult.keywords,
      angle: aiResult.angle,
      status: "approved",
    } satisfies TablesInsert<"content_briefs">)
    .select("*")
    .single();

  if (briefResult.error || !briefResult.data) {
    throw new Error(briefResult.error?.message ?? "Failed to insert content brief.");
  }

  await finishJob(client, job.id, {
    status: "completed",
    finished_at: new Date().toISOString(),
    result_json: { content_brief_id: briefResult.data.id },
    error_message: null,
  });
}

async function processGeneratePost(client: ReturnType<typeof createAdminClient>, job: ClaimedJob) {
  const context = await loadAutomationContext(client, job);
  const payload = asPayload(job);

  if (!payload.content_brief_id || !payload.tenant_id || !payload.site_id) {
    throw new Error("Job payload is missing content_brief_id.");
  }

  const [briefResult, siteResult] = await Promise.all([
    client
      .from("content_briefs")
      .select("*")
      .eq("id", payload.content_brief_id)
      .eq("tenant_id", payload.tenant_id)
      .maybeSingle(),
    client
      .from("sites")
      .select("*")
      .eq("id", payload.site_id)
      .eq("tenant_id", payload.tenant_id)
      .maybeSingle(),
  ]);

  if (briefResult.error) {
    throw new Error(briefResult.error.message);
  }

  if (siteResult.error) {
    throw new Error(siteResult.error.message);
  }

  if (!briefResult.data) {
    throw new Error("Content brief not found.");
  }

  if (briefResult.data.status !== "approved") {
    throw new Error("Content brief must be approved before creating a post.");
  }

  if (!siteResult.data) {
    throw new Error("Site not found.");
  }

  const model = resolveOpenAiModel(context.preferences);

  const aiResult = await callOpenAiJson<PostGenerationResult>({
    model,
    messages: [
      {
        role: "user",
        content: buildPostPrompt(briefResult.data, context.preferences, context.rules),
      },
    ],
    schemaHint: '{ "title": "string", "slug": "string", "content": "string" }',
  });

  if (!aiResult.title?.trim() || !aiResult.slug?.trim() || !aiResult.content?.trim()) {
    throw new Error("OpenAI returned an invalid post payload.");
  }

  const normalizedSlug = aiResult.slug
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let finalSlug = normalizedSlug || `post-${Date.now().toString(36)}`;
  const existingSlugResult = await client
    .from("posts")
    .select("id")
    .eq("tenant_id", payload.tenant_id)
    .eq("site_id", payload.site_id)
    .eq("slug", finalSlug)
    .maybeSingle();

  if (existingSlugResult.error) {
    throw new Error(existingSlugResult.error.message);
  }

  if (existingSlugResult.data) {
    finalSlug = `${finalSlug}-${job.id.slice(0, 6)}`;
  }

  const postInsert = await client
    .from("posts")
    .insert({
      tenant_id: payload.tenant_id,
      site_id: payload.site_id,
      title: aiResult.title.trim(),
      slug: finalSlug,
      content: aiResult.content.trim(),
      status: "draft",
      published_at: null,
    } satisfies TablesInsert<"posts">)
    .select("*")
    .single();

  if (postInsert.error || !postInsert.data) {
    throw new Error(postInsert.error?.message ?? "Failed to insert post.");
  }

  const revisionInsert = await client.from("post_revisions").insert({
    post_id: postInsert.data.id,
    content: aiResult.content.trim(),
  });

  if (revisionInsert.error) {
    throw new Error(revisionInsert.error.message);
  }

  await finishJob(client, job.id, {
    status: "completed",
    finished_at: new Date().toISOString(),
    result_json: { post_id: postInsert.data.id },
    error_message: null,
  });
}

async function processPublishPost(client: ReturnType<typeof createAdminClient>, job: ClaimedJob) {
  const payload = asPayload(job);

  if (!payload.post_id || !payload.tenant_id || !payload.site_id) {
    throw new Error("Job payload is missing post_id.");
  }

  const postResult = await client
    .from("posts")
    .select("*")
    .eq("id", payload.post_id)
    .eq("tenant_id", payload.tenant_id)
    .eq("site_id", payload.site_id)
    .maybeSingle();

  if (postResult.error) {
    throw new Error(postResult.error.message);
  }

  if (!postResult.data) {
    throw new Error("Post not found for publication.");
  }

  if (postResult.data.status !== "scheduled") {
    throw new Error("Post is no longer scheduled for publication.");
  }

  if (!postResult.data.published_at) {
    throw new Error("Scheduled post is missing the publication date.");
  }

  const scheduledAt = new Date(postResult.data.published_at);

  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Scheduled publication date is invalid.");
  }

  if (scheduledAt.getTime() > Date.now()) {
    throw new Error("Publish job ran before the scheduled publication time.");
  }

  const publishResult = await client
    .from("posts")
    .update({
      status: "published",
      published_at: postResult.data.published_at,
      updated_at: new Date().toISOString(),
    } satisfies TablesUpdate<"posts">)
    .eq("id", payload.post_id)
    .eq("tenant_id", payload.tenant_id)
    .eq("site_id", payload.site_id)
    .eq("status", "scheduled")
    .select("*")
    .maybeSingle();

  if (publishResult.error) {
    throw new Error(publishResult.error.message);
  }

  if (!publishResult.data) {
    throw new Error("Post is no longer eligible for publication.");
  }

  const result: PublishPostResult = {
    post_id: publishResult.data.id,
  };

  await finishJob(client, job.id, {
    status: "completed",
    finished_at: new Date().toISOString(),
    result_json: result,
    error_message: null,
  });
}

async function failJob(client: ReturnType<typeof createAdminClient>, job: ClaimedJob, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown worker error.";
  await finishJob(client, job.id, {
    status: "failed",
    finished_at: new Date().toISOString(),
    error_message: message,
  });
}

async function processJob(client: ReturnType<typeof createAdminClient>, job: ClaimedJob) {
  try {
    switch (job.type) {
      case "research_topics":
        await processResearchTopics(client, job);
        return;
      case "generate_brief":
        await processGenerateBrief(client, job);
        return;
      case "generate_post":
        await processGeneratePost(client, job);
        return;
      case "publish_post":
        await processPublishPost(client, job);
        return;
      default:
        await failJob(client, job, new Error(`Unsupported job type: ${job.type}`));
    }
  } catch (error) {
    await failJob(client, job, error);
  }
}

export async function startProcessor() {
  const client = createAdminClient();
  const claimedJobs = await claimNextJobs(client);

  if (claimedJobs.length === 0) {
    console.log(`[Processor] No jobs ready. Max attempts: ${WORKER_DEFAULTS.maxAttempts}`);
    return;
  }

  for (const job of claimedJobs) {
    if (!JOB_TYPES.has(job.type)) {
      await failJob(client, job, new Error(`Unsupported job type: ${job.type}`));
      continue;
    }

    console.log(`[Processor] Processing job ${job.id} (${job.type}) for tenant ${job.tenant_id}`);
    await processJob(client, job);
  }
}
