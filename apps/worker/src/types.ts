import type { Tables, TablesInsert } from "@super/db";
import type { Json } from "@super/db/types";

export type AutomationJobType =
  | "research_topics"
  | "generate_keyword_strategy"
  | "generate_brief"
  | "generate_post"
  | "publish_post";

export type ClaimedJob = Tables<"automation_jobs">;

export type TopicResearchResult = {
  topics: Array<{
    topic: string;
    score?: number;
    source?: string;
  }>;
};

export type KeywordStrategyResult = {
  keywords: Array<{
    keyword: string;
    journey_stage: "top" | "middle" | "bottom";
    priority: "high" | "medium" | "low";
    tail_type: "short" | "long";
    motivation: string;
  }>;
};

export type BriefGenerationResult = {
  title: string;
  angle: string;
  keywords: string[];
};

export type PostGenerationResult = {
  title: string;
  slug: string;
  content: string;
};

export type PublishPostResult = {
  post_id: string;
};

export type JobPayload = {
  tenant_id: string;
  site_id: string | null;
  automation_config_id?: string | null;
  topic_candidate_id?: string | null;
  content_brief_id?: string | null;
  post_id?: string | null;
  business_briefing_id?: string | null;
};

export type JobResultJson = Json;
export type AutomationInsert<T extends keyof TablesInsert<"automation_jobs">> = TablesInsert<"automation_jobs">[T];
