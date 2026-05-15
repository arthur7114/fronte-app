-- Per-strategy AI overrides and operational knobs for the Mastra pipeline.
-- Defaults still come from ai_preferences / ai_rules at the tenant level.

alter table public.strategies
  add column if not exists quality_threshold integer default 70
    check (quality_threshold between 0 and 100),
  add column if not exists ai_model_override text,
  add column if not exists tone_override text,
  add column if not exists audience_override text,
  add column if not exists auto_paused_reason text;

comment on column public.strategies.quality_threshold is
  'Minimum SEO score (0-100) for the article workflow to auto-publish in automatic mode. Below this, the workflow suspends for human review.';
comment on column public.strategies.ai_model_override is
  'Per-strategy override for the OpenAI model id. NULL falls back to ai_preferences.model.';
comment on column public.strategies.tone_override is
  'Per-strategy override for tone of voice. NULL falls back to ai_preferences.tone_of_voice.';
comment on column public.strategies.audience_override is
  'Per-strategy override for target audience description. NULL falls back to strategy.audience.';
comment on column public.strategies.auto_paused_reason is
  'When automatic mode pauses itself (e.g. quality drift, budget exceeded), this stores the reason. NULL means active.';
