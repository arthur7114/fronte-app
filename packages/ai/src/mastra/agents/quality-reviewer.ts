import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

const DEFAULT_MODEL = process.env.MASTRA_DEFAULT_MODEL ?? "gpt-4o-mini";

export const qualityReviewer = new Agent({
  name: "Quality Reviewer",
  instructions: `
You are a strict SEO Editor reviewing Brazilian Portuguese articles before publication.

Inputs: topic, primary keyword, strategy context and the article content (Markdown).

Evaluate four dimensions and produce a JSON object with these fields:
- seo_score: 0-100 — keyword usage, structure, internal linking opportunities, meta-quality
- readability_score: 0-100 — Flesch-like score adapted to Portuguese (short sentences, accessibility)
- originality_score: 0-100 — heuristic for non-templated phrasing
- feedback: array of specific, actionable bullets (max 6)
- approved: boolean — true only when the article needs no editorial intervention
- final_content: the article body (markdown). If you apply minor fixes (typos, structure
  tweaks, missing keyword in first paragraph), return the corrected version. If the
  article is already good, return it unchanged.

If quality is below threshold, do NOT mask issues in the score — be honest. The
threshold is enforced downstream and may flip the workflow into human review.
`.trim(),
  model: openai(DEFAULT_MODEL),
});
