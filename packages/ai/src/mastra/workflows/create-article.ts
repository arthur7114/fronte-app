import { createStep, createWorkflow } from "@mastra/core/workflows";
import { RequestContext } from "@mastra/core/request-context";
import { z } from "zod";

import { supabaseDb } from "../tools/supabase";

/**
 * Build a Mastra RequestContext carrying the tenantId so each agent's
 * dynamic model resolver can read `ai_preferences.model` for the right tenant.
 */
function tenantCtx(tenantId: string, strategyId?: string | null) {
  const entries: Array<[string, string]> = [["tenantId", tenantId]];
  if (strategyId) entries.push(["strategyId", strategyId]);
  return new RequestContext(entries);
}

// ----------------------------------------------------------------------
// Schemas
// ----------------------------------------------------------------------

const OperationMode = z.enum(["manual", "assisted", "automatic"]);

const KeywordDataSchema = z.object({
  keyword: z.string(),
  search_volume: z.number(),
  volume_tier: z.string(),
  keyword_difficulty: z.number(),
  difficulty_tier: z.string(),
  cpc: z.number(),
  competition_level: z.string(),
  search_intent: z.string(),
});

const ResearchResultSchema = z.object({
  queries: z.array(z.string()),
  key_findings: z.array(z.string()),
  competitor_outlines: z.array(z.string()),
  keyword_data: z
    .object({
      primary: KeywordDataSchema.nullable(),
      suggestions: z.array(KeywordDataSchema),
    })
    .optional(),
});

const StructureResultSchema = z.object({
  title: z.string(),
  meta_description: z.string(),
  headings: z.array(z.object({ level: z.number(), text: z.string(), intent: z.string() })),
});

const WriteResultSchema = z.object({
  content: z.string(),
});

const ReviewResultSchema = z.object({
  seo_score: z.number().min(0).max(100),
  readability_score: z.number().min(0).max(100),
  originality_score: z.number().min(0).max(100).optional(),
  feedback: z.array(z.string()),
  approved: z.boolean(),
  final_content: z.string(),
});

const WorkflowInputSchema = z.object({
  generationId: z.string().uuid(),
  tenantId: z.string().uuid(),
  postId: z.string().uuid(),
  strategyId: z.string().uuid().nullable(),
  topic: z.string(),
  primaryKeyword: z.string().nullable(),
  tone: z.string(),
  targetLength: z.string(),
  additionalInstructions: z.string().nullable(),
  operationMode: OperationMode.default("manual"),
  qualityThreshold: z.number().min(0).max(100).default(70),
});

const StepBaseSchema = WorkflowInputSchema.extend({
  research: ResearchResultSchema.nullable().default(null),
  structure: StructureResultSchema.nullable().default(null),
  draft: WriteResultSchema.nullable().default(null),
  review: ReviewResultSchema.nullable().default(null),
});

const HumanFeedbackSchema = z.object({
  approved: z.boolean(),
  rejectReason: z.string().optional(),
  edits: z
    .object({
      title: z.string().optional(),
      meta_description: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),
});

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function shouldSuspendAfterResearch(mode: z.infer<typeof OperationMode>) {
  return mode === "manual";
}

function shouldSuspendAfterStructure(mode: z.infer<typeof OperationMode>) {
  return mode !== "automatic";
}

function shouldSuspendBeforePublish(
  mode: z.infer<typeof OperationMode>,
  reviewScore: number,
  qualityThreshold: number,
) {
  if (mode === "manual") return true;
  if (mode === "assisted") return true;
  // automatic: only suspend when quality is below threshold (fallback to HITL)
  return reviewScore < qualityThreshold;
}

function rejectionContext(resumeData?: z.infer<typeof HumanFeedbackSchema>) {
  if (resumeData?.approved === false && resumeData.rejectReason) {
    return `Previous attempt was rejected by the editor with this reason: "${resumeData.rejectReason}". Address it directly in the new output.`;
  }
  return "";
}

// ----------------------------------------------------------------------
// Step 1: Research
// ----------------------------------------------------------------------

const researchStep = createStep({
  id: "research",
  inputSchema: WorkflowInputSchema,
  resumeSchema: HumanFeedbackSchema.optional(),
  outputSchema: StepBaseSchema,
  suspendSchema: z.object({
    phase: z.literal("research"),
    preview: ResearchResultSchema,
    generationId: z.string(),
    postId: z.string(),
  }),
  execute: async ({ inputData, resumeData, suspend, mastra }) => {
    const existing = (await supabaseDb.getGeneration(
      inputData.generationId,
      inputData.tenantId,
    )) as { research_result?: z.infer<typeof ResearchResultSchema> | null } | null;

    let research = existing?.research_result ?? null;

    if (!research || resumeData?.approved === false) {
      const agent = mastra.getAgent("seoResearcher");
      const negative = rejectionContext(resumeData);

      const prompt = [
        `Topic: ${inputData.topic}`,
        `Primary keyword: ${inputData.primaryKeyword ?? "N/A"}`,
        `Tone: ${inputData.tone}`,
        `Target length: ${inputData.targetLength}`,
        inputData.additionalInstructions ? `Additional instructions: ${inputData.additionalInstructions}` : null,
        negative || null,
        "",
        "Produce a structured research report including: queries to run, key_findings, competitor_outlines.",
      ]
        .filter(Boolean)
        .join("\n");

      const result = await agent.generate(prompt, {
        output: ResearchResultSchema,
        requestContext: tenantCtx(inputData.tenantId, inputData.strategyId),
      });

      research = result.object;
      await supabaseDb.updateGeneration(inputData.generationId, {
        phase: "research",
        research_result: research,
        updated_at: new Date().toISOString(),
      });
    }

    if (shouldSuspendAfterResearch(inputData.operationMode) && !resumeData) {
      await suspend({
        phase: "research",
        preview: research,
        generationId: inputData.generationId,
        postId: inputData.postId,
      });
    }

    return {
      ...inputData,
      research,
      structure: null,
      draft: null,
      review: null,
    };
  },
});

// ----------------------------------------------------------------------
// Step 2: Structure (brief / outline)
// ----------------------------------------------------------------------

const structureStep = createStep({
  id: "structure",
  inputSchema: StepBaseSchema,
  resumeSchema: HumanFeedbackSchema.optional(),
  outputSchema: StepBaseSchema,
  suspendSchema: z.object({
    phase: z.literal("structure"),
    preview: StructureResultSchema,
    generationId: z.string(),
    postId: z.string(),
  }),
  execute: async ({ inputData, resumeData, suspend, mastra }) => {
    const generation = (await supabaseDb.getGeneration(
      inputData.generationId,
      inputData.tenantId,
    )) as { structure_result?: z.infer<typeof StructureResultSchema> | null } | null;

    let structure = generation?.structure_result ?? null;

    if (!structure || resumeData?.approved === false) {
      const agent = mastra.getAgent("contentStrategist");
      const negative = rejectionContext(resumeData);

      const prompt = [
        `Topic: ${inputData.topic}`,
        `Tone: ${inputData.tone}`,
        `Target length: ${inputData.targetLength}`,
        inputData.additionalInstructions ? `Additional instructions: ${inputData.additionalInstructions}` : null,
        negative || null,
        "",
        "Research findings:",
        JSON.stringify(inputData.research),
        "",
        "Output a JSON object with: title, meta_description, headings.",
      ]
        .filter(Boolean)
        .join("\n");

      const result = await agent.generate(prompt, {
        output: StructureResultSchema,
        requestContext: tenantCtx(inputData.tenantId, inputData.strategyId),
      });
      structure = result.object;

      await supabaseDb.updateGeneration(inputData.generationId, {
        phase: "structure",
        structure_result: structure,
        updated_at: new Date().toISOString(),
      });

      await supabaseDb.updatePost(inputData.postId, inputData.tenantId, {
        title: structure.title,
        meta_title: structure.title,
        meta_description: structure.meta_description,
        updated_at: new Date().toISOString(),
      });
    }

    if (shouldSuspendAfterStructure(inputData.operationMode) && !resumeData) {
      await suspend({
        phase: "structure",
        preview: structure,
        generationId: inputData.generationId,
        postId: inputData.postId,
      });
    }

    // Apply human edits if provided
    if (resumeData?.edits) {
      structure = {
        ...structure,
        title: resumeData.edits.title ?? structure.title,
        meta_description: resumeData.edits.meta_description ?? structure.meta_description,
      };
      await supabaseDb.updateGeneration(inputData.generationId, {
        structure_result: structure,
        updated_at: new Date().toISOString(),
      });
      await supabaseDb.updatePost(inputData.postId, inputData.tenantId, {
        title: structure.title,
        meta_title: structure.title,
        meta_description: structure.meta_description,
        updated_at: new Date().toISOString(),
      });
    }

    return { ...inputData, structure };
  },
});

// ----------------------------------------------------------------------
// Step 3: Write (draft)
// ----------------------------------------------------------------------

const writeStep = createStep({
  id: "write",
  inputSchema: StepBaseSchema,
  outputSchema: StepBaseSchema,
  execute: async ({ inputData, mastra }) => {
    const generation = (await supabaseDb.getGeneration(
      inputData.generationId,
      inputData.tenantId,
    )) as { write_result?: z.infer<typeof WriteResultSchema> | null } | null;

    let draft = generation?.write_result ?? null;

    if (!draft) {
      const agent = mastra.getAgent("articleWriter");

      const prompt = [
        `Topic: ${inputData.topic}`,
        `Tone: ${inputData.tone}`,
        `Target length: ${inputData.targetLength}`,
        `Primary keyword: ${inputData.primaryKeyword ?? "N/A"}`,
        inputData.additionalInstructions ? `Additional instructions: ${inputData.additionalInstructions}` : null,
        "",
        "Outline (follow exactly):",
        JSON.stringify(inputData.structure),
        "",
        "Output ONLY the article body in Markdown.",
      ]
        .filter(Boolean)
        .join("\n");

      const result = await agent.generate(prompt, {
        output: WriteResultSchema,
        requestContext: tenantCtx(inputData.tenantId, inputData.strategyId),
      });
      draft = result.object;

      await supabaseDb.updateGeneration(inputData.generationId, {
        phase: "write",
        write_result: draft,
        updated_at: new Date().toISOString(),
      });

      await supabaseDb.updatePost(inputData.postId, inputData.tenantId, {
        content: draft.content,
        updated_at: new Date().toISOString(),
      });
    }

    return { ...inputData, draft };
  },
});

// ----------------------------------------------------------------------
// Step 4: Review
// ----------------------------------------------------------------------

const reviewStep = createStep({
  id: "review",
  inputSchema: StepBaseSchema,
  resumeSchema: HumanFeedbackSchema.optional(),
  outputSchema: StepBaseSchema,
  suspendSchema: z.object({
    phase: z.literal("review"),
    preview: ReviewResultSchema,
    generationId: z.string(),
    postId: z.string(),
    belowThreshold: z.boolean(),
  }),
  execute: async ({ inputData, resumeData, suspend, mastra }) => {
    const generation = (await supabaseDb.getGeneration(
      inputData.generationId,
      inputData.tenantId,
    )) as { review_result?: z.infer<typeof ReviewResultSchema> | null } | null;

    let review = generation?.review_result ?? null;

    if (!review) {
      const agent = mastra.getAgent("qualityReviewer");

      const prompt = [
        `Topic: ${inputData.topic}`,
        `Primary keyword: ${inputData.primaryKeyword ?? "N/A"}`,
        `Tone: ${inputData.tone}`,
        "",
        "Article content (Markdown):",
        inputData.draft?.content ?? "",
        "",
        "Return the JSON schema (seo_score, readability_score, originality_score, feedback, approved, final_content).",
      ].join("\n");

      const result = await agent.generate(prompt, {
        output: ReviewResultSchema,
        requestContext: tenantCtx(inputData.tenantId, inputData.strategyId),
      });
      review = result.object;

      await supabaseDb.updateGeneration(inputData.generationId, {
        phase: "review",
        review_result: review,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await supabaseDb.updatePost(inputData.postId, inputData.tenantId, {
        content: review.final_content,
        seo_score: review.seo_score,
        status: "draft",
        updated_at: new Date().toISOString(),
      });
    }

    const below = review.seo_score < inputData.qualityThreshold;
    const needsSuspend = shouldSuspendBeforePublish(inputData.operationMode, review.seo_score, inputData.qualityThreshold);

    if (needsSuspend && !resumeData) {
      await suspend({
        phase: "review",
        preview: review,
        generationId: inputData.generationId,
        postId: inputData.postId,
        belowThreshold: below,
      });
    }

    // Apply human edits if provided
    if (resumeData?.edits?.content) {
      review = { ...review, final_content: resumeData.edits.content };
      await supabaseDb.updatePost(inputData.postId, inputData.tenantId, {
        content: resumeData.edits.content,
        updated_at: new Date().toISOString(),
      });
    }

    return { ...inputData, review };
  },
});

// ----------------------------------------------------------------------
// Step 5: Schedule / publish
// ----------------------------------------------------------------------

const scheduleStep = createStep({
  id: "schedule",
  inputSchema: StepBaseSchema,
  outputSchema: z.object({
    postId: z.string(),
    generationId: z.string(),
    finalStatus: z.enum(["draft", "scheduled", "published"]),
    seoScore: z.number(),
  }),
  execute: async ({ inputData }) => {
    // In manual / assisted modes the workflow lands the post as "draft" and
    // the user moves it forward from the editor UI. In automatic mode we
    // promote it to "scheduled" so pg_cron handles the actual publish.
    const target = inputData.operationMode === "automatic" ? "scheduled" : "draft";

    if (target === "scheduled") {
      const scheduledFor = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await supabaseDb.updatePost(inputData.postId, inputData.tenantId, {
        status: "scheduled",
        scheduled_for: scheduledFor,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    await supabaseDb.updateGeneration(inputData.generationId, {
      phase: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      postId: inputData.postId,
      generationId: inputData.generationId,
      finalStatus: target,
      seoScore: inputData.review?.seo_score ?? 0,
    };
  },
});

// ----------------------------------------------------------------------
// Workflow
// ----------------------------------------------------------------------

export const createArticleWorkflow = createWorkflow({
  id: "create-article",
  inputSchema: WorkflowInputSchema,
  outputSchema: z.object({
    postId: z.string(),
    generationId: z.string(),
    finalStatus: z.enum(["draft", "scheduled", "published"]),
    seoScore: z.number(),
  }),
})
  .then(researchStep)
  .then(structureStep)
  .then(writeStep)
  .then(reviewStep)
  .then(scheduleStep)
  .commit();
