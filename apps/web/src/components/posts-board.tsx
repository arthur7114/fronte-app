import Link from "next/link";
import type { Tables } from "@super/db";
import { POST_STATUS_LABELS } from "@/lib/post";

type PostsBoardProps = {
  posts: Tables<"posts">[];
  site: Tables<"sites">;
};

export function PostsBoard({ posts, site }: PostsBoardProps) {
  const publishedCount = posts.filter((post) => post.status === "published").length;
  const draftCount = posts.filter((post) => post.status === "draft").length;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="dashboard-surface rounded-lg p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Lista de posts
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
              O editorial do site em um lugar so.
            </h2>
          </div>
          <Link
            href="/app/posts/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground transition duration-200 hover:-translate-y-0.5"
          >
            Novo post
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr] border-b border-border bg-secondary/35 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <span>Titulo</span>
            <span>Status</span>
            <span>Slug</span>
            <span>Atualizado</span>
            <span>Publicado</span>
          </div>
          {posts.length === 0 ? (
            <div className="px-4 py-6 text-sm leading-7 text-black/62">
              Ainda nao ha posts neste blog. Abra um rascunho para iniciar o fluxo editorial.
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/app/posts/${post.id}`}
                className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr] border-b border-border px-4 py-4 text-sm transition duration-200 hover:bg-white/70 last:border-b-0"
              >
                <span className="font-medium text-black">{post.title}</span>
                <span className="text-black/65">
                  {POST_STATUS_LABELS[post.status as keyof typeof POST_STATUS_LABELS] ?? post.status}
                </span>
                <span className="text-black/55">{post.slug}</span>
                <span className="text-black/55">
                  {new Date(post.updated_at).toLocaleDateString("pt-BR")}
                </span>
                <span className="text-black/55">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("pt-BR")
                    : "-"}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <aside className="dashboard-surface rounded-lg p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Fluxo
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
            Status editorial visivel.
          </h3>
          <p className="mt-2 text-sm leading-7 text-black/62">
            O bloco mostra o caminho do conteudo: rascunho, revisao, aprovacao e
            publicacao.
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="rounded-lg border border-border bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Site
            </p>
            <p className="mt-2 text-lg font-medium text-black">{site.subdomain}</p>
          </div>
          <div className="rounded-lg border border-border bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Publicados
            </p>
            <p className="mt-2 text-lg font-medium text-black">{publishedCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Rascunhos
            </p>
            <p className="mt-2 text-lg font-medium text-black">{draftCount}</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
