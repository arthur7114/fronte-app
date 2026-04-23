-- Fase 7: Automacao de publicacao agendada via pg_cron + pg_net + Edge Function

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

-- Adiciona status intermediario para evitar duplo disparo, preservando estados editoriais legados.
ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_status_check
    CHECK (
      status IN (
        'draft',
        'in_review',
        'approved',
        'rejected',
        'generating',
        'queued',
        'scheduled',
        'publishing',
        'published',
        'failed'
      )
    );

DROP FUNCTION IF EXISTS public.trigger_scheduled_posts_publish();

-- Funcao chamada pelo cron: detecta posts vencidos e despacha para a Edge Function.
CREATE OR REPLACE FUNCTION private.trigger_scheduled_posts_publish()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  post_row RECORD;
  functions_url text;
  service_role_key text;
BEGIN
  functions_url := NULLIF(current_setting('app.supabase_functions_url', true), '');
  service_role_key := NULLIF(current_setting('app.service_role_key', true), '');

  IF functions_url IS NULL OR service_role_key IS NULL THEN
    RAISE EXCEPTION 'Missing app.supabase_functions_url or app.service_role_key database setting';
  END IF;

  FOR post_row IN
    SELECT id, tenant_id
    FROM public.posts
    WHERE status = 'scheduled'
      AND scheduled_for <= NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.posts
    SET
      status = 'publishing',
      updated_at = NOW()
    WHERE id = post_row.id
      AND status = 'scheduled';

    PERFORM net.http_post(
      url     := rtrim(functions_url, '/') || '/publish-scheduled-posts',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body    := jsonb_build_object(
        'post_id',   post_row.id,
        'tenant_id', post_row.tenant_id
      ),
      timeout_milliseconds := 10000
    );
  END LOOP;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'publish-scheduled-posts') THEN
    PERFORM cron.unschedule('publish-scheduled-posts');
  END IF;
END;
$$;

-- Registra o job de cron (roda a cada minuto).
SELECT cron.schedule(
  'publish-scheduled-posts',
  '* * * * *',
  'SELECT private.trigger_scheduled_posts_publish()'
);
