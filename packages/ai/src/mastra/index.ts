import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";

import {
  seoResearcher,
  contentStrategist,
  articleWriter,
  qualityReviewer,
} from "./agents/index";
import { createArticleWorkflow } from "./workflows/index";

// Vercel/Lambda filesystem is read-only outside /tmp; default to in-memory so
// the workflow boots in serverless. Set MASTRA_STORAGE_URL to a Turso libsql://
// URL (or file:/tmp/... for ephemeral file storage) for persistence in prod.
const storageUrl = process.env.MASTRA_STORAGE_URL ?? ":memory:";

export const mastra = new Mastra({
  agents: {
    seoResearcher,
    contentStrategist,
    articleWriter,
    qualityReviewer,
  },
  workflows: {
    createArticleWorkflow,
  },
  storage: new LibSQLStore({ id: "super-ai", url: storageUrl }),
  logger: new PinoLogger({ name: "super-ai", level: "info" }),
});

export type SuperMastra = typeof mastra;
