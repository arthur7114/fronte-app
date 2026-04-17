"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables, TablesInsert, TablesUpdate } from "@super/db";
import { APP_DEFAULTS, type PostStatus } from "@super/shared";
import { getAuthContext } from "@/lib/auth-context";
import { validatePostInput } from "@/lib/post";
import { getPostForSite } from "@/lib/post-data";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export type PostEditorState = {
  error?: string;
};

type PostIntent =
  | "save_draft"
  | "send_to_review"
  | "approve"
  | "reject"
  | "schedule"
  | "publish_now";

const POST_INTENT_TO_STATUS: Record<PostIntent, PostStatus> = {
  save_draft: "draft",
  send_to_review: "in_review",
  approve: "approved",
  reject: "rejected",
  schedule: "scheduled",
  publish_now: "published",
};

async function findPublishJobsForPost(
  admin: ReturnType<typeof getAdminSupabaseClient>,
  tenantId: string,
  siteId: string,
  postId: string,
) {
  const result = (await admin
    .from("automation_jobs")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("site_id", siteId)
    .eq("type", "publish_post")
    .in("status", ["pending", "running"])
    .contains("payload_json", { post_id: postId })) as {
    data: Array<Pick<Tables<"automation_jobs">, "id">> | null;
    error: { message: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

async function cancelPublishJobsForPost(
  admin: ReturnType<typeof getAdminSupabaseClient>,
  tenantId: string,
  siteId: string,
  postId: string,
  reason: string,
) {
  const jobs = await findPublishJobsForPost(admin, tenantId, siteId, postId);

  if (jobs.length === 0) {
    return;
  }

  const updateResult = await admin
    .from("automation_jobs")
    .update({
      status: "cancelled",
      finished_at: new Date().toISOString(),
      error_message: reason,
      result_json: null,
    } satisfies TablesUpdate<"automation_jobs">)
    .in("id", jobs.map((job) => job.id))
    .eq("tenant_id", tenantId);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }
}

async function enqueuePublishJob(
  admin: ReturnType<typeof getAdminSupabaseClient>,
  input: {
    tenantId: string;
    siteId: string;
    postId: string;
    scheduledFor: string;
  },
) {
  const result = await admin
    .from("automation_jobs")
    .insert({
      tenant_id: input.tenantId,
      site_id: input.siteId,
      type: "publish_post",
      status: "pending",
      priority: 40,
      max_attempts: APP_DEFAULTS.maxJobAttempts,
      scheduled_for: input.scheduledFor,
      payload_json: {
        tenant_id: input.tenantId,
        site_id: input.siteId,
        post_id: input.postId,
      },
    } satisfies TablesInsert<"automation_jobs">);

  if (result.error) {
    throw new Error(result.error.message);
  }
}

async function mutatePost(
  postId: string | null,
  formData: FormData,
): Promise<PostEditorState> {
  const context = await getAuthContext();

  if (!context.user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  if (!context.membership || !context.tenant) {
    redirect("/onboarding");
  }

  if (!context.site) {
    redirect("/onboarding/site");
  }

  const validation = validatePostInput(
    String(formData.get("title") ?? ""),
    String(formData.get("slug") ?? ""),
    String(formData.get("content") ?? ""),
  );

  if (!validation.ok) {
    return { error: validation.error };
  }

  const intent = String(formData.get("intent") ?? "save_draft") as PostIntent;

  if (!(intent in POST_INTENT_TO_STATUS)) {
    return { error: "Acao editorial invalida." };
  }

  const admin = getAdminSupabaseClient();
  const existingPost = postId
    ? await getPostForSite(context.tenant.id, context.site.id, postId)
    : null;

  if (postId && !existingPost) {
    return { error: "O post selecionado nao foi encontrado." };
  }

  const duplicateResult = (await admin
    .from("posts")
    .select("id")
    .eq("tenant_id", context.tenant.id)
    .eq("site_id", context.site.id)
    .eq("slug", validation.value.slug)
    .maybeSingle()) as {
    data: Pick<Tables<"posts">, "id"> | null;
    error: { message: string } | null;
  };

  if (duplicateResult.error) {
    return { error: "Nao foi possivel validar o slug do post agora." };
  }

  if (duplicateResult.data && duplicateResult.data.id !== postId) {
    return { error: "Esse slug ja esta em uso neste blog." };
  }

  const status = POST_INTENT_TO_STATUS[intent];
  const publishedAtInput = String(formData.get("published_at") ?? "").trim();
  const now = new Date();
  let publishedAt: string | null = null;

  if (status === "scheduled") {
    if (!publishedAtInput) {
      return { error: "Escolha uma data futura para agendar o post." };
    }

    const parsedDate = new Date(publishedAtInput);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate <= now) {
      return { error: "Use uma data futura valida para o agendamento." };
    }

    publishedAt = parsedDate.toISOString();
  }

  if (status === "published") {
    publishedAt = now.toISOString();
  }

  if (existingPost && status !== "scheduled") {
    try {
      await cancelPublishJobsForPost(
        admin,
        context.tenant.id,
        context.site.id,
        existingPost.id,
        "Cancelado por alteracao manual do post.",
      );
    } catch {
      return { error: "Nao foi possivel sincronizar os jobs de publicacao deste post." };
    }
  }

  const postPayload = {
    tenant_id: context.tenant.id,
    site_id: context.site.id,
    title: validation.value.title,
    slug: validation.value.slug,
    content: validation.value.content,
    status,
    published_at: publishedAt,
    updated_at: now.toISOString(),
  };

  const postResult = postId
    ? ((await admin
        .from("posts")
        .update(postPayload satisfies TablesUpdate<"posts">)
        .eq("id", postId)
        .eq("tenant_id", context.tenant.id)
        .eq("site_id", context.site.id)
        .select("*")
        .single()) as {
        data: Tables<"posts"> | null;
        error: { code?: string; message: string } | null;
      })
    : ((await admin
        .from("posts")
        .insert(postPayload satisfies TablesInsert<"posts">)
        .select("*")
        .single()) as {
        data: Tables<"posts"> | null;
        error: { code?: string; message: string } | null;
      });

  if (postResult.error || !postResult.data) {
    if (postResult.error?.code === "23505") {
      return { error: "Esse slug ja esta em uso neste blog." };
    }

    return { error: "Nao foi possivel salvar o post agora." };
  }

  const revisionResult = (await admin.from("post_revisions").insert({
    post_id: postResult.data.id,
    content: validation.value.content,
  })) as {
    error: { message: string } | null;
  };

  if (revisionResult.error) {
    return { error: "O post foi salvo, mas a revisao nao foi registrada." };
  }

  if (status === "scheduled" && postResult.data.published_at) {
    try {
      await cancelPublishJobsForPost(
        admin,
        context.tenant.id,
        context.site.id,
        postResult.data.id,
        "Cancelado para reagendamento do post.",
      );
      await enqueuePublishJob(admin, {
        tenantId: context.tenant.id,
        siteId: context.site.id,
        postId: postResult.data.id,
        scheduledFor: postResult.data.published_at,
      });
    } catch {
      return { error: "O post foi salvo, mas o job de publicacao nao foi sincronizado." };
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/artigos");
  revalidatePath("/app/jobs");
  revalidatePath(`/app/artigos/${postResult.data.id}`);
  revalidatePath(`/blog/${context.site.subdomain}`);
  revalidatePath(`/blog/${context.site.subdomain}/${postResult.data.slug}`);

  if (existingPost?.slug && existingPost.slug !== postResult.data.slug) {
    revalidatePath(`/blog/${context.site.subdomain}/${existingPost.slug}`);
  }

  redirect(`/app/artigos/${postResult.data.id}`);
}

export async function createPost(
  _prevState: PostEditorState,
  formData: FormData,
): Promise<PostEditorState> {
  return mutatePost(null, formData);
}

export async function updatePost(
  postId: string,
  _prevState: PostEditorState,
  formData: FormData,
): Promise<PostEditorState> {
  return mutatePost(postId, formData);
}

