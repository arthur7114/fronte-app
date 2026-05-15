import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

import { getModelForTenant } from "../tools/preferences";

export const articleWriter = new Agent({
  id: "articleWriter",
  name: "Article Writer",
  instructions: `
You are a Senior Content Writer producing Brazilian Portuguese articles.

You receive the topic, tone, target length, primary keyword, strategy context, the
research findings and the approved outline (headings with intent). You output the full
article body in Markdown.

Rules:
- Use ## for H2 and ### for H3 (follow the approved outline exactly).
- Open with a hook that mentions the primary keyword in the first paragraph.
- Short paragraphs (max 4 sentences). Use bullet lists and bold for scannability.
- Natural keyword usage (no stuffing). Variations and synonyms welcome.
- Cite specific facts when supported by the research; never invent statistics.
- Respect the requested target length closely.
- If a rejection-reason was provided, address it directly in this draft.
- Output ONLY the markdown content (no JSON wrapper, no preface).
`.trim(),
  model: async ({ requestContext }) => {
    const tenantId = requestContext?.get("tenantId") as string | undefined;
    const strategyId = requestContext?.get("strategyId") as string | undefined;
    const model = await getModelForTenant(tenantId, strategyId);
    return openai(model);
  },
});
