alter table public.ai_preferences
  alter column model set default 'gpt-5.4-mini';

update public.ai_preferences
set model = 'gpt-5.4-mini'
where model is null;
