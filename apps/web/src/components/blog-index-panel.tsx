import Link from "next/link";
import type { Tables } from "@super/db";

type BlogIndexPanelProps = {
  site: Tables<"sites">;
  posts: Tables<"posts">[];
};

function getExcerpt(content: string | null) {
  const normalizedContent = (content ?? "").replace(/\s+/g, " ").trim();

  if (!normalizedContent) {
    return "Sem resumo disponivel ainda.";
  }

  return normalizedContent.length > 180
    ? `${normalizedContent.slice(0, 177)}...`
    : normalizedContent;
}

export function BlogIndexPanel({ site, posts }: BlogIndexPanelProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Feed publico
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">
            Publicacoes que ja passaram pela revisao.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-black/62">
            O blog publico aparece por caminho, sem subdominio real neste bloco. O
            foco e validar leitura, hierarquia editorial e navegacao do conteudo.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {posts.length === 0 ? (
            <div className="border border-black/10 bg-[#fbf7f1] p-5 text-sm leading-7 text-black/62">
              Ainda nao ha publicacoes visiveis neste blog.
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${site.subdomain}/${post.slug}`}
                className="block border border-black/10 bg-[#fbf7f1] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,17,17,0.08)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-black">
                    {post.title}
                  </h3>
                  <span className="border border-black/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-black/52">
                    Publicado
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-black/64">
                  {getExcerpt(post.content)}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>

      <aside className="space-y-4 border border-black/12 bg-[#fbf7f1] p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Site
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
            {site.name}
          </h3>
          <p className="mt-2 text-sm leading-7 text-black/62">
            Leitura publica do MVP com foco total no conteudo ja publicado.
          </p>
        </div>

        <div className="space-y-3 border-t border-black/10 pt-4 text-sm leading-7 text-black/65">
          <p>Subdominio: {site.subdomain}</p>
          <p>Idioma: {site.language}</p>
          {posts[0] ? (
            <Link
              href={`/blog/${site.subdomain}/${posts[0].slug}`}
              className="inline-flex text-black underline decoration-black/25 underline-offset-4"
            >
              Abrir a primeira publicacao
            </Link>
          ) : null}
        </div>
      </aside>
    </section>
  );
}
