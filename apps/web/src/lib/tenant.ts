export function normalizeTenantSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateTenantInput(name: string, slug: string) {
  const trimmedName = name.trim();
  const normalizedSlug = normalizeTenantSlug(slug);

  if (trimmedName.length < 2) {
    return {
      ok: false as const,
      error: "O nome do espaco de trabalho precisa ter pelo menos 2 caracteres.",
    };
  }

  if (normalizedSlug.length < 3 || normalizedSlug.length > 40) {
    return {
      ok: false as const,
      error: "O slug precisa ter entre 3 e 40 caracteres.",
    };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
    return {
      ok: false as const,
      error: "Use apenas letras minusculas, numeros e hifens no slug.",
    };
  }

  return {
    ok: true as const,
    value: {
      name: trimmedName,
      slug: normalizedSlug,
    },
  };
}
