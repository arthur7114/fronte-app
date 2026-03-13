# Status de Desenvolvimento do MVP

Este documento rastreia o progresso da implementação do Produto Mínimo Viável (MVP) do projeto Super, com base no `MVP_SCOPE.md` e no `ROADMAP.md`.

## Resumo do Progresso
- **Início do Desenvolvimento:** Março de 2026
- **Status Atual:** Infraestrutura Base e Banco de Dados concluídos. Iniciando UI e Integrações.

---

## 🏗️ 1. Infraestrutura e Setup Base

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Criação do Banco de Dados | ✅ Concluído | Supabase configurado com 14 tabelas principais. |
| Políticas de Segurança (RLS) | ✅ Concluído | Isolamento por tenant (17 policies) aplicado em todas as tabelas. |
| Configuração de Storage | ✅ Concluído | Buckets criados: `avatars`, `blog-assets`, `site-assets`. |
| Geração de Types API | ✅ Concluído | Types gerados via Supabase CLI no pacote `@super/db`. |
| Estrutura do Monorepo | ✅ Concluído | Turborepo com `apps/web`, `apps/worker`, `packages/db`, e `packages/shared`. |
| Setup Docker | ✅ Concluído | Dockerfile para web e worker, docker-compose para orquestração local. |

---

## 🔐 2. Tenant e Autenticação (Auth)

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Schema de Perfis e Memberships | ✅ Concluído | Tabelas e triggers de auto-criação prontos no BD. |
| UI: Signup via Supabase Auth | ⏳ A Fazer | Implementar formulário e integração no frontend. |
| UI: Login via Supabase Auth | ⏳ A Fazer | Implementar formulário e integração no frontend. |
| UX: Criação de Tenant (Onboarding) | ⏳ A Fazer | Fluxo para criar o primeiro tenant após o signup. |
| Gerenciamento de Sessão (SSR) | ⏳ A Fazer | Middleware Next.js com `@supabase/ssr`. |

---

## 📝 3. Blog Engine e CMS Básico

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Schema de Posts e Sites | ✅ Concluído | Tabelas `sites`, `posts`, `post_revisions` configuradas. |
| UI: Criação e Configuração de Blog | ⏳ A Fazer | Nome, idioma, subdomínio, tema. |
| UI: Dashboard (Lista de Posts) | ⏳ A Fazer | Tabela com paginação, filtros e status. |
| UI: Editor de Post (Criar/Editar) | ⏳ A Fazer | Editor rico (Markdown/HTML), salvar rascunho. |
| UX: Fluxo Editorial | ⏳ A Fazer | Aprovar, rejeitar, agendar e publicar posts. |
| UI: Listagem Pública e Post Único | ⏳ A Fazer | Renderização SSG/ISR do blog para o leitor final. |

---

## 🤖 4. Automação de Conteúdo (AI)

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Schema de Configurações AI | ✅ Concluído | Tabelas `automation_configs`, `ai_preferences`, `ai_rules`. |
| UI: Tela de Configuração | ⏳ A Fazer | Keywords, frequência, expertise level, aprovação (sim/não). |
| Jobs: Tela de Configuração de API | ⏳ A Fazer | Escolher provider (OpenAI/Anthropic) e setar API Key. |
| Backend: Gerador de Topics | ⏳ A Fazer | Worker pesquisa e sugere temas no banco de dados. |
| UI: Gestão de Topics Sugeridos | ⏳ A Fazer | Aprovação, rejeição ou edição de temas sugeridos. |
| Backend: Gerador de Brief | ⏳ A Fazer | Worker cria o briefing editorial do tema aprovado. |
| Backend: Gerador de Draft | ⏳ A Fazer | Worker escreve o rascunho completo do post. |

---

## ⚙️ 5. Worker e Job System

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Schema de Jobs | ✅ Concluído | Tabela `automation_jobs` com índices de polling otimizados. |
| Worker: Setup da Aplicação | ✅ Concluído | Container Node.js/TS isolado rodando script de polling. |
| Worker: Integração IA | ⏳ A Fazer | Conectar APIs LLM aos processors de job. |
| UI: Dashboard de Jobs | ⏳ A Fazer | Listagem básica de jobs por tenant para monitoramento. |

---

> **Legenda de Status:**
> - ✅ Concluído
> - 🔄 Em Andamento
> - ⏳ A Fazer
> - 🚧 Bloqueado
