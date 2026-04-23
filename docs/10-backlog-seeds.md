# Backlog Inicial Sugerido

## Épico 1 — Autenticação e conta
- criar fluxo de cadastro e login
- criar onboarding inicial de conta
- permitir criação do primeiro projeto

## Épico 2 — Blog
- listar templates de blog
- permitir seleção de template
- permitir personalização básica
- configurar domínio ou subdomínio
- publicar blog com CMS próprio básico

## Épico 3 — Briefing com IA
- criar fluxo conversacional de onboarding
- salvar briefing consolidado
- permitir revisão e edição do briefing

## Épico 4 — Estratégia de conteúdo
- receber palavras iniciais do usuário
- gerar palavras adicionais
- classificar por prioridade
- classificar por estágio da jornada
- classificar por short tail e long tail

## Épico 5 — Plano editorial
- transformar palavras aprovadas em pautas
- justificar sugestões
- gerar calendário semanal
- gerar calendário mensal
- permitir edição e aprovação

## Épico 6 — Produção de artigos
- configurar estilo e tamanho (`tone`, `target_length` via modal de geração)
- gerar artigo via pipeline de 4 fases: research (SERP + DataForSEO) → structure → write → review
- pipeline persistido em `article_generations` com progresso por `phase`
- geração em lote a partir de tópicos aprovados (`bulk-generate`)
- editar rascunho em `article-editor` com SEO score e checklist vindos do `review_result`
- aprovar ou reprovar; agendar publicação via `scheduled_for`
- publicar automaticamente via pg_cron quando `scheduled_for` vencer
- modo de operação controlado por `workspace.operation_mode` (manual/assisted/automatic)

## Épico 7 — Tendências
- rodar análise semanal
- capturar sinais gerais
- capturar sinais por nicho
- capturar sinais por localização
- transformar insight em pauta

## Épico 8 — Analytics
- consolidar tracking básico
- mostrar tráfego orgânico
- mostrar CTR
- mostrar ranking médio
- mostrar top e low performers
- mostrar cliques em CTA
- separar visão SEO e GEO

## Épico 9 — Planos e limites
- definir plano atual da conta
- limitar volume de artigos
- limitar funcionalidades por plano
- bloquear ou promover upgrade quando necessário

## Épico 10 — Integrações
- integrar Google Analytics
- integrar GTM
- integrar Meta Pixel
- integrar Meta Conversions API
