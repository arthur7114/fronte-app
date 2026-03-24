import { APP_DEFAULTS } from "@super/shared";

export const SITE_LANGUAGE_OPTIONS = ["pt-BR", "en-US", "es-ES"] as const;
export const DEFAULT_SITE_THEME_ID = "starter";

export function normalizeSiteSubdomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateSiteInput(name: string, language: string, subdomain: string) {
  const trimmedName = name.trim();
  const normalizedSubdomain = normalizeSiteSubdomain(subdomain);
  const normalizedLanguage = language.trim() || APP_DEFAULTS.language;

  if (trimmedName.length < 2) {
    return {
      ok: false as const,
      error: "O nome do blog precisa ter pelo menos 2 caracteres.",
    };
  }

  if (normalizedSubdomain.length < 3 || normalizedSubdomain.length > 40) {
    return {
      ok: false as const,
      error: "O subdominio precisa ter entre 3 e 40 caracteres.",
    };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSubdomain)) {
    return {
      ok: false as const,
      error: "Use apenas letras minusculas, numeros e hifens no subdominio.",
    };
  }

  if (!SITE_LANGUAGE_OPTIONS.includes(normalizedLanguage as (typeof SITE_LANGUAGE_OPTIONS)[number])) {
    return {
      ok: false as const,
      error: "Escolha um idioma valido para o blog.",
    };
  }

  return {
    ok: true as const,
    value: {
      name: trimmedName,
      language: normalizedLanguage,
      subdomain: normalizedSubdomain,
    },
  };
}
