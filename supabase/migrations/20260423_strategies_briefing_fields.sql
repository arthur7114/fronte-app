-- Add missing briefing fields to strategies
ALTER TABLE strategies
  ADD COLUMN IF NOT EXISTS persona         TEXT,
  ADD COLUMN IF NOT EXISTS differentiators TEXT,
  ADD COLUMN IF NOT EXISTS cta_text        TEXT,
  ADD COLUMN IF NOT EXISTS cta_link        TEXT,
  ADD COLUMN IF NOT EXISTS restrictions    TEXT;

COMMENT ON COLUMN strategies.persona         IS 'Descrição da persona principal (complementa audience)';
COMMENT ON COLUMN strategies.differentiators IS 'Diferenciais e provas sociais do negócio';
COMMENT ON COLUMN strategies.cta_text        IS 'Texto do CTA padrão dos artigos';
COMMENT ON COLUMN strategies.cta_link        IS 'Link de destino do CTA padrão';
COMMENT ON COLUMN strategies.restrictions    IS 'Assuntos, abordagens ou formatos a evitar';
