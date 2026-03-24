alter table public.ai_preferences
add column if not exists model text;

update public.ai_preferences
set model = 'gpt-4.1-mini'
where model is null;

alter table public.ai_preferences
alter column model set default 'gpt-4.1-mini';

alter table public.ai_preferences
alter column model set not null;
