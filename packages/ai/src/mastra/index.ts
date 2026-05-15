import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PostgresStore } from "@mastra/pg";
import { PinoLogger } from "@mastra/loggers";

import {
  seoResearcher,
  contentStrategist,
  articleWriter,
  qualityReviewer,
  keywordStrategist,
  topicResearcher,
} from "./agents/index";
import {
  createArticleWorkflow,
  keywordResearchWorkflow,
  topicResearchWorkflow,
  publishWorkflow,
} from "./workflows/index";

/**
 * Storage resolution:
 *
 *   1. If MASTRA_STORAGE_URL is set, use it directly (libsql:// or postgres://).
 *   2. Otherwise, if DATABASE_URL is set, route Mastra state into the same
 *      Postgres (Supabase) cluster that holds the rest of the app. Mastra
 *      provisions its own tables (`mastra_*`) on first boot.
 *   3. Otherwise, fall back to LibSQL in-memory (works for unit tests and
 *      short-lived synchronous workflows; HITL suspend/resume across requests
 *      will lose state).
 */
const storageId = "super-ai";
const explicit = process.env.MASTRA_STORAGE_URL;
const databaseUrl = process.env.DATABASE_URL;

const storage = explicit?.startsWith("postgres")
  ? new PostgresStore({ id: storageId, connectionString: explicit })
  : explicit?.startsWith("libsql") || explicit?.startsWith("file:")
    ? new LibSQLStore({ id: storageId, url: explicit })
    : databaseUrl
      ? new PostgresStore({ id: storageId, connectionString: databaseUrl })
      : new LibSQLStore({ id: storageId, url: ":memory:" });

export const mastra = new Mastra({
  agents: {
    seoResearcher,
    contentStrategist,
    articleWriter,
    qualityReviewer,
    keywordStrategist,
    topicResearcher,
  },
  workflows: {
    createArticleWorkflow,
    keywordResearchWorkflow,
    topicResearchWorkflow,
    publishWorkflow,
  },
  storage,
  logger: new PinoLogger({ name: "super-ai", level: "info" }),
});

export type SuperMastra = typeof mastra;
