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

export function buildResearchPrompt(config: Tables<"automation_configs">, site: Tables<"sites">) {
  return [
    `Tenant site: ${site.name}`,
    `Language: ${config.language}`,
    `Seed keywords: ${(config.keywords_seed ?? []).join(", ") || "none"}`,
    `Return 5 concise topic ideas in Portuguese BR.`,
  ].join("\n");
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
