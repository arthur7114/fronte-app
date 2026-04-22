-- Add strategy lineage and scheduling support to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

COMMENT ON COLUMN public.posts.strategy_id IS 'Strategy that originated this post (lineage)';
COMMENT ON COLUMN public.posts.scheduled_for IS 'Scheduled publication date/time';

-- Index for filtering posts by strategy
CREATE INDEX IF NOT EXISTS idx_posts_strategy_id ON public.posts(strategy_id) WHERE strategy_id IS NOT NULL;
