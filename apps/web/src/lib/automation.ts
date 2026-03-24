import {
  APP_DEFAULTS,
  AI_MODELS,
  AI_RULE_TYPES as SHARED_AI_RULE_TYPES,
  type AiModel,
  type AiRuleType,
  FREQUENCIES,
  type ContentBriefStatus,
  type Frequency,
  type JobStatus,
  type JobType,
  type TopicCandidateStatus,
} from "@super/shared";
import { SITE_LANGUAGE_OPTIONS } from "@/lib/site";

export const TOPIC_STATUS_LABELS: Record<TopicCandidateStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export const BRIEF_STATUS_LABELS: Record<ContentBriefStatus, string> = {
  pending: "Pendente",
  approved: "Pronto para draft",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  research_topics: "Pesquisa de temas",
  generate_brief: "Geracao de briefing",
  generate_post: "Geracao de rascunho",
  review_post: "Revisao de post",
  schedule_post: "Agendamento",
  publish_post: "Publicacao",
  refresh_content: "Atualizacao de conteudo",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Pendente",
  running: "Em execucao",
  completed: "Concluido",
  failed: "Falhou",
  cancelled: "Cancelado",
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Diaria",
  twice_weekly: "Duas vezes por semana",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
};

export const AI_MODEL_OPTIONS = [...AI_MODELS];
export const AI_RULE_TYPES = [...SHARED_AI_RULE_TYPES];

export const AI_RULE_TYPE_LABELS: Record<AiRuleType, string> = {
  avoid_topic: "Evitar tema",
  tone: "Tom",
  style: "Estilo",
  structure: "Estrutura",
};

function dedupeKeywords(items: string[]) {
  return [...new Set(items)];
}

export function parseKeywordsSeed(input: string) {
  return dedupeKeywords(
    input
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean),
  ).slice(0, 20);
}

export function stringifyKeywordsSeed(keywords: string[] | null | undefined) {
  return (keywords ?? []).join(", ");
}

export function validateAutomationConfigInput(
  keywordsSeedRaw: string,
  language: string,
  frequency: string,
  approvalRequired: boolean,
) {
  const keywordsSeed = parseKeywordsSeed(keywordsSeedRaw);
  const normalizedLanguage = language.trim() || APP_DEFAULTS.language;
  const normalizedFrequency = (frequency.trim() || APP_DEFAULTS.frequency) as Frequency;

  if (!SITE_LANGUAGE_OPTIONS.includes(normalizedLanguage as (typeof SITE_LANGUAGE_OPTIONS)[number])) {
    return {
      ok: false as const,
      error: "Escolha um idioma valido para a automacao.",
    };
  }

  if (!FREQUENCIES.includes(normalizedFrequency)) {
    return {
      ok: false as const,
      error: "Escolha uma frequencia valida para a automacao.",
    };
  }

  return {
    ok: true as const,
    value: {
      keywords_seed: keywordsSeed.length > 0 ? keywordsSeed : null,
      language: normalizedLanguage,
      frequency: normalizedFrequency,
      approval_required: approvalRequired,
    },
  };
}

export function validateAiPreferencesInput(
  toneOfVoice: string,
  writingStyle: string,
  expertiseLevel: string,
  modelInput?: string | null,
) {
  const normalizedTone = toneOfVoice.trim();
  const normalizedStyle = writingStyle.trim();
  const normalizedExpertise = expertiseLevel.trim();
  const normalizedModel = modelInput?.trim() ?? "";

  if (normalizedTone.length > 120) {
    return {
      ok: false as const,
      error: "O tom de voz precisa ter no maximo 120 caracteres.",
    };
  }

  if (normalizedStyle.length > 120) {
    return {
      ok: false as const,
      error: "O estilo de escrita precisa ter no maximo 120 caracteres.",
    };
  }

  if (normalizedExpertise.length > 120) {
    return {
      ok: false as const,
      error: "O nivel de profundidade precisa ter no maximo 120 caracteres.",
    };
  }

  if (normalizedModel && !AI_MODELS.includes(normalizedModel as AiModel)) {
    return {
      ok: false as const,
      error: "Escolha um modelo valido para a IA.",
    };
  }

  return {
    ok: true as const,
    value: {
      tone_of_voice: normalizedTone || null,
      writing_style: normalizedStyle || null,
      expertise_level: normalizedExpertise || null,
      model: normalizedModel ? (normalizedModel as AiModel) : undefined,
    },
  };
}

export function validateAiModelInput(model: string) {
  const normalizedModel = (model.trim() || APP_DEFAULTS.aiModel) as AiModel;

  if (!AI_MODEL_OPTIONS.includes(normalizedModel)) {
    return {
      ok: false as const,
      error: "Escolha um modelo valido para a IA.",
    };
  }

  return {
    ok: true as const,
    value: normalizedModel,
  };
}

function normalizeRuleContent(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseAvoidTopicRules(values: string[]) {
  return [...new Set(
    values
      .map((item) => normalizeRuleContent(item))
      .filter(Boolean),
  )].slice(0, 12);
}

export function validateAiRulesInput(input: {
  avoidTopics: string[];
  tone: string;
  style: string;
  structure: string;
}) {
  const entries: Array<{ rule_type: AiRuleType; content: string }> = [];
  const avoidTopics = parseAvoidTopicRules(input.avoidTopics);
  const singleRules: Array<{ rule_type: AiRuleType; raw: string; max: number }> = [
    { rule_type: "tone", raw: input.tone, max: 180 },
    { rule_type: "style", raw: input.style, max: 180 },
    { rule_type: "structure", raw: input.structure, max: 280 },
  ];

  for (const avoidTopic of avoidTopics) {
    if (avoidTopic.length < 3) {
      return {
        ok: false as const,
        error: "Cada regra de tema a evitar precisa ter pelo menos 3 caracteres.",
      };
    }

    if (avoidTopic.length > 140) {
      return {
        ok: false as const,
        error: "Cada regra de tema a evitar precisa ter no maximo 140 caracteres.",
      };
    }

    entries.push({
      rule_type: "avoid_topic",
      content: avoidTopic,
    });
  }

  for (const rule of singleRules) {
    const content = normalizeRuleContent(rule.raw);

    if (!content) {
      continue;
    }

    if (content.length > rule.max) {
      return {
        ok: false as const,
        error: `A regra de ${AI_RULE_TYPE_LABELS[rule.rule_type].toLowerCase()} precisa ter no maximo ${rule.max} caracteres.`,
      };
    }

    entries.push({
      rule_type: rule.rule_type,
      content,
    });
  }

  return {
    ok: true as const,
    value: {
      rules: entries,
    },
  };
}

export function validateTopicCandidateInput(topic: string) {
  const normalizedTopic = topic.replace(/\s+/g, " ").trim();

  if (normalizedTopic.length < 6) {
    return {
      ok: false as const,
      error: "O tema precisa ter pelo menos 6 caracteres.",
    };
  }

  if (normalizedTopic.length > 180) {
    return {
      ok: false as const,
      error: "O tema precisa ter no maximo 180 caracteres.",
    };
  }

  return {
    ok: true as const,
    value: normalizedTopic,
  };
}
