# Arquitetura de Informacao, Telas e Fluxos

> Versao: 3.0 - Abril 2026
> Fonte de verdade visual: `prototipo-visual/`
> Fonte de verdade de UX/IA: `docs/14-ux-and-ia-redesign.md`

---

## Principio central

O produto deve ser lido pelo fluxo:

```text
Conta -> Workspace -> Site -> Briefing -> Dashboard -> Operacao recorrente
```

Na camada recorrente, a navegacao principal e organizada por produto:

```text
Dashboard
Meu Blog
Estrategia
Plano de Conteudo
Artigos
Tendencias
Analytics
Configuracoes
```

---

## Fluxos principais

### Fluxo de ativacao

1. usuario acessa `/login` ou `/cadastro`
2. sistema direciona para `/onboarding`
3. usuario cria o workspace
4. usuario cria o primeiro site em `/onboarding/site`
5. usuario preenche o briefing em `/onboarding/briefing`
6. sistema entra em `/dashboard`

### Fluxo recorrente

1. usuario entra em `/dashboard`
2. identifica pendencias e proximas acoes
3. navega para `Estrategia`, `Plano de Conteudo`, `Artigos`, `Meu Blog`, `Tendencias`, `Analytics` ou `Configuracoes`

### Fluxo de estrategia

1. usuario entra em `/dashboard/estrategia`
2. escolhe uma estrategia existente ou cria uma nova
3. acessa `/dashboard/estrategia/[id]`
4. aprofunda a execucao usando `Plano de Conteudo` e `Artigos`

---

## Arvore de rotas canonica

```text
/
  -> redireciona para /login, /onboarding ou /dashboard conforme sessao e estado

/login
/cadastro

/onboarding
/onboarding/site
/onboarding/briefing

/dashboard
  /blog
  /estrategia
    /[id]
  /plano
  /artigos
    /novo
    /[id]
  /tendencias
  /analytics
  /configuracoes
```

### Politica de compatibilidade de rotas

Rotas antigas em `/auth/*` e `/app/*` com equivalente funcional continuam existindo como redirects para as rotas canonicas.

Exemplos:

- `/auth/login` -> `/login`
- `/auth/signup` -> `/cadastro`
- `/app/dashboard` -> `/dashboard`
- `/app/blog` -> `/dashboard/blog`
- `/app/estrategias/[id]/keywords` -> `/dashboard/plano?strategy=<id>&tab=keywords`

---

## Shell autenticada

Toda a experiencia principal acontece dentro de uma shell unica de dashboard.

### Objetivos da shell

- manter navegacao lateral consistente
- reduzir dispersao entre telas
- preservar contexto do workspace e do site
- permitir operacao e configuracao no mesmo espaco

### Itens de navegacao

| Item | Rota |
|------|------|
| Dashboard | `/dashboard` |
| Meu Blog | `/dashboard/blog` |
| Estrategia | `/dashboard/estrategia` |
| Plano de Conteudo | `/dashboard/plano` |
| Artigos | `/dashboard/artigos` |
| Tendencias | `/dashboard/tendencias` |
| Analytics | `/dashboard/analytics` |
| Configuracoes | `/dashboard/configuracoes` |

### Removidos da navegacao principal

| Item | Motivo |
|------|--------|
| Aprovacoes | sai da navegação principal; responsabilidades redistribuidas |
| Jobs | tecnico, mantido apenas como legado acessivel por URL |
| Perfil do Negocio | absorvido por Estrategia e Configuracoes |

---

## Estrutura por tela

### `/dashboard`

- orientacao de proxima acao
- indicadores rapidos
- atalhos para plano e artigos
- leitura resumida de pipeline

### `/dashboard/blog`

- preview do blog
- contexto do site atual
- configuracao do canal

### `/dashboard/estrategia`

- lista de estrategias em cards
- criacao de nova estrategia
- entrada para o detalhe

### `/dashboard/estrategia/[id]`

- contexto da estrategia
- resumo lateral
- acoes para evolucao da estrategia

### `/dashboard/plano`

- abas `keywords`, `topics` e `calendar`
- visao global ou filtrada por `strategy`

### `/dashboard/artigos`

- board/lista global
- filtros por status
- criacao e edicao

### `/dashboard/tendencias`

- oportunidades e sinais externos

### `/dashboard/analytics`

- leitura agregada de performance

### `/dashboard/configuracoes`

- secoes internas `account`, `workspace`, `site`, `automation` e `ai`

---

## Regras de implementacao derivadas da IA

- `prototipo-visual/` manda no fluxo e na organizacao de telas
- reaproveitamento e desejavel, mas subordinado ao prototipo
- comportamento legado so permanece se nao distorcer o fluxo novo
- o usuario deve perceber uma experiencia unica, mesmo com reaproveitamento interno
