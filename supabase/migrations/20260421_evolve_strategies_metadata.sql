-- ============================================================
-- 20260421_evolve_strategies_metadata.sql
-- Evolution of strategies table to support prototype rich UI fields
-- Adds description, type, tone, audience, goal and color.
-- Preserves focus and operation_mode.
-- ============================================================

ALTER TABLE public.strategies 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS strategy_type text DEFAULT 'seo',
  ADD COLUMN IF NOT EXISTS tone text,
  ADD COLUMN IF NOT EXISTS audience text,
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS color text;

-- Mapear os focus antigos para goal caso exista, para ser visualizado sem quebrar layout?
UPDATE public.strategies
SET goal = focus
WHERE goal IS NULL AND focus IS NOT NULL;

-- Comentários das novas colunas
COMMENT ON COLUMN public.strategies.description IS 'Descrição geral da estratégia, mais abrangente que focus ou goal';
COMMENT ON COLUMN public.strategies.strategy_type IS 'O tipo / categoria visual (seo, local, blog, conversao)';
COMMENT ON COLUMN public.strategies.tone IS 'O tom de voz específico da estratégia, sobrescrevendo globals';
COMMENT ON COLUMN public.strategies.audience IS 'Público ou persona em mente';
COMMENT ON COLUMN public.strategies.goal IS 'O objetivo final (mapeando ou derivando de focus)';
COMMENT ON COLUMN public.strategies.color IS 'Accent/Cor a exibir na UI';
