ALTER TABLE public.strategies
  ADD COLUMN IF NOT EXISTS cadence integer NOT NULL DEFAULT 8;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'strategies_cadence_check'
      AND conrelid = 'public.strategies'::regclass
  ) THEN
    ALTER TABLE public.strategies
      ADD CONSTRAINT strategies_cadence_check
      CHECK (cadence IN (4, 8, 12, 20));
  END IF;
END $$;

COMMENT ON COLUMN public.strategies.cadence IS 'Publication cadence in articles per month.';
