-- 20260414_refine_keyword_metrics.sql
-- Adiciona campos de métricas de SEO e expande estágios da jornada

-- Adiciona novas colunas
alter table public.keyword_candidates 
add column if not exists difficulty integer check (difficulty >= 0 and difficulty <= 100),
add column if not exists search_volume text,
add column if not exists estimated_potential text;

-- Atualiza restrição de journey_stage para 4 estágios
-- Nota: awareness (consciência), consideration (consideração), evaluation (avaliação), decision (decisão)
alter table public.keyword_candidates 
drop constraint if exists keyword_candidates_journey_stage_check;

alter table public.keyword_candidates 
add constraint keyword_candidates_journey_stage_check 
check (journey_stage in ('awareness', 'consideration', 'evaluation', 'decision', 'top', 'middle', 'bottom'));

-- Comentários para documentação
comment on column public.keyword_candidates.difficulty is 'Dificuldade de rankeamento SEO de 0 a 100';
comment on column public.keyword_candidates.search_volume is 'Volume de busca estimado (ex: 100-500/mês)';
comment on column public.keyword_candidates.estimated_potential is 'Justificativa da IA para o potencial de conversão';
