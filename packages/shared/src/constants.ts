/**
 * Application name — configurable via environment variable.
 */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Super";

/**
 * Default values used throughout the application.
 */
export const APP_DEFAULTS = {
    language: "pt-BR",
    frequency: "weekly",
    maxJobAttempts: 3,
    plan: "free",
    aiModel: "gpt-5.4-mini",
} as const;

/**
 * User roles within a tenant.
 */
export type UserRole = "owner" | "admin" | "editor";

export const USER_ROLES: readonly UserRole[] = ["owner", "admin", "editor"] as const;

/**
 * Post editorial status.
 */
export type PostStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "rejected";

export const POST_STATUSES: readonly PostStatus[] = [
    "draft",
    "in_review",
    "approved",
    "scheduled",
    "published",
    "rejected",
] as const;

/**
 * Topic candidate moderation status.
 */
export type TopicCandidateStatus = "pending" | "approved" | "rejected";

export const TOPIC_CANDIDATE_STATUSES: readonly TopicCandidateStatus[] = [
    "pending",
    "approved",
    "rejected",
] as const;

/**
 * Content brief lifecycle status.
 */
export type ContentBriefStatus = "pending" | "approved";

export const CONTENT_BRIEF_STATUSES: readonly ContentBriefStatus[] = [
    "pending",
    "approved",
] as const;

/**
 * Supported AI models in the MVP.
 */
export type AiModel =
    | "gpt-4.1-nano"
    | "gpt-4.1-mini"
    | "gpt-4.1"
    | "gpt-5.4-nano"
    | "gpt-5.4-mini"
    | "gpt-5.4";

export const AI_MODELS: readonly AiModel[] = [
    "gpt-4.1-nano",
    "gpt-4.1-mini",
    "gpt-4.1",
    "gpt-5.4-nano",
    "gpt-5.4-mini",
    "gpt-5.4",
] as const;

/**
 * Guided AI rule presets exposed in the MVP.
 */
export type AiRuleType = "avoid_topic" | "tone" | "style" | "structure";

export const AI_RULE_TYPES: readonly AiRuleType[] = [
    "avoid_topic",
    "tone",
    "style",
    "structure",
] as const;

/**
 * Automation job types.
 */
export type JobType =
    | "research_topics"
    | "generate_brief"
    | "generate_post"
    | "review_post"
    | "schedule_post"
    | "publish_post"
    | "refresh_content";

export const JOB_TYPES: readonly JobType[] = [
    "research_topics",
    "generate_brief",
    "generate_post",
    "review_post",
    "schedule_post",
    "publish_post",
    "refresh_content",
] as const;

/**
 * Job execution status.
 */
export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export const JOB_STATUSES: readonly JobStatus[] = [
    "pending",
    "running",
    "completed",
    "failed",
    "cancelled",
] as const;

/**
 * Automation frequency options.
 */
export type Frequency = "daily" | "twice_weekly" | "weekly" | "biweekly" | "monthly";

export const FREQUENCIES: readonly Frequency[] = [
    "daily",
    "twice_weekly",
    "weekly",
    "biweekly",
    "monthly",
] as const;
