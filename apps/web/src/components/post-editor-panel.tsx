"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { Tables } from "@super/db";
import {
  createPost,
  type PostEditorState,
  updatePost,
} from "@/app/app/posts/actions";
import { normalizePostSlug, POST_STATUS_LABELS } from "@/lib/post";

type PostEditorPanelProps = {
  post?: Tables<"posts">;
  mode: "new" | "edit";
};

const initialState: PostEditorState = {};

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset();
  return new Date(date.getTime() - timezoneOffset * 60_000).toISOString().slice(0, 16);
}

export function PostEditorPanel({ post, mode }: PostEditorPanelProps) {
  const action = useMemo(
    () => (mode === "edit" && post ? updatePost.bind(null, post.id) : createPost),
    [mode, post],
  );
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [publishedAt, setPublishedAt] = useState(toDateTimeLocal(post?.published_at));
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));

  useEffect(() => {
    if (!slugTouched) {
      setSlug(normalizePostSlug(title));
    }
  }, [title, slugTouched]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <form action={formAction} className="dashboard-surface rounded-lg p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            {mode === "new" ? "Novo post" : "Editor"}
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">
            {mode === "new" ? "Abra um novo rascunho." : "Edite o post selecionado."}
          </h2>
          <p className="max-w-xl text-sm leading-7 text-black/62">
            A interface mostra os campos basicos do CMS e um conjunto de acoes
            editoriais simples para o primeiro ciclo do produto.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Titulo
            </span>
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full border border-black/15 bg-white px-4 py-4 text-base outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(17,17,17,0.06)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Slug
            </span>
            <input
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(normalizePostSlug(event.target.value));
              }}
              className="w-full border border-black/15 bg-white px-4 py-4 text-base outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(17,17,17,0.06)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Conteudo
            </span>
            <textarea
              name="content"
              rows={10}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full border border-black/15 bg-white px-4 py-4 text-base leading-7 outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(17,17,17,0.06)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Data de agendamento
            </span>
            <input
              name="published_at"
              type="datetime-local"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              className="w-full border border-black/15 bg-white px-4 py-4 text-base outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(17,17,17,0.06)]"
            />
          </label>

          {state.error ? (
            <p className="border border-[#b3422f]/20 bg-[#b3422f]/8 px-4 py-3 text-sm text-[#b3422f]">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="intent"
              value="save_draft"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              {isPending ? "Salvando..." : "Salvar rascunho"}
            </button>
            <button
              type="submit"
              name="intent"
              value="send_to_review"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              Enviar para aprovacao
            </button>
            <button
              type="submit"
              name="intent"
              value="approve"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              Aprovar
            </button>
            <button
              type="submit"
              name="intent"
              value="reject"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              Rejeitar
            </button>
            <button
              type="submit"
              name="intent"
              value="schedule"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              Agendar
            </button>
            <button
              type="submit"
              name="intent"
              value="publish_now"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-4 text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              Publicar agora
            </button>
          </div>
        </div>
      </form>

      <aside className="dashboard-surface rounded-lg p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Pre-visualizacao
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
            {title || "Titulo do post"}
          </h3>
          <p className="mt-2 text-sm leading-7 text-black/62">
            {slug || "slug-do-post"}
          </p>
        </div>

        <div className="space-y-3 border-t border-black/10 pt-4 text-sm leading-7 text-black/65">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Status atual
            </p>
            <p className="mt-2 text-lg font-medium text-black">
              {post
                ? POST_STATUS_LABELS[post.status as keyof typeof POST_STATUS_LABELS] ?? post.status
                : "Novo rascunho"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Publicacao
            </p>
            <p className="mt-2">{publishedAt || "Ainda nao definida"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Conteudo
            </p>
            <p className="mt-2 whitespace-pre-line">{content || "Sem conteudo ainda."}</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
