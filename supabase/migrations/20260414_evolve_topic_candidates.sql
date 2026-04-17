-- 20260414_evolve_topic_candidates.sql
-- Evolui a tabela de tópicos para suportar o Plano Editorial (Fase 5)

-- Adiciona novas colunas
alter table public.topic_candidates 
add column if not exists justification text,
add column if not exists keyword_id uuid references public.keyword_candidates(id) on delete set null,
add column if not exists journey_stage text,
add column if not exists scheduled_date timestamptz;

-- Adiciona restrição de journey_stage (consistente com keyword_candidates)
alter table public.topic_candidates 
add constraint topic_candidates_journey_stage_check 
check (journey_stage in ('awareness', 'consideration', 'evaluation', 'decision', 'top', 'middle', 'bottom'));

-- Comentários para documentação
comment on column public.topic_candidates.justification is 'Pauta ou Racional Estratégico gerado pela IA para este tópico';
comment on column public.topic_candidates.keyword_id is 'Referência à palavra-chave que originou este tema';
comment on column public.topic_candidates.journey_stage is 'Estágio da jornada do cliente (awareness, consideration, evaluation, decision)';
comment on column public.topic_candidates.scheduled_date is 'Data sugerida ou agendada para publicação no Plano Editorial';
