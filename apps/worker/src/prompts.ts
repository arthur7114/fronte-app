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
