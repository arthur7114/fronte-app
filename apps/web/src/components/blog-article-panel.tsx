import Link from "next/link";
import type { Tables } from "@super/db";

type BlogArticlePanelProps = {
  site: Tables<"sites">;
  post: Tables<"posts">;
  relatedPosts: Tables<"posts">[];
};

export function BlogArticlePanel({
  site,
  post,
  relatedPosts,
}: BlogArticlePanelProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <article className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/46">
            <span className="border border-black/10 px-3 py-1">Publicado</span>
            <span>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("pt-BR")
                : "Sem data"}
            </span>
            <span>{site.subdomain}</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">
            {post.title}
          </h2>
        </div>

        <div className="mt-8 space-y-5 border-t border-black/10 pt-6 text-base leading-8 text-black/72">
          {(post.content ?? "")
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={`${post.id}-${index}`}>{paragraph}</p>
            ))}
        </div>
      </article>

      <aside className="space-y-4 border border-black/12 bg-[#fbf7f1] p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Site publico
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
            {site.name}
          </h3>
          <p className="mt-2 text-sm leading-7 text-black/62">
            A mesma base editorial do painel aparece aqui com leitura limpa e sem
            distracoes.
          </p>
        </div>

        {relatedPosts.length > 0 ? (
          <div className="space-y-3 border-t border-black/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
              Outras publicacoes
            </p>
            {relatedPosts.map((item) => (
              <Link
                key={item.id}
                href={`/blog/${site.subdomain}/${item.slug}`}
                className="block border border-black/10 bg-white/80 p-4 transition duration-200 hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-black">{item.title}</p>
                <p className="mt-1 text-sm text-black/55">
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString("pt-BR")
                    : "Sem data"}
                </p>
              </Link>
            ))}
          </div>
        ) : null}
      </aside>
    </section>
  );
}
