import { createClient } from "npm:@supabase/supabase-js@2";

const JSON_HEADERS = { "Content-Type": "application/json" };

type Provider = "wordpress" | "webflow" | "custom";

type JsonRecord = Record<string, unknown>;

interface PublishRequest {
  post_id: string;
  tenant_id: string;
}

interface Post {
  id: string;
  tenant_id: string;
  site_id: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  meta_title: string | null;
  slug: string;
  scheduled_for: string | null;
  status: string;
}

interface SiteIntegration {
  id: string;
  provider: Provider;
  status: string;
  config: unknown;
}

function jsonResponse(status: number, body: JsonRecord) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function getConfig(integration: SiteIntegration): JsonRecord {
  if (!integration.config || typeof integration.config !== "object" || Array.isArray(integration.config)) {
    return {};
  }

  return integration.config as JsonRecord;
}

function getConfigString(config: JsonRecord, key: string) {
  const value = config[key];
  return typeof value === "string" ? value.trim() : "";
}

function isPrivateIp(hostname: string) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (
    normalized === "localhost" ||
    normalized === "0.0.0.0" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.startsWith("127.") ||
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    normalized.startsWith("169.254.")
  ) {
    return true;
  }

  const [first, second] = normalized.split(".").map((part) => Number(part));
  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }

  return normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

function getEndpoint(config: JsonRecord, provider: Provider) {
  const rawEndpoint = getConfigString(config, "endpoint");
  if (!rawEndpoint) {
    throw new Error(`${provider}: endpoint nao configurado.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(rawEndpoint);
  } catch {
    throw new Error(`${provider}: endpoint invalido.`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`${provider}: endpoint precisa usar HTTPS.`);
  }

  if (isPrivateIp(parsed.hostname)) {
    throw new Error(`${provider}: endpoint privado ou local nao permitido.`);
  }

  return rawEndpoint.replace(/\/$/, "");
}

function getApiKey(config: JsonRecord, provider: Provider) {
  const apiKey = getConfigString(config, "api_key");
  if (!apiKey && provider !== "custom") {
    throw new Error(`${provider}: api_key nao configurada.`);
  }

  return apiKey;
}

async function assertOk(response: Response, provider: Provider) {
  if (response.ok) {
    return;
  }

  const body = await response.text();
  throw new Error(`${provider} retornou ${response.status}: ${body.slice(0, 1000)}`);
}

async function publishToWordPress(post: Post, integration: SiteIntegration) {
  const config = getConfig(integration);
  const endpoint = getEndpoint(config, "wordpress");
  const apiKey = getApiKey(config, "wordpress");

  const response = await fetch(`${endpoint}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      title: post.title,
      content: post.content ?? "",
      excerpt: post.meta_description ?? "",
      slug: post.slug,
      status: "publish",
      date_gmt: post.scheduled_for ?? new Date().toISOString(),
    }),
  });

  await assertOk(response, "wordpress");
}

async function publishToWebflow(post: Post, integration: SiteIntegration) {
  const config = getConfig(integration);
  const endpoint = getEndpoint(config, "webflow");
  const apiKey = getApiKey(config, "webflow");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      fields: {
        name: post.title,
        slug: post.slug,
        "post-body": post.content ?? "",
        "meta-description": post.meta_description ?? "",
        _archived: false,
        _draft: false,
      },
    }),
  });

  await assertOk(response, "webflow");
}

async function publishToCustom(post: Post, integration: SiteIntegration) {
  const config = getConfig(integration);
  const endpoint = getEndpoint(config, "custom");
  const apiKey = getApiKey(config, "custom");
  const headers: Record<string, string> = { ...JSON_HEADERS };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: post.id,
      tenant_id: post.tenant_id,
      site_id: post.site_id,
      title: post.title,
      content: post.content,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      slug: post.slug,
      published_at: new Date().toISOString(),
    }),
  });

  await assertOk(response, "custom");
}

async function publishToIntegration(post: Post, integration: SiteIntegration) {
  if (integration.provider === "wordpress") {
    await publishToWordPress(post, integration);
    return;
  }

  if (integration.provider === "webflow") {
    await publishToWebflow(post, integration);
    return;
  }

  await publishToCustom(post, integration);
}

async function logFailure(
  db: ReturnType<typeof createClient>,
  tenantId: string,
  postId: string,
  errorMessage: string,
) {
  const now = new Date().toISOString();

  await db.from("automation_jobs").insert({
    tenant_id: tenantId,
    type: "publish_post",
    status: "failed",
    payload_json: { post_id: postId },
    error_message: errorMessage,
    started_at: now,
    finished_at: now,
  });
}

async function failPost(
  db: ReturnType<typeof createClient>,
  tenantId: string,
  postId: string,
  errors: string[],
) {
  const errorMessage = errors.join("; ");

  await db
    .from("posts")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("tenant_id", tenantId);

  await logFailure(db, tenantId, postId, errorMessage);
}

function isAuthorized(req: Request, serviceRoleKey: string) {
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${serviceRoleKey}`) {
    return true;
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  return Boolean(cronSecret && req.headers.get("x-cron-secret") === cronSecret);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  let serviceRoleKey: string;
  let supabaseUrl: string;

  try {
    serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    supabaseUrl = getRequiredEnv("SUPABASE_URL");
  } catch (error) {
    return jsonResponse(500, { error: (error as Error).message });
  }

  if (!isAuthorized(req, serviceRoleKey)) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  let payload: PublishRequest;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON" });
  }

  const postId = payload.post_id?.trim();
  const tenantId = payload.tenant_id?.trim();
  if (!postId || !tenantId) {
    return jsonResponse(400, { error: "post_id e tenant_id sao obrigatorios" });
  }

  const db = createClient(supabaseUrl, serviceRoleKey);

  const { data: post, error: postError } = await db
    .from("posts")
    .select("id, tenant_id, site_id, title, content, meta_description, meta_title, slug, scheduled_for, status")
    .eq("id", postId)
    .eq("tenant_id", tenantId)
    .maybeSingle<Post>();

  if (postError) {
    return jsonResponse(500, { error: postError.message });
  }

  if (!post) {
    return jsonResponse(404, { error: "Post nao encontrado" });
  }

  if (post.status === "published") {
    return jsonResponse(200, { success: true, skipped: "already_published" });
  }

  if (!["scheduled", "publishing"].includes(post.status)) {
    return jsonResponse(409, { error: `Post nao esta elegivel para publicacao: ${post.status}` });
  }

  const { data: integrations, error: integrationError } = await db
    .from("site_integrations")
    .select("id, provider, status, config")
    .eq("tenant_id", tenantId)
    .eq("site_id", post.site_id)
    .eq("status", "configured")
    .returns<SiteIntegration[]>();

  if (integrationError) {
    await failPost(db, tenantId, postId, [integrationError.message]);
    return jsonResponse(500, { success: false, errors: [integrationError.message] });
  }

  if (!integrations?.length) {
    const errors = ["Nenhuma integracao CMS configurada para este site."];
    await failPost(db, tenantId, postId, errors);
    return jsonResponse(422, { success: false, errors });
  }

  const errors: string[] = [];
  for (const integration of integrations) {
    try {
      await publishToIntegration(post, integration);
    } catch (error) {
      errors.push(`[${integration.provider}] ${(error as Error).message}`);
    }
  }

  if (errors.length === integrations.length) {
    await failPost(db, tenantId, postId, errors);
    return jsonResponse(502, { success: false, errors });
  }

  const publishedAt = new Date().toISOString();
  const { error: updateError } = await db
    .from("posts")
    .update({
      status: "published",
      published_at: publishedAt,
      updated_at: publishedAt,
    })
    .eq("id", postId)
    .eq("tenant_id", tenantId);

  if (updateError) {
    return jsonResponse(500, { error: updateError.message });
  }

  return jsonResponse(200, {
    success: true,
    warnings: errors.length ? errors : undefined,
  });
});
