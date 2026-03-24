# Status de Desenvolvimento do MVP

Este documento registra o estado real do MVP no repositório, usando o código atual como fonte de verdade.

## Resumo do progresso

- Início do desenvolvimento: março de 2026
- Status atual: núcleo do MVP funcional, com os 4 blocos principais já implementados
- Leitura prática: o produto já cobre o fluxo principal de ponta a ponta, mas ainda não fechou 100% do escopo original

---

## 1. Infraestrutura e base

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Banco de dados no Supabase | ✅ Concluído | Schema principal já existe e é usado pelo app e pelo worker. |
| Types de banco em `@super/db` | ✅ Concluído | O app usa tipos gerados e clients compartilhados. |
| Estrutura do monorepo | ✅ Concluído | `apps/web`, `apps/worker`, `packages/db` e `packages/shared` ativos. |
| Docker e setup local | ✅ Concluído | Web e worker possuem estrutura para execução local. |
| Isolamento por tenant | ✅ Concluído | O fluxo atual já usa tenant/membership e helpers server-side. |

---

## 2. Auth, tenant e onboarding

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Signup via Supabase Auth | ✅ Concluído | Fluxo com fallback para confirmação de email quando não há sessão imediata. |
| Login via Supabase Auth | ✅ Concluído | Login funcional com tratamento de erro em PT-BR. |
| Sessão SSR | ✅ Concluído | Fluxo protegido com middleware/proxy e contexto autenticado no servidor. |
| Criação do primeiro workspace | ✅ Concluído | Onboarding cria tenant + membership inicial. |
| Onboarding em 2 etapas | ✅ Concluído | Workspace primeiro, site depois. |
| Papéis básicos por membership | ✅ Concluído | O app já opera com vínculo por tenant para o MVP. |

---

## 3. Site, blog e CMS

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Criação do primeiro site/blog | ✅ Concluído | Nome, idioma, subdomínio e tema padrão já entram no fluxo. |
| Dashboard de posts | ✅ Concluído | Lista de posts por site com status editorial. |
| Editor de post | ✅ Concluído | Criar e editar post com título, slug, conteúdo e data de publicação. |
| Fluxo editorial básico | ✅ Concluído | Salvar rascunho, enviar para aprovação, aprovar, rejeitar, agendar e publicar. |
| Blog público | ✅ Concluído | Listagem pública e página individual de post por rota. |
| Tema visual configurável | ⏳ Parcial | Existe tema padrão; personalização real ainda não faz parte do produto atual. |

---

## 4. Automação de conteúdo e IA

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Configuração de automação | ✅ Concluído | `keywords_seed`, `language`, `frequency` e `approval_required` já estão no app. |
| Preferências editoriais de IA | ✅ Concluído | `tone_of_voice`, `writing_style` e `expertise_level` já estão no app. |
| Pesquisa inicial de temas | ✅ Concluído | Job real `research_topics` cria `topic_candidates`. |
| Gestão de topics sugeridos | ✅ Concluído | Aprovar, rejeitar e editar temas já está funcional. |
| Geração de brief | ✅ Concluído | Job real `generate_brief` cria `content_briefs`. |
| Geração de draft | ✅ Concluído | Job real `generate_post` cria posts em rascunho. |
| Configuração de provider/API key por usuário | ❌ Fora do MVP atual | A IA é operada pela plataforma, não por token próprio do cliente. |
| Seleção de modelo pelo usuário | ⏳ Pendente de produto | Continua relevante para custo e consumo, mas ainda não está exposta no app. |
| `ai_rules` com UI e loop completo | ⏳ Pendente | O schema existe e o worker já consegue consumir regras, mas falta a superfície de produto. |

---

## 5. Worker e jobs

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Setup do worker | ✅ Concluído | Worker em app separado rodando polling simples. |
| Claim e processamento de jobs | ✅ Concluído | Transição `pending -> running -> completed|failed`. |
| Integração com OpenAI | ✅ Concluído | Runtime atual usa credenciais do ambiente da plataforma. |
| Dashboard de jobs | ✅ Concluído | O app lista jobs por tenant e exibe status, tentativas e resultado resumido. |
| Jobs ativos no MVP | ✅ Concluído | `research_topics`, `generate_brief` e `generate_post`. |
| `publish_post` | ⏳ Pendente | Ainda não foi implementado no worker. |
| Observabilidade avançada | ⏳ Pendente | O básico existe, mas ainda falta melhor leitura operacional de falhas e consumo. |

---

## 6. UX/UI do app autenticado

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Auth em PT-BR | ✅ Concluído | Login e signup com linguagem unificada. |
| Shell persistente do app | ✅ Concluído | Sidebar, topbar e `/app/overview` já existem. |
| Área de Configurações | ✅ Concluído | Conta, workspace, site, IA e automação. |
| Onboarding guiado | ✅ Concluído | Fluxo do primeiro acesso já respeita o estado do usuário. |
| Polimento final de UX | ⏳ Parcial | O produto já é operável, mas ainda pode evoluir em microinterações, feedback e densidade visual. |

---

## Pendências reais para fechar o escopo

- implementar `publish_post` no worker
- criar UI e loop de produto para `ai_rules`
- decidir se a seleção de `modelo` entra ainda no fechamento do MVP operacional
- melhorar observabilidade de jobs e do consumo de IA

---

## Leitura executiva

O MVP já validou o fluxo principal:

`signup/login -> onboarding -> criar site -> criar/editar/publicar post -> gerar temas -> aprovar -> gerar briefing -> gerar draft -> acompanhar jobs`

O que falta agora não é fundação. Falta fechar os últimos pontos do escopo original e tornar a operação mais previsível.
