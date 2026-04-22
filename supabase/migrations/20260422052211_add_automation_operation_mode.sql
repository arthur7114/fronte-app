ALTER TABLE public.automation_configs
  ADD COLUMN IF NOT EXISTS operation_mode text NOT NULL DEFAULT 'assisted';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'automation_configs_operation_mode_check'
      AND conrelid = 'public.automation_configs'::regclass
  ) THEN
    ALTER TABLE public.automation_configs
      ADD CONSTRAINT automation_configs_operation_mode_check
      CHECK (operation_mode IN ('manual', 'assisted', 'automatic'));
  END IF;
END $$;

COMMENT ON COLUMN public.automation_configs.operation_mode IS 'Workspace automation mode: manual, assisted, or automatic.';
