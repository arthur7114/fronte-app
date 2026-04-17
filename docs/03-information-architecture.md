# Arquitetura de Informação, Telas e Fluxos

> **Versão**: 2.0 — Revisada em Abril/2026
> **Fonte de verdade de UX/IA**: `docs/14-ux-and-ia-redesign.md`
> Esta versão reflete o redesign aprovado pelo Product Owner.
> Mudança central: **Estratégia passa a ser a entidade primária operacional**.

---

## Princípio Central de IA

```
CONTA → PROJETO → ESTRATÉGIA(S) → Briefing / Keywords / Temas / Artigos / Resultados
```

- **Projeto** = o negócio no sistema (agrega blog, configurações, conta)
- **Estratégia** = linha editorial ou hipótese operacional (múltiplas por projeto)
- Tudo que é editorial (keywords, temas, artigos) pertence a uma Estratégia — não diretamente ao Projeto

---

## Navegação principal

```
Dashboard            → central de ação e status por projeto
Estratégias          → lista e detalhe de estratégias (entidade primária)
Artigos              → visão global de produção (cross-estratégia)
Tendências           → oportunidades externas semanais
Analytics            → resultados aprofundados e comparativos
Meu Blog             → configuração do canal
Configurações        → sistema, conta, integrações
```

### O que foi removido da nav

| Removido | Motivo | Destino |
|----------|--------|---------|
| Plano de Conteúdo | Absorvido pela Estratégia (keywords + temas) | Subnav da Estratégia |
| Automação | Conceito técnico — invisível para o usuário | Configurações > Avançado |
| Jobs | Técnico, não é feature de produto | Configurações > Avançado |

---

## Subnav contextual da Estratégia

Aparece apenas dentro do detalhe de uma estratégia:

```
← Estratégias / [Nome da Estratégia]

[ Visão Geral ]  [ Briefing ]  [ Keywords ]  [ Temas ]  [ Artigos ]  [ Resultados ]
```

---

## Telas principais

### Dashboard
Objetivo: orientar a ação imediata. Responder "o que preciso fazer agora?"

**Estrutura de três zonas**:
1. **Ação Prioritária** — card grande com o gargalo atual + CTA direto
2. **KPIs rápidos** — Publicados / Em aprovação / Tráfego
3. **Contexto** — cards mini por estratégia + tendências da semana

**Centro de Aprovação** (feature core):
- Acesso direto via badge no Dashboard
- Consolida tudo com `pending_review`: artigos, temas, keywords
- Cross-estratégia, ordenado por urgência

### Lista de Estratégias
Objetivo: visão geral de todas as estratégias do projeto.

Exibe:
- cards com nome, foco, status, contadores (keywords / temas / artigos)
- badge de pendências por estratégia
- botão "Nova Estratégia"

### Detalhe da Estratégia
Objetivo: centralizar toda a operação de uma estratégia.

Subnav com as abas:
- **Visão Geral**: pipeline visual + métricas resumidas + próxima ação sugerida
- **Briefing**: contexto específico desta estratégia (editável)
- **Keywords**: lista com métricas, filtros por jornada e aprovação
- **Temas**: pautas geradas, aprovação / rejeição
- **Artigos**: artigos desta estratégia, por status
- **Resultados**: métricas resumidas desta estratégia com toggle SEO/GEO

### Artigos (global)
Objetivo: visão unificada de toda a produção cross-estratégia.

Inclui:
- filtros por estratégia, status, período e jornada
- ações rápidas: aprovar / ver / publicar

### Tendências
Objetivo: apresentar oportunidades externas de conteúdo.

Inclui:
- análise semanal por nicho e localização
- justificativa da recomendação (IA explica por que importa)
- "Adicionar como tema" (com seleção de qual estratégia)

### Analytics
Objetivo: visão aprofundada e comparativa de resultados.

> **Diferente de Resultados**: Analytics é global e comparativo. Resultados (dentro da Estratégia) é resumido e contextual.

Inclui:
- filtros por estratégia e período
- toggle SEO / GEO (Presença em IAs) / Ambos
- KPIs: tráfego, posição média, CTR, menções em IAs (GEO)
- performance por jornada
- comparativo entre estratégias

### Meu Blog
Objetivo: estruturar e administrar o canal de publicação.

Inclui:
- template, domínio, CMS
- preview do blog publicado

### Configurações
Objetivo: gerenciar sistema, conta e integrações.

Inclui:
- dados do negócio
- integrações (GA, GTM, Meta Pixel, CAPI)
- preferências de produção (tom, estilo, tamanho)
- plano e billing
- equipe e permissões
- **Avançado**: jobs de automação (visível apenas aqui)

---

## Modos de Operação da IA

| Modo | Comportamento | Ativação |
|------|--------------|---------|
| **Manual** | Tudo exige aprovação humana | Padrão inicial |
| **Assistido** | IA avança keywords → temas; artigos ainda precisam de aprovação | Opt-in por estratégia |
| **Automático** | IA pode gerar e publicar conforme regras definidas | Opt-in com dupla confirmação |

---

## Camadas SEO e GEO

| Camada | O que é | Onde aparece |
|--------|---------|-------------|
| **SEO** | Visibilidade no Google | Em toda a interface quando há dados |
| **GEO (Presença em IAs)** | Menções em respostas de IAs como ChatGPT | Resultados + Analytics com toggle |

**Linguagem para o usuário**:
- ❌ "GEO score" → ✅ "Presença em IAs"
- ❌ "GEO indexing" → ✅ "Como IAs falam sobre você"

---

## Fluxos principais

### Fluxo de ativação (primeiro acesso)
1. usuário cria conta
2. onboarding: nomeia o negócio e configura o blog
3. cria primeira estratégia (3 passos: nome → foco → briefing)
4. IA gera keywords → usuário aprova
5. IA gera temas → usuário aprova
6. IA gera artigos → usuário revisa e publica
   → Primeiro valor percebido ✅

### Fluxo recorrente (uso semanal)
1. entra no Dashboard
2. vê gargalo atual (ex: artigos pendentes)
3. acessa Centro de Aprovação
4. aprova / edita / publica
5. vê tendências da semana
6. adiciona tendência como tema em uma estratégia
7. acompanha resultados em Analytics

### Fluxo de expansão (nova estratégia)
1. vai em Estratégias → "Nova Estratégia"
2. define nome, foco, briefing específico
3. IA gera keywords novas (focadas no foco desta estratégia)
4. opera o fluxo: keywords → temas → artigos
5. compara com a estratégia anterior em Analytics

---

## Terminologia padrão de interface

| ❌ Não usar | ✅ Usar |
|------------|---------|
| Pauta e Tema misturados | **Tema** (único termo na UI) |
| Topics / Briefs | **Tema** (para o usuário) |
| Keywords Seed | **Palavras-chave** |
| GEO (sigla) | **Presença em IAs** |
| Automação / Jobs | (invisível ou "produção automática") |
| Plano de Conteúdo | (removido — absorvido pela Estratégia) |
| Esteira Editorial | (removido — pipeline vive na Visão Geral da Estratégia) |

---

## Sitemap completo

```
/auth/login
/auth/signup
/onboarding

/app
  /dashboard
  /aprovacoes                         ← Centro de Aprovação

  /estrategias
    /new                              ← Onboarding de nova estratégia (3 steps)
    /[id]
      /overview
      /briefing
      /keywords
      /temas
      /artigos
      /resultados

  /artigos                            ← Visão global cross-estratégia
    /[id]                             ← Editor de artigo

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
    /avancado                         ← Jobs técnicos (invisível na nav)
```
