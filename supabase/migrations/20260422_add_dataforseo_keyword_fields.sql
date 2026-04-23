-- DataForSEO real metrics columns (distinct from AI-estimated search_volume text)
ALTER TABLE keyword_candidates
  ADD COLUMN IF NOT EXISTS search_volume_int integer,
  ADD COLUMN IF NOT EXISTS cpc decimal(10,4),
  ADD COLUMN IF NOT EXISTS competition_level text,
  ADD COLUMN IF NOT EXISTS search_intent text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'ai';

-- Defaults for NOT NULL columns that lack them (allows API route to insert without these fields)
ALTER TABLE keyword_candidates
  ALTER COLUMN journey_stage SET DEFAULT 'awareness',
  ALTER COLUMN priority SET DEFAULT 'medium',
  ALTER COLUMN tail_type SET DEFAULT 'long';

-- Partial unique index so the upsert onConflict("strategy_id,keyword") works in the API route
CREATE UNIQUE INDEX IF NOT EXISTS keyword_candidates_strategy_keyword_uniq
  ON keyword_candidates (strategy_id, keyword)
  WHERE strategy_id IS NOT NULL;

COMMENT ON COLUMN keyword_candidates.search_volume IS 'AI-estimated volume range, e.g. "100-500/mês"';
COMMENT ON COLUMN keyword_candidates.search_volume_int IS 'Real search volume from DataForSEO (integer)';
COMMENT ON COLUMN keyword_candidates.source IS 'Origin: ai | dataforseo';
