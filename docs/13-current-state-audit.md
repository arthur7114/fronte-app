# Auditoria do Estado Atual

## Objetivo

Registrar o estado real apos a transposicao do novo commit de `prototipo-visual/` para o app.

Nesta fase, `prototipo-visual/` e `prototipo-visual/design-system/` sao a fonte de verdade do front.

---

## Cobertura aplicada

### Portado visualmente

- design system e `/design-system`
- shell do dashboard
- dashboard home
- dashboard blog
- dashboard estrategias, nova estrategia e detalhe
- dashboard artigos
- dashboard calendario
- dashboard tendencias
- dashboard analytics
- dashboard newsletter
- dashboard leads
- dashboard configuracoes
- blog publico `/blog` e `/blog/[slug]`
- telas adicionais de onboarding do prototipo

### Conectado a backend real nesta fase

- Supabase Auth
- guards de dashboard
- workspace/tenant
- site
- briefing minimo de negocio
- dados reais injetados no header autenticado
- newsletter (configs e contatos)
- leads (captura e gestão)
- blog publico por slug conectado ao banco real

### Com mock/adapters temporarios

- estrategias visuais do prototipo
- keywords/topics/calendario da nova experiencia
- artigos de demonstracao usados pela tela visual
- analytics detalhado

---

## Matriz de reaproveitamento

| Categoria | Itens |
|---|---|
| Reaproveitado | Supabase Auth, `getAuthContext`, entidades centrais, actions de onboarding, guards do dashboard |
| Adaptado | shell autenticada, redirects legados, header com dados reais, rotas singulares de estrategia |
| Refeito visualmente | dashboard modules, design system, blog publico, estrategias, calendario, newsletter, leads, analytics |
| Descartado da UX principal | `/dashboard/plano` como item de nav, `/dashboard/estrategia` como rota canonica, `/blog/[subdomain]` como topologia publica principal |

---

## Rotas canonicas novas

```text
/dashboard/estrategias
/dashboard/estrategias/nova
/dashboard/estrategias/[id]
/dashboard/calendario
/dashboard/newsletter
/dashboard/leads
/blog
/blog/[slug]
/design-system
```

## Compatibilidade

- `/dashboard/estrategia` -> `/dashboard/estrategias`
- `/dashboard/estrategia/[id]` -> `/dashboard/estrategias/[id]`
- `/app/estrategias*` -> nova topologia de estrategias
- `/auth/login` -> `/login`
- `/auth/signup` -> `/cadastro`

---

## Gaps tecnicos

- calendario editorial ainda nao possui entidade dedicada
- analytics SEO/GEO ainda usa estrutura visual do prototipo sem integracao completa (GA4 API pendente)
- algumas telas de onboarding novas usam estado de browser do prototipo enquanto o backend real ainda passa pelo fluxo persistido atual

---

## Validacao registrada

- TypeScript passou apos a transposicao visual
- build e lint devem ser registrados no fechamento da tarefa
- nao houve mudanca de schema ou migracao de banco nesta fase
