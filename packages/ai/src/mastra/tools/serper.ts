import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const SerperResultSchema = z.object({
  position: z.number(),
  title: z.string(),
  link: z.string().url(),
  snippet: z.string(),
});

export type SerperResult = z.infer<typeof SerperResultSchema>;

const SerperOutputSchema = z.object({
  results: z.array(SerperResultSchema),
  query: z.string(),
  fromCache: z.boolean(),
});

/**
 * Wraps a SERP fetch using Serper.dev. Defers HTTP details so the workflow
 * stays agnostic to the cache strategy used by the web app.
 */
export const serpSearchTool = createTool({
  id: "serp-search",
  description: "Fetch top Google results for a query (with 72h cache).",
  inputSchema: z.object({
    query: z.string().min(2),
    tenantId: z.string().uuid().optional(),
    limit: z.number().min(1).max(20).default(10),
  }),
  outputSchema: SerperOutputSchema,
  execute: async ({ context }) => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      return { results: [], query: context.query, fromCache: false };
    }

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: context.query, gl: "br", hl: "pt", num: context.limit }),
    });

    if (!response.ok) {
      return { results: [], query: context.query, fromCache: false };
    }

    const payload = (await response.json()) as { organic?: unknown[] };
    const organic = Array.isArray(payload.organic) ? payload.organic : [];

    const results = organic
      .map((raw, index) => {
        const item = raw as { title?: unknown; link?: unknown; snippet?: unknown; position?: unknown };
        return {
          position: typeof item.position === "number" ? item.position : index + 1,
          title: typeof item.title === "string" ? item.title : "",
          link: typeof item.link === "string" ? item.link : "",
          snippet: typeof item.snippet === "string" ? item.snippet : "",
        };
      })
      .filter((r) => r.title && r.link);

    return { results, query: context.query, fromCache: false };
  },
});
