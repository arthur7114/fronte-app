import dotenv from "dotenv";
import path from "node:path";
import { createAdminClient, type Tables, type TablesInsert, type TablesUpdate } from "@super/db";
import { APP_DEFAULTS, type ContentBriefStatus, type PostStatus, type TopicCandidateStatus } from "@super/shared";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

type OperationMode = "manual" | "assisted" | "automatic";
type SupportedJobType =
  | "research_topics"
  | "generate_keyword_strategy"
  | "generate_brief"
  | "generate_post"
  | "publish_post";

const STRATEGY_TYPES = z.enum(["seo", "local", "blog", "conversao"]);
const OPERATION_MODES = z.enum(["manual", "assisted", "automatic"]);
const STRATEGY_STATUSES = z.enum(["configuring", "active", "paused", "archived"]);
const KEYWORD_STATUSES = z.enum(["pending", "approved", "rejected"]);
const TOPIC_STATUSES = z.enum(["pending", "approved", "rejected"]);
const BRIEF_STATUSES = z.enum(["pending", "approved"]);
const POST_STATUSES = z.enum([
  "draft",
  "in_review",
  "approved",
  "generating",
  "queued",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "rejected",
]);
const JOB_TYPES = z.enum(["research_topics", "generate_keyword_strategy", "generate_brief", "generate_post", "publish_post"]);
const CADENCES = new Set([4, 8, 12, 20]);

type StrategyRecord = Tables<"strategies">;
type KeywordRecord = Tables<"keyword_candidates">;
type TopicRecord = Tables<"topic_candidates">;
type BriefRecord = Tables<"content_briefs">;
type PostRecord = Tables<"posts">;
type JobRecord = Tables<"automation_jobs">;
type SiteRecord = Tables<"sites">;
type AutomationConfigRecord = Tables<"automation_configs">;

type StrategyScope = {
  strategy: StrategyRecord;
  tenantId: string;
  site: SiteRecord | null;
  automationConfig: AutomationConfigRecord | null;
  operationMode: OperationMode;
};

const client = createAdminClient();

function jsonBlock(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function summarizeMode(mode: OperationMode) {
  if (mode === "manual") {
    return {
      label: "Manual",
      summary: "O workspace exige operacao humana direta. A IA pode planejar e sugerir, mas nao deve publicar sem comando explicito.",
      allowed: ["gerar plano", "atualizar estrategia", "enfileirar tarefas sob comando do usuario"],
      blocked: ["publicacao automatica", "agendamento sem confirmacao"],
    };
  }

  if (mode === "assisted") {
    return {
      label: "Assistido",
      summary: "A IA executa o fluxo com checkpoints de aprovacao antes de sair do escopo controlado.",
      allowed: ["pesquisar", "gerar keywords", "gerar temas", "gerar briefs", "gerar posts", "pedir aprovacao"],
      blocked: ["publicar sem aprovacao", "burlar regras do workspace"],
    };
  }

  return {
    label: "Automatico",
    summary: "A IA executa o fluxo dentro dos limites definidos e interrompe apenas em excecoes ou violacoes de regra.",
    allowed: ["pesquisar", "selecionar oportunidades", "gerar, aprovar e agendar dentro dos guardrails"],
    blocked: ["sair do escopo", "ignorar limites de volume", "violar regras da marca"],
  };
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugifyTitle(value: string) {
  return normalizeSearchText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function assertMutationAllowed(scope: StrategyScope) {
  if (scope.operationMode === "manual") {
    throw new Error("Workspace is in manual mode. The agent can read and explain, but cannot mutate strategy data.");
  }
}

function assertPublishingAllowed(scope: StrategyScope) {
  if (scope.operationMode !== "automatic") {
    throw new Error("Only automatic mode can schedule or publish posts. Manual and assisted modes require user action.");
  }
}

async function getStrategyScope(strategyId: string): Promise<StrategyScope> {
  const strategyResult = await client
    .from("strategies")
    .select("*")
    .eq("id", strategyId)
    .maybeSingle();

  if (strategyResult.error) {
    throw new Error(strategyResult.error.message);
  }

  if (!strategyResult.data) {
    throw new Error("Strategy not found.");
  }

  const automationConfigResult = await client
    .from("automation_configs")
    .select("*")
    .eq("tenant_id", strategyResult.data.tenant_id)
    .maybeSingle();

  if (automationConfigResult.error) {
    throw new Error(automationConfigResult.error.message);
  }

  const siteResult = await client
    .from("sites")
    .select("*")
    .eq("tenant_id", strategyResult.data.tenant_id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (siteResult.error) {
    throw new Error(siteResult.error.message);
  }

  const parsedMode = OPERATION_MODES.safeParse(automationConfigResult.data?.operation_mode ?? "assisted");
  const operationMode: OperationMode = parsedMode.success ? parsedMode.data : "assisted";

  return {
    strategy: strategyResult.data,
    tenantId: strategyResult.data.tenant_id,
    site: siteResult.data ?? null,
    automationConfig: automationConfigResult.data ?? null,
    operationMode,
  };
}

async function countStrategyRows(table: "keyword_candidates" | "topic_candidates" | "content_briefs" | "posts", tenantId: string, strategyId: string) {
  const result = await client
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("strategy_id", strategyId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.count ?? 0;
}

async function countStrategyJobs(tenantId: string, strategyId: string) {
  const result = await client
    .from("automation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .filter("payload_json->>strategy_id", "eq", strategyId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.count ?? 0;
}

async function listRecentStrategyRows<T extends "keyword_candidates" | "topic_candidates" | "content_briefs" | "posts">(
  table: T,
  tenantId: string,
  strategyId: string,
  limit = 10,
) {
  const query = client.from(table as never) as any;
  const result = await query
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("strategy_id", strategyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

async function listRecentStrategyJobs(tenantId: string, strategyId: string, limit = 10) {
  const result = await client
    .from("automation_jobs")
    .select("*")
    .eq("tenant_id", tenantId)
    .filter("payload_json->>strategy_id", "eq", strategyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

async function findPublishJobsForPost(tenantId: string, siteId: string, postId: string) {
  const result = await client
    .from("automation_jobs")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("site_id", siteId)
    .eq("type", "publish_post")
    .in("status", ["pending", "running"])
    .contains("payload_json", { post_id: postId });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

async function cancelPublishJobsForPost(tenantId: string, siteId: string, postId: string, reason: string) {
  const jobs = await findPublishJobsForPost(tenantId, siteId, postId);

  if (jobs.length === 0) {
    return;
  }

  const result = await client
    .from("automation_jobs")
    .update({
      status: "cancelled",
      finished_at: new Date().toISOString(),
      error_message: reason,
      result_json: null,
      updated_at: new Date().toISOString(),
    } satisfies TablesUpdate<"automation_jobs">)
    .in("id", jobs.map((job) => job.id))
    .eq("tenant_id", tenantId);

  if (result.error) {
    throw new Error(result.error.message);
  }
}

async function enqueuePublishJob(tenantId: string, siteId: string, postId: string, scheduledFor: string) {
  const result = await client.from("automation_jobs").insert({
    tenant_id: tenantId,
    site_id: siteId,
    type: "publish_post",
    status: "pending",
    priority: 40,
    max_attempts: APP_DEFAULTS.maxJobAttempts,
    scheduled_for: scheduledFor,
    payload_json: {
      tenant_id: tenantId,
      site_id: siteId,
      post_id: postId,
    },
  } satisfies TablesInsert<"automation_jobs">);

  if (result.error) {
    throw new Error(result.error.message);
  }
}

async function getContext(strategyId: string, recentLimit = 10) {
  const scope = await getStrategyScope(strategyId);
  const [keywordCount, topicCount, briefCount, postCount, jobCount] = await Promise.all([
    countStrategyRows("keyword_candidates", scope.tenantId, strategyId),
    countStrategyRows("topic_candidates", scope.tenantId, strategyId),
    countStrategyRows("content_briefs", scope.tenantId, strategyId),
    countStrategyRows("posts", scope.tenantId, strategyId),
    countStrategyJobs(scope.tenantId, strategyId),
  ]);

  const [keywords, topics, briefs, posts, jobs] = await Promise.all([
    listRecentStrategyRows("keyword_candidates", scope.tenantId, strategyId, recentLimit),
    listRecentStrategyRows("topic_candidates", scope.tenantId, strategyId, recentLimit),
    listRecentStrategyRows("content_briefs", scope.tenantId, strategyId, recentLimit),
    listRecentStrategyRows("posts", scope.tenantId, strategyId, recentLimit),
    listRecentStrategyJobs(scope.tenantId, strategyId, recentLimit),
  ]);

  return {
    strategy: scope.strategy,
    workspace: {
      automationConfig: scope.automationConfig,
      operationMode: scope.operationMode,
      policy: summarizeMode(scope.operationMode),
    },
    site: scope.site,
    counts: {
      keywords: keywordCount,
      topics: topicCount,
      briefs: briefCount,
      posts: postCount,
      jobs: jobCount,
    },
    recent: {
      keywords,
      topics,
      briefs,
      posts,
      jobs,
    },
  };
}

async function updateStrategy(strategyId: string, patch: Record<string, unknown>) {
  const scope = await getStrategyScope(strategyId);
  assertMutationAllowed(scope);
  const payload: TablesUpdate<"strategies"> = {};

  if (typeof patch.name === "string" && patch.name.trim()) {
    payload.name = patch.name.trim();
  }

  if (typeof patch.description === "string") {
    payload.description = patch.description.trim() || null;
  }

  if (typeof patch.goal === "string") {
    payload.goal = patch.goal.trim() || null;
    payload.focus = patch.goal.trim() || null;
  }

  if (typeof patch.focus === "string") {
    payload.focus = patch.focus.trim() || null;
  }

  if (typeof patch.audience === "string") {
    payload.audience = patch.audience.trim() || null;
  }

  if (typeof patch.tone === "string") {
    payload.tone = patch.tone.trim() || null;
  }

  if (typeof patch.color === "string") {
    payload.color = patch.color.trim() || null;
  }

  if (typeof patch.strategy_type === "string" && STRATEGY_TYPES.safeParse(patch.strategy_type).success) {
    payload.strategy_type = patch.strategy_type;
  }

  if (typeof patch.status === "string" && STRATEGY_STATUSES.safeParse(patch.status).success) {
    payload.status = patch.status;
  }

  if (typeof patch.cadence === "number" && CADENCES.has(patch.cadence)) {
    payload.cadence = patch.cadence;
  }

  const result = await client
    .from("strategies")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    } satisfies TablesUpdate<"strategies">)
    .eq("id", strategyId)
    .eq("tenant_id", scope.tenantId)
    .select("*")
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("Strategy update produced no row.");
  }

  return result.data;
}

async function queueJob(strategyId: string, input: {
  jobType: SupportedJobType;
  keywordCount?: number;
  topicCandidateId?: string;
  contentBriefId?: string;
  postId?: string;
  scheduledFor?: string;
}) {
  const scope = await getStrategyScope(strategyId);
  assertMutationAllowed(scope);

  if (!scope.site) {
    throw new Error("No site found for this tenant.");
  }

  const payloadBase = {
    tenant_id: scope.tenantId,
    site_id: scope.site.id,
    strategy_id: strategyId,
  };

  let job: TablesInsert<"automation_jobs">;

  switch (input.jobType) {
    case "generate_keyword_strategy":
      if (typeof input.keywordCount !== "number" || input.keywordCount < 1) {
        throw new Error("keywordCount is required for generate_keyword_strategy.");
      }
      job = {
        tenant_id: scope.tenantId,
        site_id: scope.site.id,
        type: "generate_keyword_strategy",
        status: "pending",
        max_attempts: APP_DEFAULTS.maxJobAttempts,
        priority: 5,
        payload_json: {
          ...payloadBase,
          keyword_count: input.keywordCount,
        },
      };
      break;
    case "research_topics":
      job = {
        tenant_id: scope.tenantId,
        site_id: scope.site.id,
        type: "research_topics",
        status: "pending",
        max_attempts: APP_DEFAULTS.maxJobAttempts,
        priority: 10,
        payload_json: payloadBase,
      };
      break;
    case "generate_brief": {
      if (!input.topicCandidateId) {
        throw new Error("topicCandidateId is required for generate_brief.");
      }

      const topicResult = await client
        .from("topic_candidates")
        .select("id, status, strategy_id")
        .eq("id", input.topicCandidateId)
        .eq("tenant_id", scope.tenantId)
        .maybeSingle();

      if (topicResult.error) {
        throw new Error(topicResult.error.message);
      }

      if (!topicResult.data || topicResult.data.strategy_id !== strategyId) {
        throw new Error("Topic candidate not found for this strategy.");
      }

      if (topicResult.data.status !== "approved") {
        throw new Error("Topic candidate must be approved before briefing.");
      }

      job = {
        tenant_id: scope.tenantId,
        site_id: scope.site.id,
        type: "generate_brief",
        status: "pending",
        max_attempts: APP_DEFAULTS.maxJobAttempts,
        priority: 20,
        payload_json: {
          ...payloadBase,
          topic_candidate_id: input.topicCandidateId,
        },
      };
      break;
    }
    case "generate_post": {
      if (!input.contentBriefId) {
        throw new Error("contentBriefId is required for generate_post.");
      }

      const briefResult = await client
        .from("content_briefs")
        .select("id, status, strategy_id")
        .eq("id", input.contentBriefId)
        .eq("tenant_id", scope.tenantId)
        .maybeSingle();

      if (briefResult.error) {
        throw new Error(briefResult.error.message);
      }

      if (!briefResult.data || briefResult.data.strategy_id !== strategyId) {
        throw new Error("Content brief not found for this strategy.");
      }

      if (briefResult.data.status !== "approved") {
        throw new Error("Content brief must be approved before creating a post.");
      }

      job = {
        tenant_id: scope.tenantId,
        site_id: scope.site.id,
        type: "generate_post",
        status: "pending",
        max_attempts: APP_DEFAULTS.maxJobAttempts,
        priority: 30,
        payload_json: {
          ...payloadBase,
          content_brief_id: input.contentBriefId,
        },
      };
      break;
    }
    case "publish_post": {
      assertPublishingAllowed(scope);

      if (!input.postId) {
        throw new Error("postId is required for publish_post.");
      }

      if (!input.scheduledFor) {
        throw new Error("scheduledFor is required for publish_post.");
      }

      const postResult = await client
        .from("posts")
        .select("id, status, strategy_id")
        .eq("id", input.postId)
        .eq("tenant_id", scope.tenantId)
        .eq("site_id", scope.site.id)
        .maybeSingle();

      if (postResult.error) {
        throw new Error(postResult.error.message);
      }

      if (!postResult.data || postResult.data.strategy_id !== strategyId) {
        throw new Error("Post not found for this strategy.");
      }

      if (postResult.data.status !== "scheduled") {
        throw new Error("Post must be scheduled before a publish job is created.");
      }

      job = {
        tenant_id: scope.tenantId,
        site_id: scope.site.id,
        type: "publish_post",
        status: "pending",
        max_attempts: APP_DEFAULTS.maxJobAttempts,
        priority: 40,
        scheduled_for: input.scheduledFor,
        payload_json: {
          tenant_id: scope.tenantId,
          site_id: scope.site.id,
          post_id: input.postId,
        },
      };
      break;
    }
    default: {
      const exhaustiveCheck: never = input.jobType;
      throw new Error(`Unsupported job type: ${exhaustiveCheck}`);
    }
  }

  const result = await client.from("automation_jobs").insert(job).select("*").maybeSingle();
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

async function updateKeywordStatus(strategyId: string, keywordId: string, status: TopicCandidateStatus | "pending") {
  const scope = await getStrategyScope(strategyId);
  assertMutationAllowed(scope);
  const keywordResult = await client
    .from("keyword_candidates")
    .select("*")
    .eq("id", keywordId)
    .eq("tenant_id", scope.tenantId)
    .maybeSingle();

  if (keywordResult.error) {
    throw new Error(keywordResult.error.message);
  }

  if (!keywordResult.data) {
    throw new Error("Keyword candidate not found.");
  }

  if (keywordResult.data.strategy_id !== strategyId) {
    throw new Error("Keyword candidate does not belong to this strategy.");
  }

  const result = await client
    .from("keyword_candidates")
    .update({
      status,
      updated_at: new Date().toISOString(),
    } satisfies TablesUpdate<"keyword_candidates">)
    .eq("id", keywordId)
    .eq("tenant_id", scope.tenantId)
    .select("*")
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("Keyword update produced no row.");
  }

  return result.data;
}

async function updateTopicStatus(strategyId: string, topicId: string, status: TopicCandidateStatus, queueBriefJob: boolean) {
  const scope = await getStrategyScope(strategyId);
  assertMutationAllowed(scope);
  const topicResult = await client
    .from("topic_candidates")
    .select("*")
    .eq("id", topicId)
    .eq("tenant_id", scope.tenantId)
    .maybeSingle();

  if (topicResult.error) {
    throw new Error(topicResult.error.message);
  }

  if (!topicResult.data) {
    throw new Error("Topic candidate not found.");
  }

  if (topicResult.data.strategy_id !== strategyId) {
    throw new Error("Topic candidate does not belong to this strategy.");
  }

  const result = await client
    .from("topic_candidates")
    .update({
      status,
    } satisfies TablesUpdate<"topic_candidates">)
    .eq("id", topicId)
    .eq("tenant_id", scope.tenantId)
    .select("*")
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("Topic update produced no row.");
  }

  if (status === "approved" && queueBriefJob) {
    await queueJob(strategyId, {
      jobType: "generate_brief",
      topicCandidateId: topicId,
    });
  }

  return result.data;
}

async function updateBriefStatus(strategyId: string, briefId: string, status: ContentBriefStatus, queuePostJob: boolean) {
  const scope = await getStrategyScope(strategyId);
  assertMutationAllowed(scope);
  const briefResult = await client
    .from("content_briefs")
    .select("*")
    .eq("id", briefId)
    .eq("tenant_id", scope.tenantId)
    .maybeSingle();

  if (briefResult.error) {
    throw new Error(briefResult.error.message);
  }

  if (!briefResult.data) {
    throw new Error("Content brief not found.");
  }

  if (briefResult.data.strategy_id !== strategyId) {
    throw new Error("Content brief does not belong to this strategy.");
  }

  const result = await client
    .from("content_briefs")
    .update({
      status,
    } satisfies TablesUpdate<"content_briefs">)
    .eq("id", briefId)
    .eq("tenant_id", scope.tenantId)
    .select("*")
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("Brief update produced no row.");
  }

  if (status === "approved" && queuePostJob) {
    await queueJob(strategyId, {
      jobType: "generate_post",
      contentBriefId: briefId,
    });
  }

  return result.data;
}

async function getUniquePostSlug(tenantId: string, siteId: string, preferredSlug: string, usedSlugs: Set<string>) {
  const baseSlug = preferredSlug || `artigo-${Date.now().toString(36)}`;
  let candidate = baseSlug;
  let index = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }

  const existingResult = await client
    .from("posts")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("site_id", siteId)
    .eq("slug", candidate)
    .maybeSingle();

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  if (!existingResult.data) {
    usedSlugs.add(candidate);
    return candidate;
  }

  return getUniquePostSlug(tenantId, siteId, `${baseSlug}-${index}`, usedSlugs);
}

async function createDraftPosts(strategyId: string, input: {
  posts: Array<{
    title: string;
    slug?: string;
    content: string;
    status?: "draft" | "in_review";
  }>;
  note?: string;
}) {
  const scope = await getStrategyScope(strategyId);
  assertMutationAllowed(scope);

  if (!scope.site) {
    throw new Error("No site found for this tenant.");
  }

  const now = new Date().toISOString();
  const usedSlugs = new Set<string>();
  const postsToInsert: TablesInsert<"posts">[] = [];

  for (const item of input.posts.slice(0, 5)) {
    const title = item.title.trim();
    const content = item.content.trim();
    if (!title || !content) continue;

    const preferredSlug = slugifyTitle(item.slug?.trim() || title);
    const slug = await getUniquePostSlug(scope.tenantId, scope.site.id, preferredSlug, usedSlugs);

    postsToInsert.push({
      tenant_id: scope.tenantId,
      site_id: scope.site.id,
      strategy_id: strategyId,
      title,
      slug,
      content,
      status: item.status === "in_review" ? "in_review" : "draft",
      published_at: null,
      scheduled_for: null,
      created_at: now,
      updated_at: now,
    });
  }

  if (!postsToInsert.length) {
    throw new Error("At least one post with title and content is required.");
  }

  const insertResult = await client.from("posts").insert(postsToInsert).select("*");
  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }

  const revisions = (insertResult.data ?? [])
    .filter((post) => typeof post.content === "string")
    .map((post) => ({
      post_id: post.id,
      content: post.content ?? "",
    }));

  if (revisions.length) {
    const revisionResult = await client.from("post_revisions").insert(revisions);
    if (revisionResult.error) {
      throw new Error(`Posts created, but revisions were not recorded: ${revisionResult.error.message}`);
    }
  }

  return {
    note: input.note ?? null,
    createdCount: insertResult.data?.length ?? 0,
    posts: insertResult.data ?? [],
  };
}

async function updatePost(strategyId: string, input: {
  postId: string;
  title?: string;
  slug?: string;
  content?: string;
  status?: PostStatus;
  publishedAt?: string;
}) {
  const scope = await getStrategyScope(strategyId);
  assertMutationAllowed(scope);

  if (!scope.site) {
    throw new Error("No site found for this tenant.");
  }

  const postResult = await client
    .from("posts")
    .select("*")
    .eq("id", input.postId)
    .eq("tenant_id", scope.tenantId)
    .eq("site_id", scope.site.id)
    .maybeSingle();

  if (postResult.error) {
    throw new Error(postResult.error.message);
  }

  if (!postResult.data) {
    throw new Error("Post not found.");
  }

  if (postResult.data.strategy_id !== strategyId) {
    throw new Error("Post does not belong to this strategy.");
  }

  const now = new Date();
  const statusProvided = input.status !== undefined;
  const nextStatus = input.status ?? (postResult.data.status as PostStatus);
  let publishedAt: string | null | undefined = postResult.data.published_at;
  let scheduledFor: string | null | undefined = postResult.data.scheduled_for;

  if (statusProvided && nextStatus === "scheduled") {
    assertPublishingAllowed(scope);

    const candidatePublishedAt = input.publishedAt ?? postResult.data.published_at;
    if (!candidatePublishedAt) {
      throw new Error("publishedAt is required when scheduling a post.");
    }

    const scheduledDate = new Date(candidatePublishedAt);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= now) {
      throw new Error("Use a valid future date to schedule the post.");
    }

    publishedAt = scheduledDate.toISOString();
    scheduledFor = scheduledDate.toISOString();
  } else if (statusProvided && nextStatus === "published") {
    assertPublishingAllowed(scope);

    publishedAt = now.toISOString();
    scheduledFor = null;
  } else if (statusProvided && (nextStatus === "draft" || nextStatus === "rejected" || nextStatus === "in_review" || nextStatus === "approved")) {
    scheduledFor = null;
    if (nextStatus === "draft" || nextStatus === "rejected") {
      publishedAt = null;
    }
  }

  const slug = typeof input.slug === "string" && input.slug.trim() ? input.slug.trim() : postResult.data.slug;
  const title = typeof input.title === "string" && input.title.trim() ? input.title.trim() : postResult.data.title;
  const content = typeof input.content === "string" ? input.content : undefined;

  if (slug !== postResult.data.slug) {
    const duplicateResult = await client
      .from("posts")
      .select("id")
      .eq("tenant_id", scope.tenantId)
      .eq("site_id", scope.site.id)
      .eq("slug", slug)
      .maybeSingle();

    if (duplicateResult.error) {
      throw new Error(duplicateResult.error.message);
    }

    if (duplicateResult.data && duplicateResult.data.id !== input.postId) {
      throw new Error("That slug is already in use.");
    }
  }

  const updateResult = await client
    .from("posts")
    .update({
      title,
      slug,
      content,
      status: nextStatus,
      published_at: publishedAt ?? null,
      scheduled_for: scheduledFor ?? null,
      updated_at: now.toISOString(),
    } satisfies TablesUpdate<"posts">)
    .eq("id", input.postId)
    .eq("tenant_id", scope.tenantId)
    .eq("site_id", scope.site.id)
    .select("*")
    .maybeSingle();

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  if (!updateResult.data) {
    throw new Error("Post update produced no row.");
  }

  if (content !== undefined && content !== postResult.data.content) {
    const revisionResult = await client.from("post_revisions").insert({
      post_id: updateResult.data.id,
      content,
    });

    if (revisionResult.error) {
      throw new Error(`Post saved, but revision was not recorded: ${revisionResult.error.message}`);
    }
  }

  if (nextStatus !== "scheduled") {
    await cancelPublishJobsForPost(scope.tenantId, scope.site.id, input.postId, "Publish job cancelled because the post changed.");
  } else if (publishedAt) {
    await cancelPublishJobsForPost(scope.tenantId, scope.site.id, input.postId, "Publish job replaced by a newer schedule.");
    await enqueuePublishJob(scope.tenantId, scope.site.id, input.postId, publishedAt);
  }

  return updateResult.data;
}

export function createStrategyMcpServer() {
  const server = new McpServer(
    {
      name: "fronte-strategy-ops",
      version: "0.1.0",
    },
    {
      instructions: [
        "Use strategy_get_context before changing anything.",
        "Respect the workspace operation mode returned by strategy_get_policy.",
        "manual: prepare and explain, but avoid autonomous publication.",
        "assisted: execute the workflow with explicit approvals at each gate.",
        "automatic: execute within the configured guardrails and stop on exceptions.",
        "When a user asks to create posts or articles, use strategy_create_draft_posts and only claim creation after the tool returns ok=true.",
        "Created posts must include substantial Markdown content, not placeholders or outlines.",
      ].join(" "),
    },
  );

  server.tool(
    "strategy_get_context",
    {
      strategy_id: z.string().min(1),
      recent_limit: z.number().int().min(1).max(25).optional(),
    },
    async ({ strategy_id, recent_limit }) => {
      const context = await getContext(strategy_id, recent_limit ?? 10);
      return jsonBlock({
        ok: true,
        context,
      });
    },
  );

  server.tool(
    "strategy_get_policy",
    {
      strategy_id: z.string().min(1),
    },
    async ({ strategy_id }) => {
      const context = await getContext(strategy_id, 5);
      return jsonBlock({
        ok: true,
        strategy_id,
        workspace_mode: context.workspace.operationMode,
        policy: context.workspace.policy,
      });
    },
  );

  server.tool(
    "strategy_update",
    {
      strategy_id: z.string().min(1),
      patch: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        goal: z.string().optional(),
        focus: z.string().optional(),
        audience: z.string().optional(),
        tone: z.string().optional(),
        strategy_type: STRATEGY_TYPES.optional(),
        status: STRATEGY_STATUSES.optional(),
        cadence: z.number().int().refine((value) => CADENCES.has(value), "Cadence must be 4, 8, 12 or 20.").optional(),
        color: z.string().optional(),
      }),
    },
    async ({ strategy_id, patch }) => {
      const updated = await updateStrategy(strategy_id, patch);
      return jsonBlock({
        ok: true,
        strategy: updated,
      });
    },
  );

  server.tool(
    "strategy_queue_job",
    {
      strategy_id: z.string().min(1),
      job_type: JOB_TYPES,
      keyword_count: z.number().int().min(1).max(50).optional(),
      topic_candidate_id: z.string().min(1).optional(),
      content_brief_id: z.string().min(1).optional(),
      post_id: z.string().min(1).optional(),
      scheduled_for: z.string().datetime().optional(),
    },
    async (input) => {
      const result = await queueJob(input.strategy_id, {
        jobType: input.job_type as SupportedJobType,
        keywordCount: input.keyword_count,
        topicCandidateId: input.topic_candidate_id,
        contentBriefId: input.content_brief_id,
        postId: input.post_id,
        scheduledFor: input.scheduled_for,
      });

      return jsonBlock({
        ok: true,
        job: result,
      });
    },
  );

  server.tool(
    "strategy_set_keyword_status",
    {
      strategy_id: z.string().min(1),
      keyword_id: z.string().min(1),
      status: KEYWORD_STATUSES,
    },
    async ({ strategy_id, keyword_id, status }) => {
      const updated = await updateKeywordStatus(strategy_id, keyword_id, status);
      return jsonBlock({
        ok: true,
        keyword: updated,
      });
    },
  );

  server.tool(
    "strategy_set_topic_status",
    {
      strategy_id: z.string().min(1),
      topic_id: z.string().min(1),
      status: TOPIC_STATUSES,
      queue_brief_job: z.boolean().optional(),
    },
    async ({ strategy_id, topic_id, status, queue_brief_job }) => {
      const updated = await updateTopicStatus(strategy_id, topic_id, status, queue_brief_job ?? true);
      return jsonBlock({
        ok: true,
        topic: updated,
      });
    },
  );

  server.tool(
    "strategy_set_brief_status",
    {
      strategy_id: z.string().min(1),
      brief_id: z.string().min(1),
      status: BRIEF_STATUSES,
      queue_post_job: z.boolean().optional(),
    },
    async ({ strategy_id, brief_id, status, queue_post_job }) => {
      const updated = await updateBriefStatus(strategy_id, brief_id, status, queue_post_job ?? true);
      return jsonBlock({
        ok: true,
        brief: updated,
      });
    },
  );

  server.tool(
    "strategy_create_draft_posts",
    {
      strategy_id: z.string().min(1),
      posts: z
        .array(
          z.object({
            title: z.string().min(1),
            slug: z.string().optional(),
            content: z.string().min(1),
            status: z.enum(["draft", "in_review"]).optional(),
          }),
        )
        .min(1)
        .max(5),
      note: z.string().optional(),
    },
    async ({ strategy_id, posts, note }) => {
      const result = await createDraftPosts(strategy_id, { posts, note });
      return jsonBlock({
        ok: true,
        ...result,
      });
    },
  );

  server.tool(
    "strategy_update_post",
    {
      strategy_id: z.string().min(1),
      post_id: z.string().min(1),
      title: z.string().optional(),
      slug: z.string().optional(),
      content: z.string().optional(),
      status: POST_STATUSES.optional(),
      published_at: z.string().datetime().optional(),
    },
    async ({ strategy_id, post_id, title, slug, content, status, published_at }) => {
      const updated = await updatePost(strategy_id, {
        postId: post_id,
        title,
        slug,
        content,
        status,
        publishedAt: published_at,
      });

      return jsonBlock({
        ok: true,
        post: updated,
      });
    },
  );

  return server;
}

export async function main() {
  const server = createStrategyMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
