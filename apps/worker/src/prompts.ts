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
  briefing: Tables<"business_briefings"> | null | undefined,
  approvedKeywords: Tables<"keyword_candidates">[]
) {
  const lines = [
    "VOCÊ É UM EDITOR-CHEFE E ESPECIALISTA EM ESTRATÉGIA DE CONTEÚDO.",
    `Tenant site: ${site.name}`,
    `Language: ${config.language}`,
  ];

  if (briefing) {
    if (briefing.segment) lines.push(`Business Segment: ${briefing.segment}`);
    if (briefing.customer_profile) lines.push(`Target Audience: ${briefing.customer_profile}`);
    if (briefing.offerings) lines.push(`Products/Services: ${briefing.offerings}`);
  }

  if (approvedKeywords.length > 0) {
    lines.push(
      "",
      "PALAVRAS-CHAVE APROVADAS (ESTRATÉGIA):",
      ...approvedKeywords.map(k => `- ${k.keyword} (Jornada: ${(k as any).journey_stage}, Volume: ${(k as any).search_volume})`)

    );
  } else {
    lines.push(`Seed keywords: ${(config.keywords_seed ?? []).join(", ") || "none"}`);
  }

  lines.push(
    "",
    "INSTRUÇÕES PARA O PLANO EDITORIAL:",
    "1. Gere tópicos de conteúdo (títulos de posts) EXCLUSIVAMENTE focados nas palavras-chave aprovadas acima ou no contexto do negócio.",
    "2. Para cada tópico, forneça um 'justification' (Racional Estratégico) explicando por que este post ajudará no ROI e qual o objetivo dele.",
    "3. Classifique cada tópico com o 'journey_stage' mais adequado: awareness, consideration, evaluation, decision.",
    "4. Retorne APENAS um JSON válido seguindo este formato:",
    '{ "topics": [{ "topic": "string", "score": number, "source": "string", "justification": "string", "journey_stage": "string" }] }'
  );

  return lines.join("\n");
}

export function buildBriefPrompt(
  topic: Tables<"topic_candidates">,
  preferences: Tables<"ai_preferences"> | null,
  rules: Tables<"ai_rules">[],
) {
  return [
    "VOCÊ É UM ESTRATEGISTA DE CONTEÚDO SÊNIOR.",
    `Objetivo do Tema: ${topic.topic}`,
    `Racional Estratégico (Pauta): ${(topic as any).justification ?? "Não fornecido"}`,
    `Estágio da Jornada: ${(topic as any).journey_stage ?? "awareness"}`,

    "",
    "DIRETRIZES DE MARCA:",
    `Tom de voz: ${preferences?.tone_of_voice ?? "Profissional e acolhedor"}`,
    `Estilo de escrita: ${preferences?.writing_style ?? "Direto e informativo"}`,
    `Nível de expertise: ${preferences?.expertise_level ?? "Especialista"}`,
    formatRules(rules),
    "",
    "INSTRUÇÕES:",
    "1. Desenvolva um Briefing (título otimizado, ângulo narrativo e palavras-chave secundárias).",
    "2. O Ângulo ('angle') deve seguir estritamente o Racional Estratégico e o Estágio da Jornada fornecidos.",
    "3. Refine a justificativa e o estágio se necessário para o contexto do briefing.",
    "4. Retorne em JSON:",
    '{ "title": "string", "angle": "string", "keywords": ["string"], "justification": "string", "journey_stage": "string" }',
  ].join("\n");
}


export function buildPostPrompt(
  brief: Tables<"content_briefs">,
  preferences: Tables<"ai_preferences"> | null,
  rules: Tables<"ai_rules">[],
) {
  return [
    "VOCÊ É UM REDATOR DE ELITE ESPECIALISTA EM SEO E CONVERSÃO.",
    `Título do Briefing: ${brief.topic}`,
    `Ângulo de Escrita: ${brief.angle ?? ""}`,
    `Palavras-chave: ${(brief.keywords ?? []).join(", ") || "none"}`,
    `Racional Estratégico: ${(brief as any).justification ?? "Não fornecido"}`,
    `Estágio da Jornada: ${(brief as any).journey_stage ?? "awareness"}`,

    "",
    "CONFIGURAÇÕES DE MARCA:",
    `Tom: ${preferences?.tone_of_voice ?? "Profissional"}`,
    `Estilo: ${preferences?.writing_style ?? "Informativo"}`,
    `Expertise: ${preferences?.expertise_level ?? "Especialista"}`,
    formatRules(rules),
    "",
    "REQUISITOS DO ARTIGO:",
    "1. Crie um post de blog completo, altamente engajador e otimizado para SEO.",
    "2. O conteúdo deve HONRAR o Racional Estratégico e ser adequado ao Estágio da Jornada (ex: posts de 'evaluation' devem ser mais analíticos).",
    "3. Use formatação Markdown (headings, listas, negrito).",
    "4. Retorne em JSON:",
    '{ "title": "string", "slug": "string", "content": "string" }',
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
    "   - journey_stage: 'awareness' (topo/consciência), 'consideration' (meio/consideração), 'evaluation' (comparação/avaliação), 'decision' (fundo/decisão).",
    "   - priority: 'high', 'medium', 'low' baseado no potencial de conversão para este negócio.",
    "   - tail_type: 'short' ou 'long'.",
    "   - difficulty: um número de 0 a 100 indicando a dificuldade de rankeamento (SEO Difficulty).",
    "   - search_volume: uma estimativa amigável de volume (ex: 'Alto', 'Médio', 'Baixo' ou faixas numéricas).",
    "4. Forneça uma 'motivation' curta explicando o contexto estratégico.",
    "5. Forneça um 'estimated_potential' detalhando por que esta palavra pode trazer ROI para o cliente.",
    "6. Retorne APENAS um JSON válido seguindo este formato:",
    '{ "keywords": [{ "keyword": "string", "journey_stage": "awareness|consideration|evaluation|decision", "priority": "high|medium|low", "tail_type": "short|long", "difficulty": number, "search_volume": "string", "motivation": "string", "estimated_potential": "string" }] }'
  );

  return lines.join("\n");
}
