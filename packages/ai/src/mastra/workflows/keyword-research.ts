import { createStep, createWorkflow } from "@mastra/core/workflows";
import { RequestContext } from "@mastra/core/request-context";
import { z } from "zod";

import { supabaseDb } from "../tools/supabase";

const OperationMode = z.enum(["manual", "assisted", "automatic"]);

const KeywordSchema = z.object({
  keyword: z.string(),
  journey_stage: z.enum(["awareness", "consideration", "evaluation", "decision"]),
  priority: z.enum(["high", "medium", "low"]),
  tail_type: z.enum(["short", "long"]),
  difficulty: z.number().min(0).max(100),
  search_volume: z.string(),
  search_intent: z.enum(["informational", "commercial", "transactional", "navigational"]),
  motivation: z.string(),
  estimated_potential: z.string(),
});

const KeywordResearchInput = z.object({
  tenantId: z.string().uuid(),
  siteId: z.string().uuid(),
  strategyId: z.string().uuid(),
  keywordCount: z.number().min(5).max(60).default(20),
  operationMode: OperationMode.default("manual"),
});

const HumanFeedback = z
  .object({
    approved: z.boolean(),
    rejectReason: z.string().optional(),
    keywordsToKeep: z.array(z.string()).optional(),
  })
  .optional();

const KeywordResearchOutput = z.object({
  inserted: z.number(),
  needsApproval: z.boolean(),
});

function tenantCtx(tenantId: string) {
  return new RequestContext([["tenantId", tenantId]]);
}

const generateKeywordsStep = createStep({
  id: "generate-keywords",
  inputSchema: KeywordResearchInput,
  resumeSchema: HumanFeedback,
  outputSchema: KeywordResearchInput.extend({
    keywords: z.array(KeywordSchema),
  }),
  suspendSchema: z.object({
    phase: z.literal("keywords"),
    preview: z.array(KeywordSchema),
    strategyId: z.string(),
  }),
  execute: async ({ inputData, resumeData, suspend, mastra }) => {
    const briefing = await supabaseDb.getBusinessBriefing(inputData.tenantId);
    const strategy = await supabaseDb.getStrategy(inputData.strategyId, inputData.tenantId);

    const briefingLines = briefing
      ? [
          `Business: ${(briefing as { business_name?: string }).business_name ?? "—"}`,
          `Segment: ${(briefing as { segment?: string }).segment ?? "—"}`,
          `Offerings: ${(briefing as { offerings?: string }).offerings ?? "—"}`,
          `Customer profile: ${(briefing as { customer_profile?: string }).customer_profile ?? "—"}`,
        ]
      : ["Business briefing missing."];

    const strategyLines = strategy
      ? [
          `Strategy: ${(strategy as { name?: string }).name ?? "—"}`,
          `Goal: ${(strategy as { goal?: string }).goal ?? "—"}`,
          `Tone: ${(strategy as { tone?: string }).tone ?? "—"}`,
          `Audience: ${(strategy as { audience?: string }).audience ?? "—"}`,
        ]
      : [];

    const negative =
      resumeData?.approved === false && resumeData.rejectReason
        ? `Previous attempt rejected: "${resumeData.rejectReason}". Avoid the same mistake.`
        : "";

    const prompt = [
      ...briefingLines,
      "",
      ...strategyLines,
      "",
      negative,
      "",
      `Generate exactly ${inputData.keywordCount} keywords following the agent JSON schema.`,
    ]
      .filter(Boolean)
      .join("\n");

    const agent = mastra.getAgent("keywordStrategist");
    const result = await agent.generate(prompt, {
      output: z.object({ keywords: z.array(KeywordSchema) }),
      requestContext: tenantCtx(inputData.tenantId),
    });

    const keywords = result.object.keywords;

    if (inputData.operationMode !== "automatic" && !resumeData) {
      await suspend({
        phase: "keywords",
        preview: keywords,
        strategyId: inputData.strategyId,
      });
    }

    return { ...inputData, keywords };
  },
});

const persistKeywordsStep = createStep({
  id: "persist-keywords",
  inputSchema: KeywordResearchInput.extend({ keywords: z.array(KeywordSchema) }),
  outputSchema: KeywordResearchOutput,
  execute: async ({ inputData }) => {
    const now = new Date().toISOString();
    const rows = inputData.keywords.map((k) => ({
      tenant_id: inputData.tenantId,
      site_id: inputData.siteId,
      strategy_id: inputData.strategyId,
      keyword: k.keyword,
      journey_stage: k.journey_stage,
      priority: k.priority,
      tail_type: k.tail_type,
      difficulty: k.difficulty,
      search_volume: k.search_volume,
      search_intent: k.search_intent,
      motivation: k.motivation,
      estimated_potential: k.estimated_potential,
      status: inputData.operationMode === "automatic" ? "approved" : "suggested",
      source: "mastra:keyword-research",
      created_at: now,
      updated_at: now,
    }));

    await supabaseDb.upsertKeywords(rows);
    return { inserted: rows.length, needsApproval: inputData.operationMode !== "automatic" };
  },
});

export const keywordResearchWorkflow = createWorkflow({
  id: "keyword-research",
  inputSchema: KeywordResearchInput,
  outputSchema: KeywordResearchOutput,
})
  .then(generateKeywordsStep)
  .then(persistKeywordsStep)
  .commit();
