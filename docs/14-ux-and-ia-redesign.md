# UX e Arquitetura de Informação — Redesign v1.1

> Doc canônico de IA/UX do produto.
> Versão: 1.1 · Abril 2026
> Origem: revisão completa de produto baseada em PRD + auditoria do estado atual + refinamento do Product Owner.

---

## Propósito deste documento

Este documento é a **fonte de verdade de UX e arquitetura de informação** do produto.

Deve ser consultado sempre que:
- um novo componente ou tela for implementado
- uma rota for adicionada ou removida
- um estado ou status for alterado
- uma nomenclatura for usada na interface
- o fluxo de aprovação for tocado

---

## 1. Entidades Principais e Hierarquia

### 1.1 Hierarquia de Domínio

```
CONTA
  └── PROJETO (ex: "Super SEO" — o negócio e o blog)
        ├── BLOG (canal de publicação)
        └── ESTRATÉGIA (pode ter várias)
              ├── BRIEFING de estratégia (contexto específico)
              ├── KEYWORDS (palavras aprovadas)
              ├── TEMAS (pautas geradas e aprovadas)
              │     └── ARTIGO (gerado a partir de um tema)
              └── RESULTADOS (métricas desta estratégia)

TENDÊNCIAS (global — pode virar Tema em qualquer estratégia)
ANALYTICS (global — filtrável por estratégia, período, SEO vs GEO)
```

### 1.2 Separação Crítica: Projeto ≠ Estratégia

Esta distinção deve ser preservada em todo o build.

| Entidade | Papel | Exemplo |
|----------|-------|---------|
| **Projeto** | O negócio, o blog, o contexto. Uma instância por empresa. | "Clínica Saúde Total" |
| **Estratégia** | Uma linha editorial ou hipótese operacional. Múltiplas por projeto. | "SEO Local", "Captação via Blog", "Social" |

**Regra**: Projeto agrega (blog, configurações, conta). Estratégia foca (keywords, temas, artigos, resultados).

### 1.3 Modelo de Entidades Simplificado (para o usuário)

| Entidade | O que é para o usuário leigo |
|----------|------------------------------|
| Projeto | Seu negócio no sistema |
| Blog | Onde seus artigos são publicados |
| Estratégia | Um foco específico de conteúdo |
| Briefing | O contexto que você deu à IA para esta estratégia |
| Keyword | Uma palavra que seus clientes usam para te encontrar |
| Tema | Uma ideia de artigo gerada a partir de uma keyword |
| Artigo | O texto completo gerado, pronto para revisar |
| Tendência | Uma oportunidade de conteúdo do seu mercado esta semana |
| Resultado | Dados de desempenho dos seus artigos |

### 1.4 Regra de Progressão

```
Briefing → alimenta → Keywords
Keywords (aprovadas) → geram → Temas
Temas (aprovados) → geram → Artigos
Artigos (publicados) → geram → Resultados
```

Esta progressão nunca anda para trás. Cada etapa requer ação humana.

---

## 2. Navegação Principal

### 2.1 Itens de Nav (7 — máximo para usuário leigo)

```
Dashboard          → central de ação e status
Estratégias        → lista e detalhe de estratégias (entidade primária)
Artigos            → visão global cross-estratégia
Tendências         → oportunidades externas semanais
Analytics          → resultados aprofundados e comparativos
Meu Blog           → configuração do canal
Configurações      → sistema, conta, integrações
```

### 2.2 O que NÃO aparece na nav

| Removido | Motivo |
|----------|--------|
| "Plano de Conteúdo" | Absorvido pela Estratégia (keywords + temas) |
| "Automação" | Conceito técnico — invisível para o usuário |
| "Jobs" | Técnico — movido para Configurações > Avançado |

### 2.3 Subnav Contextual da Estratégia

Aparece apenas dentro do detalhe de uma estratégia:

```
← Estratégias / [Nome da Estratégia]

[ Visão Geral ]  [ Briefing ]  [ Keywords ]  [ Temas ]  [ Artigos ]  [ Resultados ]
```

---

## 3. Sistema de Estados

### 3.1 Keywords

| Status | Significado para o usuário |
|--------|--------------------------|
| `suggested` | A IA sugeriu — você ainda não viu |
| `pending_review` | Aguardando sua aprovação |
| `approved` | Aprovada — vai gerar temas |
| `rejected` | Descartada |
| `paused` | Aprovada, mas pausada |

### 3.2 Temas

| Status | Significado para o usuário |
|--------|--------------------------|
| `suggested` | A IA sugeriu um tema |
| `pending_review` | Aguardando sua aprovação |
| `approved` | Aprovado — pronto para gerar artigo |
| `in_production` | Artigo sendo gerado agora |
| `rejected` | Descartado |

### 3.3 Artigos

| Status | Significado para o usuário |
|--------|--------------------------|
| `draft` | Rascunho gerado, aguardando revisão |
| `pending_review` | Você precisa ler e aprovar |
| `approved` | Aprovado — pronto para publicar |
| `scheduled` | Vai publicar em [data] |
| `published` | Publicado no blog |
| `rejected` | Rejeitado |
| `updating` | Sendo atualizado |
| `archived` | Arquivado |

### 3.4 Estratégias

| Status | Significado |
|--------|------------|
| `configuring` | Em setup inicial |
| `active` | Operando |
| `paused` | Pausada |
| `archived` | Encerrada |

### 3.5 Regra de Clareza de Estado

Sempre que houver `pending_review`, mostrar:
1. **O que está esperando** — "3 artigos aguardando aprovação"
2. **Onde** — "Estratégia: SEO Local"
3. **O que fazer** — botão de ação direta

---

## 4. Modos de Operação da IA

Esta convenção deve ser visível em: Configurações da Estratégia, cards de status e Dashboard.

| Modo | Como funciona | Padrão |
|------|--------------|--------|
| **Manual** | Tudo exige aprovação humana. IA sugere, humano decide. | ✅ Padrão inicial |
| **Assistido** | IA avança keywords → temas automaticamente. Artigos ainda requerem aprovação. | Opt-in |
| **Automático** | IA pode gerar e publicar conforme regras definidas. | Opt-in com dupla confirmação |

**Regra de design**: Nunca publicar sem aprovação no modo Manual ou Assistido. Modo Automático exige confirmação explícita. O modo ativo deve estar visível no card da estratégia.

---

## 5. Camadas SEO e GEO

### 5.1 Definição para o usuário leigo

| Camada | O que é |
|--------|---------|
| **SEO** | Quando alguém busca no Google e encontra você |
| **GEO (Presença em IAs)** | Quando uma IA como ChatGPT, Perplexity ou Gemini responde sobre um tema e te menciona |

### 5.2 Onde GEO aparece

| Tela | Como aparece |
|------|-------------|
| Estratégia > Resultados | Toggle SEO / GEO / Ambos |
| Analytics | Toggle SEO / GEO + comparativo |
| Artigos | Badge de indexação em IA (quando disponível) |
| Analytics (KPIs) | "Menções em respostas de IA" |

### 5.3 Linguagem GEO

- ❌ "GEO score" (técnico)
- ✅ "Presença em IAs" (descritivo)
- ✅ "Como IAs falam sobre você" (contextual)

---

## 6. Centro de Aprovação (Feature Core)

Esta tela consolida tudo com `pending_review` em um único lugar, cross-estratégia.

**Acesso**: Link no Dashboard (badge com contagem) + atalho permanente.

**Estrutura**:
```
Artigos prontos para publicar (N)
Temas aguardando aprovação (N)
Keywords sugeridas pela IA (N)
  → por estratégia, ordenado por urgência
```

**Empty state**: "Tudo em dia! A IA está trabalhando nos próximos temas."

---

## 7. Regra: Resultados vs Analytics

| Tela | Escopo | Profundidade |
|------|--------|-------------|
| **Estratégia > Resultados** | Apenas esta estratégia | Resumido — responde "como está performando?" |
| **Analytics (global)** | Todas as estratégias | Aprofundado — compara estratégias, períodos, SEO vs GEO |

Mesmos dados, profundidade diferente. Não são duplicações.

---

## 8. Terminologia Padrão de Interface

| ❌ Não usar | ✅ Usar | Contexto |
|------------|---------|----------|
| Pauta (misturado com Tema) | **Tema** | Único termo na UI |
| Brief / Topics | **Tema** (para o usuário) | Interno pode manter |
| Keywords Seed | **Palavras-chave** | Leigo |
| Jobs / Automação | (invisível ou "Produção automática") | Interno |
| GEO (sigla) | **Presença em IAs** | Mais descritivo |
| Plano de Conteúdo | (removido) | Absorvido por Estratégia |
| Esteira Editorial | (removido) | Absorvido pelo fluxo da Estratégia |

---

## 9. Fluxo de Ativação

```
1. Signup
2. Onboarding: nome do negócio + blog (template ou CMS externo)
3. Criar primeira estratégia (nome + foco + briefing guiado por IA)
4. IA gera keywords → usuário aprova
5. IA gera temas → usuário aprova
6. IA gera artigos → usuário revisa e publica
   → Primeiro valor percebido ✅
```

---

## 10. Fluxo Recorrente

```
1. Dashboard → ver pendências
2. Centro de Aprovação → agir sobre pendentes
3. Tendências → adicionar oportunidade como tema
4. Analytics → avaliar resultados
5. Estratégias → criar nova estratégia se necessário
```

---

## 11. Sitemap Completo

```
/auth/login
/auth/signup
/onboarding

/app
  /dashboard
  /aprovacoes                    ← Centro de Aprovação (feature core)

  /estrategias
    /new                         ← Onboarding de nova estratégia (3 steps)
    /[id]
      /overview
      /briefing
      /keywords
      /temas
      /artigos
      /resultados

  /artigos                       ← visão global cross-estratégia
    /[id]                        ← editor de artigo

  /tendencias

  /analytics

  /blog
    /configurar
    /personalizar

  /configuracoes
    /conta
    /integracoes
    /producao
    /plano
    /equipe
    /avancado                    ← jobs técnicos (invisível na nav principal)
```

---

## 12. Decisões Técnicas com Impacto em UX

| Decisão | Impacto |
|---------|---------|
| `strategy_id` em todas as entidades (keywords, temas, artigos) | Habilita filtros por estratégia e comparações |
| Briefing de negócio (global) + briefing de estratégia (específico) | Dois níveis de contexto para a IA |
| Modo de operação configurável por estratégia | Diferentes estratégias podem ter automações diferentes |
| `pending_review` como estado unificado | Feed do Centro de Aprovação |

---

## Histórico de Versões

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-04-14 | Redesign inicial — Estratégia como entidade central |
| 1.1 | 2026-04-14 | Refinamentos do PO: separação Projeto/Estratégia, Resultados vs Analytics, término Tema unificado, modos de operação da IA, Centro de Aprovação como core, camada GEO explícita |
