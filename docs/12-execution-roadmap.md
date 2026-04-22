# Roadmap de Execucao JTBD + GSD

## Status atual

- Fase atual: `Convergencia visual total ao prototipo`
- Ultima atualizacao: 2026-04-22
- Fonte de verdade de progresso: este arquivo
- Fonte de verdade visual: `prototipo-visual/`
- Fonte de verdade do design system: `prototipo-visual/design-system/`

---

## Como retomar

Quando o trabalho continuar:

1. ler `AGENTS.md`
2. ler `docs/README.md`
3. ler `docs/03-information-architecture.md`
4. ler `docs/13-current-state-audit.md`
5. ler `docs/14-ux-and-ia-redesign.md`
6. seguir o proximo passo recomendado deste arquivo

---

## Entregue nesta fase

- design system do prototipo portado para o app real
- `/design-system` adicionado ao app real
- shell do dashboard alinhada ao prototipo com sidebar/header
- novas rotas visuais do dashboard:
  - `/dashboard/estrategias`
  - `/dashboard/estrategias/nova`
  - `/dashboard/estrategias/[id]`
  - `/dashboard/calendario`
  - `/dashboard/newsletter`
  - `/dashboard/leads`
- blog publico do prototipo:
  - `/blog`
  - `/blog/[slug]`
- telas adicionais de onboarding do prototipo:
  - `/onboarding/escolher`
  - `/onboarding/estrategia`
  - `/onboarding/resumo`
  - `/onboarding/estrategias`
- compatibilidade de `/dashboard/estrategia*` para `/dashboard/estrategias*`
- docs canonicos sincronizados com a nova verdade visual
- **[NOVO] Migração Data-centric Concluída**:
  - `contacts`: Tabela para Leads unificada, com RLS, listagem real, e Server Action público para captação externa.
  - `newsletter_configs`: Tabela settings 1:1 por tenant, controle de sender/reply-to, opt-in.
  - `analytics_daily`: Tabela de série temporal, conectada ao Dashboard de Analytics com gráficos reais RSC (React Server Components).
- **[NOVO] Blog Público conectado ao Supabase**:
  - `/blog` e `/blog/[slug]` agora consomem dados reais da tabela `posts` (status=published).
  - Mapper inteligente converte texto bruto em blocos visuais para o renderizador.
- **[NOVO] Onboarding Persistente**:
  - Briefing de IA salva diretamente em `business_briefings` e `ai_preferences` via Server Actions.
  - Substitui o `sessionStorage` como persistência primária.
- **[NOVO] Workflow Editorial (Estratégia -> Tópicos -> Posts)**:
  - Server Action `approveTopicCandidate` marca o tópico como aprovado e cria automaticamente um rascunho na tabela `posts`.
  - UI do TopicsTable conectada à ação real com feedback via toast.
- **[NOVO] Configuração operacional do workspace**:
  - `manual`, `assisted` e `automatic` foram movidos para o workspace.
  - A tela de configurações ganhou seletor visual de modo operacional.
  - A tela da estratégia agora exibe o modo efetivo do workspace para orientar o agente.
- **[NOVO] MCP de estratégia**:
  - Pacote local `@super/strategy-mcp` criado com tools para contexto, atualização e workflows.
  - `.agent/mcp_config.json` agora expõe o servidor `strategy-ops` ao agente.
- **[NOVO] Chat operacional da estratégia**:
  - O chat persistido da tela de estratégia agora usa tool-calling para consultar estado real e executar workflows.
  - O executor respeita `manual`, `assisted` e `automatic`, bloqueando publicação/agendamento fora do modo autônomo.
- **[NOVO] Criação real de rascunhos pelo chat**:
  - Pedidos como "crie/produza/gere artigos" agora forçam tool-call e criam registros reais em `posts`.
  - O agente só pode afirmar criação/agendamento/publicação quando a tool retornar sucesso.
  - A box de processamento do chat deixou de simular checklist de etapas e passou a mostrar estado honesto de processamento.

---

## Decisão Arquitetural Recente (Tracking de IA)

Para rastrear cliques de IAs (ChatGPT, Perplexity, etc.) no Analytics Dashboard sem complexidade de OAuth para o cliente, adotamos o padrão **GA4 Mestre (Centralizado)**:
- O Fronte App gerencia uma única propriedade GA4 no backend.
- O tráfego dos blogs hospedados e, futuramente, de sites externos (via Fronte Tracking Snippet `pixel.js`) é enviado para esse GA4 Mestre com uma Custom Dimension `tenant_id`.
- O Dashboard do cliente filtra o GA4 Mestre via API Server-to-Server, mantendo a experiência mágica e sem atrito.

---

## Gaps assumidos (Resolvidos ou Planejados)

- ~~newsletter, leads, calendario e parte de analytics ainda usam dados mockados/adapters do prototipo~~ (Resolvido: migração Data-centric concluída)
- auth, workspace, site e briefing seguem conectados ao backend real
- a rota publica antiga `/blog/[subdomain]` foi substituida pela topologia visual `/blog/[slug]` conectada ao banco de dados real.
- a aba GEO (IA) do Analytics permanece como mock placeholder aguardando a implementação do GA4 Data API detalhada acima.

---

## Proximo passo recomendado

### Fase 1: Motor de Execução de Estratégias (Prioridade)

Foco na qualidade, metodologia e motor por trás da execução das estratégias editoriais:

1. **Conexão UI ↔ Worker**: Conectar os botões do `/dashboard/estrategias/[id]` aos jobs reais do worker (`research_topics`, `generate_brief`, `generate_post`). Consolidar actions duplicados.
2. **Contexto da Estratégia nos Prompts**: Injetar `strategy.tone`, `strategy.audience`, `strategy.goal` nos prompts de IA para gerar conteúdo alinhado à marca.
3. **Rastreabilidade (`strategy_id`)**: Propagar `strategy_id` em toda a cadeia: keywords → tópicos → briefs → posts.
4. **Feedback Visual de Jobs (UX progressivo)**:
   - **Ciclo 1 (mínimo)**: Toast de confirmação + botão desabilitado com spinner durante processamento.
   - **Ciclo 2 (inteligente)**: Banner de status na aba ("IA trabalhando...") + polling leve com `router.refresh()` a cada 5s enquanto houver jobs ativos. Estado final visível ("8 tópicos encontrados" ou "Erro — tentar novamente?").
   - **Fora de escopo**: WebSocket/Realtime, barra de progresso com %, notificações push.
5. **Automação Inteligente**: Usar `operation_mode` (manual/assisted/automatic) para calibrar o nível de intervenção humana vs. IA.
6. **Módulo de Concorrência Orgânica (SERP)**:
   - Integração com Serper.dev para queries em background.
   - Construção do Cache Global (72h) de SERP em `serp_snapshots`.
   - Injeção Ativa de snippets e títulos extraídos da SERP nos prompts da IA para criar estratégias superiores ao top 10.
   - Exibir top players na UI da aba de Estratégias.
7. **Ações em Massa (Batch)**:
   - Aprovação/reprovação de Keywords e Tópicos com checkboxes na UI (`keywords-table` e `topics-table`).
   - Parametrizar modalidade "Gerar mais N tópicos" definindo limits de requisição à API da OpenAI para melhor previsibilidade.
8. **Controle de Qualidade**: Implementar métricas de avaliação automática (legibilidade, SEO score, originalidade) antes da publicação.

### Fase 2: Integrações Externas

1. **Integrar API do Google Analytics 4 (Data API)** para a aba GEO. *(Bloqueado: requer chaves no `.env.local`)*
2. **Desenvolver o Frontend Público (Storefront)** para a página inicial (`/`).
3. **Domínios personalizados para blogs de clientes**. *(Futuro; não agora)*
   - Caminho recomendado: subdomínio customizado via `CNAME`, por exemplo `blog.cliente.com.br`.
   - DNS esperado: tipo `CNAME`, nome `blog`, valor canônico da plataforma como `cname.fronte.app`.
   - Produto salva em `sites.custom_domain` com status inicial `pending_dns`.
   - Dependências: provedor DNS do cliente, Vercel Domains API ou proxy próprio com TLS automático, verificação de CNAME e emissão/renovação de SSL.
   - Roteamento público deve resolver o site pelo header `host`; o subdomínio da plataforma e o domínio customizado podem coexistir.

*(Nota: O fluxo de Handoff IA/Humano foi removido do roadmap — confirmado que não há atendimento humano de leads.)*

---

## Validacao esperada

- `npx tsc -p apps/web/tsconfig.json --noEmit`
- `npm --workspace @super/web run build`
- lint de escopo alterado
- registrar falhas de lint global se forem baseline legado fora do escopo
