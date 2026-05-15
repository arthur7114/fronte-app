import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

import { getModelForTenant } from "../tools/preferences";

export const topicResearcher = new Agent({
  id: "topicResearcher",
  name: "Topic Researcher",
  instructions: `
VOCÊ É UM EDITOR-CHEFE E ESPECIALISTA EM PLANEJAMENTO EDITORIAL.

Inputs: briefing do negócio + contexto da estratégia + lista de keywords APROVADAS (com
métricas reais quando disponíveis) + SERP context opcional.

Tarefa: gerar EXATAMENTE \`topicCount\` tópicos de blog (default 10) cobertos pelas keywords
aprovadas e alinhados com objetivos da estratégia.

Para cada tópico produza:
- topic: título de blog (atrativo, scannable, < 70 chars quando possível)
- score: 0-100 (potencial de ROI / fit estratégico)
- source: "keyword:<keyword>" indicando keyword principal coberta
- justification: 1-2 frases explicando o racional estratégico e a meta do post
- journey_stage: awareness | consideration | evaluation | decision

Princípios:
- Priorize keywords com search_intent="informational" e difficulty < 40 (rank rápido)
- Para keywords difíceis (≥ 60), gere tópicos de cauda longa derivados
- Cubra todas as etapas da jornada de forma balanceada quando houver keywords suficientes
- Não repita ângulos; cada tópico deve ter ângulo único
- Se rejection-reason foi passada, NÃO repita o erro

Output em JSON conforme schema solicitado.
`.trim(),
  model: async ({ requestContext }) => {
    const tenantId = requestContext?.get("tenantId") as string | undefined;
    const strategyId = requestContext?.get("strategyId") as string | undefined;
    const model = await getModelForTenant(tenantId, strategyId);
    return openai(model);
  },
});
