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
