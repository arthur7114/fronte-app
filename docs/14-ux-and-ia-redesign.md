# UX e Arquitetura de Informacao - Redesign v2.0

> Doc canonico de UX e IA.
> Versao: 2.0 - Abril 2026
> Fonte primaria visual: `prototipo-visual/`

---

## Proposito deste documento

Este documento define a arquitetura de experiencia do produto.

`prototipo-visual/` deve ser tratado como a fonte de verdade para:

- fluxo do usuario
- organizacao das telas
- prioridade de elementos
- arquitetura da experiencia
- navegacao principal
- intencao de uso de cada etapa

Quando houver conflito entre codigo existente, UX antiga, componentes antigos e o prototipo visual, o prototipo prevalece.

---

## Fluxo principal do produto

```text
Login ou Cadastro
  -> Onboarding / workspace
  -> Onboarding / site
  -> Onboarding / briefing
  -> Dashboard
  -> uso recorrente em blog, estrategia, plano, artigos, tendencias, analytics e configuracoes
```

### Etapas e intencao

| Etapa | Intencao |
|------|----------|
| `login` | recuperar acesso rapidamente |
| `cadastro` | ativar a primeira experiencia |
| `onboarding` | criar o workspace |
| `onboarding/site` | criar o primeiro site e canal de publicacao |
| `onboarding/briefing` | capturar o contexto do negocio |
| `dashboard` | mostrar saude do funil e proxima acao |
| `dashboard/estrategia` | listar linhas editoriais do projeto |
| `dashboard/estrategia/[id]` | operar uma estrategia especifica |
| `dashboard/plano` | organizar keywords, topics e calendario no mesmo contexto |
| `dashboard/artigos` | operar producao e revisao editorial |
| `dashboard/blog` | ver preview e configurar o canal |
| `dashboard/tendencias` | explorar novas oportunidades |
| `dashboard/analytics` | ler resultado agregado |
| `dashboard/configuracoes` | concentrar preferencias e infraestrutura do workspace |

---

## Entidades e hierarquia de experiencia

```text
CONTA
  -> WORKSPACE / PROJETO
    -> SITE / BLOG
    -> BRIEFING DE NEGOCIO
    -> ESTRATEGIAS
      -> KEYWORDS
      -> TOPICS
      -> ARTIGOS
      -> RESULTADOS

TENDENCIAS e ANALYTICS aparecem como visoes globais do workspace
```

### Regra critica

Projeto e estrategia continuam separados.

| Entidade | Papel |
|----------|------|
| Projeto / workspace | contexto do negocio, site e configuracoes |
| Estrategia | foco editorial especifico dentro do projeto |

`Estrategia` continua multi-strategy no modelo e na UX:

- `/dashboard/estrategia` mostra cards de estrategias
- `/dashboard/estrategia/[id]` abre a experiencia detalhada da estrategia selecionada

---

## Navegacao principal canonica

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

### O que sai da navegacao principal

| Item | Decisao |
|------|---------|
| Aprovacoes | sai da nav principal |
| Jobs | sai da nav principal |
| Perfil do Negocio | deixa de existir como item principal isolado |
| Configuracoes fragmentadas | substituidas por pagina unica com secoes |

---

## Estrutura das telas

### Dashboard

Objetivo: responder "o que precisa acontecer agora?".

Deve priorizar:

- estado atual do pipeline
- indicadores rapidos
- proximas acoes
- atalhos para plano e artigos

### Meu Blog

Objetivo: concentrar canal de publicacao e ajustes do site.

Deve combinar:

- preview do blog
- contexto de template/tema
- configuracao do site
- acessos rapidos para publicar ou ajustar estrutura

### Estrategia

Objetivo: mostrar todas as estrategias do workspace e facilitar a entrada em uma delas.

Elementos esperados:

- cards por estrategia
- nome
- foco
- status
- modo operacional
- acesso direto ao detalhe

### Estrategia detalhe

Objetivo: operar a estrategia escolhida sem sair do contexto dela.

Elementos esperados:

- contexto e resumo lateral
- proxima acao estrategica
- acesso ao aprofundamento em keywords, topics e artigos
- leitura de progresso da estrategia

### Plano de Conteudo

Objetivo: unificar planejamento editorial.

Abas canonicas:

- `keywords`
- `topics`
- `calendar`

Comportamento:

- aceita visao global
- aceita filtro opcional por `strategy`

### Artigos

Objetivo: operar a producao editorial real.

Deve concentrar:

- lista global de artigos
- filtros por status
- criacao
- edicao
- revisao

### Tendencias

Objetivo: transformar sinal externo em oportunidade editorial.

### Analytics

Objetivo: mostrar leitura consolidada de performance.

Quando metricas nao estiverem disponiveis, a interface deve usar estados vazios ou indisponiveis, nunca dados ficticios como fonte canonica.

### Configuracoes

Objetivo: unificar preferencias do workspace em um unico lugar.

Secoes canonicas:

- `account`
- `workspace`
- `site`
- `automation`
- `ai`

---

## Regras de UX obrigatorias

- uma unica shell autenticada para a experiencia principal
- o backend atual so pode ser reaproveitado quando nao contradiz o prototipo
- componentes existentes devem ser adaptados ao fluxo novo, nao o fluxo novo aos componentes antigos
- quando faltar detalhamento comportamental no prototipo, completar com boas praticas coerentes com a intencao visual
- dados reais sao prioritarios
- estado vazio e melhor do que mock enganoso

---

## Terminologia padrao

| Evitar | Usar |
|--------|------|
| `/auth/*` e `/app/*` como linguagem principal do produto | rotas canonicas `/login`, `/cadastro` e `/dashboard/*` |
| Modulos tecnicos como `Jobs` e `Automação` na navegacao | linguagem orientada a produto |
| Configuracoes espalhadas | `Configuracoes` com secoes |
| Navegacao por arquitetura | navegacao por tarefa e fluxo |

---

## Sitemap canonico

```text
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

### Compatibilidade

Rotas legadas com equivalente continuam existindo apenas como redirect.

`/app/aprovacoes` e `/app/jobs` permanecem temporariamente fora da navegacao principal.

---

## Historico de versoes

| Versao | Data | Mudanca |
|--------|------|---------|
| 1.0 | 2026-04-14 | redesign inicial |
| 1.1 | 2026-04-14 | refinamentos de UX e IA |
| 2.0 | 2026-04-16 | `prototipo-visual/` promovido a fonte de verdade e migracao da experiencia principal para rotas canonicas `/dashboard/*` |
