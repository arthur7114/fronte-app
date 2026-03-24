import { AI_MODELS, APP_DEFAULTS, type AiModel } from "@super/shared";

export function resolveAiModel(input: string | null | undefined): AiModel {
  if (input && AI_MODELS.includes(input as AiModel)) {
    return input as AiModel;
  }

  return APP_DEFAULTS.aiModel;
}

export const WORKER_DEFAULTS = {
  pollLimit: 3,
  openAiModel: resolveAiModel(process.env.OPENAI_MODEL),
  maxAttempts: APP_DEFAULTS.maxJobAttempts,
} as const;
