import type { Tables } from "@super/db";

function formatRules(rules: Tables<"ai_rules">[]) {
  if (rules.length === 0) {
    return "Editorial rules: none.";
  }

  return [
    "Editorial rules:",
    ...rules.map((rule) => `- ${rule.rule_type}: ${rule.content}`),
  ].join("\n");
}

export function buildResearchPrompt(
  config: Tables<"automation_configs">,
  site: Tables<"sites">,
  briefing: Tables<"business_briefings"> | null | undefined
) {
  const lines = [
    `Tenant site: ${site.name}`,
    `Language: ${config.language}`,
  ];

  if (briefing) {
    if (briefing.segment) lines.push(`Business Segment: ${briefing.segment}`);
    if (briefing.customer_profile) lines.push(`Target Audience: ${briefing.customer_profile}`);
    if (briefing.offerings) lines.push(`Products/Services: ${briefing.offerings}`);
    if (Array.isArray(briefing.desired_keywords) && briefing.desired_keywords.length > 0) {
      lines.push(`Desired Keywords: ${briefing.desired_keywords.join(", ")}`);
    }
  }

  lines.push(`Seed keywords: ${(config.keywords_seed ?? []).join(", ") || "none"}`);
  lines.push(`Return 5 concise topic ideas in Portuguese BR considering the business context.`);
  return lines.join("\n");
}

export function buildBriefPrompt(
  topic: Tables<"topic_candidates">,
  preferences: Tables<"ai_preferences"> | null,
  rules: Tables<"ai_rules">[],
) {
  return [
    `Topic: ${topic.topic}`,
    `Preferences tone: ${preferences?.tone_of_voice ?? "not provided"}`,
    `Writing style: ${preferences?.writing_style ?? "not provided"}`,
    `Expertise level: ${preferences?.expertise_level ?? "not provided"}`,
    formatRules(rules),
    `Return title, keywords and angle in JSON.`,
  ].join("\n");
}

export function buildPostPrompt(
  brief: Tables<"content_briefs">,
  preferences: Tables<"ai_preferences"> | null,
  rules: Tables<"ai_rules">[],
) {
  return [
    `Brief topic: ${brief.topic}`,
    `Brief angle: ${brief.angle ?? ""}`,
    `Brief keywords: ${(brief.keywords ?? []).join(", ") || "none"}`,
    `Tone: ${preferences?.tone_of_voice ?? "not provided"}`,
    `Style: ${preferences?.writing_style ?? "not provided"}`,
    `Expertise: ${preferences?.expertise_level ?? "not provided"}`,
    formatRules(rules),
    `Return title, slug suggestion and content paragraphs in JSON.`,
  ].join("\n");
}

export function buildKeywordStrategyPrompt(briefing: Tables<"business_briefings">) {
  const lines = [
    "VOCÊ É UM ESPECIALISTA EM SEO E ESTRATÉGIA DE CONTEÚDO.",
    "GERAR ESTRATÉGIA DE PALAVRAS-CHAVE PARA O SEGUINTE NEGÓCIO:",
    `Nome: ${briefing.business_name}`,
    `Segmento: ${briefing.segment}`,
    `Ofertas/Produtos: ${briefing.offerings}`,
    `Público-alvo: ${briefing.customer_profile}`,
  ];

  if (briefing.location) lines.push(`Localização: ${briefing.location}`);
  if (Array.isArray(briefing.desired_keywords) && briefing.desired_keywords.length > 0) {
    lines.push(`Keywords desejadas (sementes): ${briefing.desired_keywords.join(", ")}`);
  }
  if (briefing.keyword_motivation) lines.push(`Motivação: ${briefing.keyword_motivation}`);
  if (Array.isArray(briefing.competitors) && briefing.competitors.length > 0) {
    lines.push(`Concorrentes: ${briefing.competitors.join(", ")}`);
  }

  lines.push(
    "",
    "INSTRUÇÕES:",
    "1. Gere entre 30 e 50 palavras-chave relevantes.",
    "2. Cubra tanto 'Short Tail' (termos genéricos) quanto 'Long Tail' (termos específicos e variações).",
    "3. Classifique cada palavra por:",
    "   - journey_stage: 'top' (consciência), 'middle' (consideração/solução), 'bottom' (decisão de compra).",
    "   - priority: 'high', 'medium', 'low' baseado no potencial de conversão para este negócio.",
    "   - tail_type: 'short' ou 'long'.",
    "4. Forneça uma 'motivation' curta explicando por que essa palavra é estratégica.",
    "5. Retorne APENAS um JSON válido seguindo este formato:",
    '{ "keywords": [{ "keyword": "exemplo", "journey_stage": "top", "priority": "high", "tail_type": "long", "motivation": "explicação" }] }'
  );

  return lines.join("\n");
}
