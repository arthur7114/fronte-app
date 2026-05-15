import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

import { getModelForTenant } from "../tools/preferences";

export const contentStrategist = new Agent({
  id: "contentStrategist",
  name: "Content Strategist",
  instructions: `
You are an expert SEO Content Strategist writing in Brazilian Portuguese.

Inputs you receive: a topic, brand tone, target length, audience, goal, business briefing,
strategy context, additional instructions and the research findings produced upstream.

Outputs you must produce (as JSON):
- title: catchy, <70 chars, includes primary keyword when natural
- meta_description: 140-160 chars, includes primary keyword, action-oriented
- headings: ordered list of H2/H3 with brief intent statement for each

Constraints:
- Scannable structure (H2 every 200-300 words, sub-H3 only when needed)
- Cover the gaps surfaced by research
- Reflect the strategy tone and audience
- If a rejection-reason was provided, incorporate the correction (do not repeat the mistake)
`.trim(),
  model: async ({ requestContext }) => {
    const tenantId = requestContext?.get("tenantId") as string | undefined;
    const strategyId = requestContext?.get("strategyId") as string | undefined;
    const model = await getModelForTenant(tenantId, strategyId);
    return openai(model);
  },
});
