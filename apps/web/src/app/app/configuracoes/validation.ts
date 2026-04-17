import type { AiRuleType } from "@super/shared";
import { AI_RULE_TYPES } from "@super/shared";

export function normalizeWorkspaceSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateAiRuleInput(ruleType: string, content: string) {
  const normalizedRuleType = ruleType.trim();
  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (!AI_RULE_TYPES.includes(normalizedRuleType as AiRuleType)) {
    return {
      ok: false as const,
      error: "Escolha um tipo de regra valido.",
    };
  }

  if (normalizedContent.length < 3) {
    return {
      ok: false as const,
      error: "A regra precisa ter pelo menos 3 caracteres.",
    };
  }

  if (normalizedContent.length > 180) {
    return {
      ok: false as const,
      error: "A regra precisa ter no maximo 180 caracteres.",
    };
  }

  return {
    ok: true as const,
    value: {
      rule_type: normalizedRuleType as AiRuleType,
      content: normalizedContent,
    },
  };
}

export function validateWorkspaceInput(name: string, slug: string) {
  const trimmedName = name.trim();
  const normalizedSlug = normalizeWorkspaceSlug(slug);

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
