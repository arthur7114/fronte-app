import { createStep, createWorkflow } from "@mastra/core/workflows";
import { RequestContext } from "@mastra/core/request-context";
import { z } from "zod";

import { supabaseDb } from "../tools/supabase";

const OperationMode = z.enum(["manual", "assisted", "automatic"]);

const TopicSchema = z.object({
  topic: z.string(),
  score: z.number().min(0).max(100),
  source: z.string(),
  justification: z.string(),
  journey_stage: z.enum(["awareness", "consideration", "evaluation", "decision"]),
});

const TopicResearchInput = z.object({
  tenantId: z.string().uuid(),
  siteId: z.string().uuid(),
  strategyId: z.string().uuid(),
  topicCount: z.number().min(3).max(30).default(10),
  keywordIds: z.array(z.string().uuid()).optional(),
  scope: z.enum(["all_approved", "selected", "without_topics"]).default("all_approved"),
  operationMode: OperationMode.default("manual"),
});

const HumanFeedback = z
  .object({
    approved: z.boolean(),
    rejectReason: z.string().optional(),
    topicsToKeep: z.array(z.string()).optional(),
  })
  .optional();

const TopicResearchOutput = z.object({
  inserted: z.number(),
  needsApproval: z.boolean(),
});

function tenantCtx(tenantId: string) {
  return new RequestContext([["tenantId", tenantId]]);
}

const generateTopicsStep = createStep({
  id: "generate-topics",
  inputSchema: TopicResearchInput,
  resumeSchema: HumanFeedback,
  outputSchema: TopicResearchInput.extend({ topics: z.array(TopicSchema) }),
  suspendSchema: z.object({
    phase: z.literal("topics"),
    preview: z.array(TopicSchema),
    strategyId: z.string(),
  }),
  execute: async ({ inputData, resumeData, suspend, mastra }) => {
    const briefing = await supabaseDb.getBusinessBriefing(inputData.tenantId);
    const strategy = await supabaseDb.getStrategy(inputData.strategyId, inputData.tenantId);
    const approvedKeywords = await supabaseDb.listKeywords(
      inputData.strategyId,
      inputData.tenantId,
      "approved",
    );

    if (approvedKeywords.length === 0) {
      throw new Error("No approved keywords found for this strategy. Approve keywords first.");
    }

    // Optional narrowing
    const scopedKeywords =
      inputData.scope === "selected" && inputData.keywordIds?.length
        ? approvedKeywords.filter((k) => inputData.keywordIds!.includes((k as { id: string }).id))
        : approvedKeywords;

    const keywordLines = scopedKeywords.slice(0, 30).map((k) => {
      const kw = k as {
        keyword: string;
        journey_stage?: string;
        difficulty?: number;
        search_volume?: string;
        search_intent?: string;
      };
      const parts = [`- "${kw.keyword}"`];
      if (kw.journey_stage) parts.push(`stage=${kw.journey_stage}`);
      if (kw.difficulty != null) parts.push(`diff=${kw.difficulty}`);
      if (kw.search_volume) parts.push(`vol=${kw.search_volume}`);
      if (kw.search_intent) parts.push(`intent=${kw.search_intent}`);
      return parts.join(" | ");
    });

    const briefingLine = briefing
      ? `Business: ${(briefing as { business_name?: string }).business_name ?? ""} — ${(briefing as { segment?: string }).segment ?? ""}`
      : "Business briefing missing.";

    const strategyLines = strategy
      ? [
          `Strategy: ${(strategy as { name?: string }).name ?? "—"}`,
          `Goal: ${(strategy as { goal?: string }).goal ?? "—"}`,
          `Audience: ${(strategy as { audience?: string }).audience ?? "—"}`,
        ]
      : [];

    const negative =
      resumeData?.approved === false && resumeData.rejectReason
        ? `Previous attempt rejected: "${resumeData.rejectReason}". Avoid the same mistake.`
        : "";

    const prompt = [
      briefingLine,
      ...strategyLines,
      "",
      "APPROVED KEYWORDS:",
      ...keywordLines,
      "",
      negative,
      "",
      `Generate exactly ${inputData.topicCount} topics following the agent JSON schema.`,
    ]
      .filter(Boolean)
      .join("\n");

    const agent = mastra.getAgent("topicResearcher");
    const result = await agent.generate(prompt, {
      output: z.object({ topics: z.array(TopicSchema) }),
      requestContext: tenantCtx(inputData.tenantId),
    });

    const topics = result.object.topics;

    if (inputData.operationMode !== "automatic" && !resumeData) {
      await suspend({
        phase: "topics",
        preview: topics,
        strategyId: inputData.strategyId,
      });
    }

    return { ...inputData, topics };
  },
});

const persistTopicsStep = createStep({
  id: "persist-topics",
  inputSchema: TopicResearchInput.extend({ topics: z.array(TopicSchema) }),
  outputSchema: TopicResearchOutput,
  execute: async ({ inputData }) => {
    const now = new Date().toISOString();
    const rows = inputData.topics.map((t) => ({
      tenant_id: inputData.tenantId,
      site_id: inputData.siteId,
      strategy_id: inputData.strategyId,
      topic: t.topic,
      score: t.score,
      source: t.source,
      justification: t.justification,
      journey_stage: t.journey_stage,
      status: inputData.operationMode === "automatic" ? "approved" : "suggested",
      created_at: now,
      updated_at: now,
    }));

    await supabaseDb.insertTopics(rows);
    return { inserted: rows.length, needsApproval: inputData.operationMode !== "automatic" };
  },
});

export const topicResearchWorkflow = createWorkflow({
  id: "topic-research",
  inputSchema: TopicResearchInput,
  outputSchema: TopicResearchOutput,
})
  .then(generateTopicsStep)
  .then(persistTopicsStep)
  .commit();
