-- Article generation pipeline table
CREATE TABLE IF NOT EXISTS article_generations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  strategy_id            UUID REFERENCES strategies(id) ON DELETE SET NULL,
  post_id                UUID REFERENCES posts(id) ON DELETE SET NULL,
  topic                  TEXT NOT NULL,
  primary_keyword        TEXT,
  tone                   TEXT,
  target_length          TEXT,
  additional_instructions TEXT,
  phase                  TEXT NOT NULL DEFAULT 'briefing'
                           CHECK (phase IN ('briefing','research','structure','write','review','completed','failed')),
  research_result        JSONB,
  structure_result       JSONB,
  write_result           JSONB,
  review_result          JSONB,
  started_at             TIMESTAMPTZ DEFAULT NOW(),
  completed_at           TIMESTAMPTZ,
  error_message          TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_generations_tenant_id  ON article_generations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_article_generations_post_id    ON article_generations (post_id);
CREATE INDEX IF NOT EXISTS idx_article_generations_strategy_id ON article_generations (strategy_id);
CREATE INDEX IF NOT EXISTS idx_article_generations_phase      ON article_generations (phase);

-- RLS
ALTER TABLE article_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON article_generations
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- updated_at trigger (reuse existing helper if present, else create)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_article_generations_updated_at ON article_generations;
CREATE TRIGGER trg_article_generations_updated_at
  BEFORE UPDATE ON article_generations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- New columns on posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS generation_id UUID REFERENCES article_generations(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_score     INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approved_at   TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approved_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_generation_id ON posts (generation_id);
