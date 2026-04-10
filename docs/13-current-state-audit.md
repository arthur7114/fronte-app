# Auditoria do Estado Atual

## Objetivo

Registrar o que o codigo atual ja entrega contra o MVP descrito nos docs canonicos.

Este arquivo existe para orientar a proxima implementacao pelo metodo `JTBD + GSD`, sem depender da memoria da conversa.

---

## Resumo executivo

O app ja tem uma base funcional relevante:

- autenticacao por Supabase no cliente
- onboarding de workspace
- criacao e edicao do primeiro site
- painel autenticado
- CMS basico de posts
- blog publico por subdominio em rota interna
- configuracao de automacao editorial
- fila de jobs por tenant
- worker para `research_topics`, `generate_brief`, `generate_post` e `publish_post`

O principal gap de produto nao e infraestrutura. O gap e a camada de ativacao estrategica:

- ainda nao existe briefing guiado do negocio
- ainda nao existe entidade explicita para briefing de negocio/projeto
- a estrategia comeca por `keywords_seed`, nao por contexto completo do usuario leigo
- nao ha plano editorial estruturado separado de topics/briefs/posts
- analytics, tendencias, planos e integracoes ainda nao aparecem como produto implementado

---

## Mapa por fase

## Fase 1 - Ativacao inicial

Status: parcialmente implementada.

Ja existe:

- tela de signup/login em `apps/web/src/components/auth-form.tsx`
- criacao de tenant/workspace em `apps/web/src/app/onboarding/actions.ts`
- criacao do primeiro site em `apps/web/src/app/app/site/actions.ts`
- redirecionamento por estado de usuario, membership e site

Falta ou precisa validar:

- validacao real ponta a ponta com Supabase configurado
- experiencia de ativacao orientada ao job do usuario, nao so workspace/site
- captura de contexto do negocio no onboarding

Conclusao:

Fase 1 tem fundacao tecnica, mas ainda nao entrega o primeiro valor estrategico do produto.

---

## Fase 2 - Blog minimo publicavel

Status: parcialmente implementada.

Ja existe:

- entidade `sites` com nome, idioma, subdominio e tema
- CMS basico de posts em `/app/posts`
- editor com rascunho, revisao, aprovacao, rejeicao, agendamento e publicacao
- blog publico em `/blog/[subdomain]`
- pagina publica de post em `/blog/[subdomain]/[postSlug]`
- job `publish_post` para publicacao agendada

Falta ou precisa validar:

- selecao real de template pelo usuario
- personalizacao visual alem do tema padrao
- custom domain ou subdominio externo como fluxo completo
- meta description no post, exigida pelos docs de conteudo

Conclusao:

Fase 2 ja tem uma base usavel para CMS e blog publico, mas ainda nao cobre template como decisao de produto.

---

## Fase 3 - Briefing com IA

Status: nao implementada como produto.

Ja existe:

- configuracao editorial com `keywords_seed`, idioma, frequencia e aprovacao obrigatoria
- preferencias de IA com tom, estilo, expertise e modelo
- prompts para gerar temas, briefings de conteudo e posts

Falta:

- fluxo conversacional de briefing do negocio
- campos de negocio: nome, segmento, servicos/produtos, clientes, localizacao, palavras desejadas, motivo e concorrentes
- entidade persistida para briefing consolidado
- edicao e revisao desse briefing
- uso do briefing de negocio como insumo antes de gerar estrategia

Conclusao:

Esta e a proxima entrega mais importante. Sem ela, o produto depende de um usuario leigo ja saber informar keywords boas.

---

## Fase 4 - Estrategia de palavras e jornada

Status: parcialmente implementada no pipeline, mas nao no produto final.

Ja existe:

- `research_topics` gera candidatos de tema a partir de keywords seed
- topics podem ser aprovados, editados ou rejeitados
- topics aprovados geram briefings de conteudo

Falta:

- entidade de keyword strategy
- dificuldade relativa
- potencial estimado
- prioridade explicita
- classificacao por jornada: conhecimento, atracao, avaliacao e decisao
- classificacao short tail e long tail

Conclusao:

O pipeline ja sugere temas, mas ainda nao entrega a estrategia didatica prometida para usuario leigo.

---

## Fase 5 - Plano editorial

Status: nao implementada como modulo separado.

Ja existe:

- topics
- content briefs
- drafts gerados a partir de briefs

Falta:

- plano editorial semanal
- plano editorial mensal
- pauta como entidade editavel antes do artigo
- justificativa por pauta
- aprovacao do plano antes da producao

Conclusao:

O app pula de topic para brief/post. Ainda falta a camada de planejamento editorial.

---

## Fase 6 - Producao e publicacao de artigos

Status: parcialmente implementada.

Ja existe:

- worker gera posts em draft a partir de content briefs
- editor permite salvar, revisar, aprovar, rejeitar, agendar e publicar
- posts publicados aparecem no blog

Falta:

- meta description
- faixa de tamanho de artigo
- upload de referencias em texto e PDF
- modo automatico como preferencia completa de produto
- revisao mais rica de artigo gerado

Conclusao:

A espinha dorsal existe, mas ainda falta completar campos editoriais importantes do MVP.

---

## Fase 7 - Tendencias

Status: nao implementada.

Falta:

- analise semanal
- sinais gerais
- sinais por nicho
- sinais por localizacao
- conversao de tendencia em pauta

---

## Fase 8 - Analytics e planos

Status: nao implementada como produto.

Ja existe:

- campo `plan` em `tenants`

Falta:

- tracking basico
- CTR
- ranking medio
- cliques em CTA
- SEO vs GEO
- limites por plano
- integracoes GA, GTM, Meta Pixel e CAPI

---

## Proxima entrega recomendada

Conectar o briefing do negocio a estrategia inicial de keywords.

### JTBD

Quando meu briefing do negocio ja esta salvo,
eu quero que a plataforma use esse contexto para sugerir keywords e temas,
para nao depender apenas das palavras que eu souber informar manualmente.

### Menor entrega util

Usar o briefing salvo como insumo da configuracao de automacao e da pesquisa inicial de temas.

### Escopo da proxima entrega

- preencher keywords seed a partir do briefing quando fizer sentido
- exibir contexto do briefing na tela de automacao
- preparar o worker para considerar o resumo do briefing nos prompts
- manter edicao manual de keywords

### Fora desta entrega

- classificar jornada
- gerar plano editorial
- upload de PDFs
- analytics

---

## Implementacao registrada apos a auditoria

O briefing do negocio foi implementado como primeira entrega de ativacao estrategica.

Arquivos principais:

- `supabase/migrations/20260410_create_business_briefings.sql`
- `apps/web/src/app/app/briefing/page.tsx`
- `apps/web/src/app/app/briefing/actions.ts`
- `apps/web/src/components/business-briefing-panel.tsx`
- `apps/web/src/lib/business-briefing.ts`
- `apps/web/src/lib/business-briefing-data.ts`

Resultado:

- briefing persistido por tenant
- campos essenciais do MVP capturados
- resumo simples consolidado
- edicao manual no app
- status visivel no overview

Validacao:

- `npm run build` passou
- `npm run lint` nao passou por problemas preexistentes: worker sem `eslint.config.*`, usos antigos de `any`, efeitos com `setState` sincrono em componentes ja existentes e ajustes menores de lint

---

## Validacao feita nesta auditoria

- leitura de rotas do app web
- leitura de actions de onboarding, site, posts e automacao
- leitura do worker de jobs
- leitura dos tipos Supabase gerados
- busca por entidades e termos de produto relevantes

Nao foram executados testes automatizados porque esta etapa produziu auditoria e atualizacao de docs, sem mudar comportamento do app.
