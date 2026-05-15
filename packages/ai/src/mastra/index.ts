import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";

import {
  seoResearcher,
  contentStrategist,
  articleWriter,
  qualityReviewer,
} from "./agents/index.js";
import { createArticleWorkflow } from "./workflows/index.js";

const storageUrl = process.env.MASTRA_STORAGE_URL ?? "file:./mastra.db";

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
  storage: new LibSQLStore({ url: storageUrl }),
  logger: new PinoLogger({ name: "super-ai", level: "info" }),
});

export type SuperMastra = typeof mastra;
