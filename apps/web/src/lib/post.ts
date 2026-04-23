import type { PostStatus } from "@super/shared";

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Rascunho",
  in_review: "Em aprovacao",
  approved: "Aprovado",
  generating: "Gerando",
  queued: "Na fila",
  scheduled: "Agendado",
  publishing: "Publicando",
  published: "Publicado",
  failed: "Falhou",
  rejected: "Rejeitado",
};

export function normalizePostSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validatePostInput(title: string, slug: string, content: string) {
  const trimmedTitle = title.trim();
  const normalizedSlug = normalizePostSlug(slug);
  const normalizedContent = content.replace(/\r\n/g, "\n").trim();

  if (trimmedTitle.length < 3) {
    return {
      ok: false as const,
      error: "O titulo precisa ter pelo menos 3 caracteres.",
    };
  }

  if (normalizedSlug.length < 3 || normalizedSlug.length > 80) {
    return {
      ok: false as const,
      error: "O slug precisa ter entre 3 e 80 caracteres.",
    };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
    return {
      ok: false as const,
      error: "Use apenas letras minusculas, numeros e hifens no slug do post.",
    };
  }

  return {
    ok: true as const,
    value: {
      title: trimmedTitle,
      slug: normalizedSlug,
      content: normalizedContent,
    },
  };
}
