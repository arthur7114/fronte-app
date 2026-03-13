# PRD

## Product Name

Super

---

## 1. Product Objective

Construir uma plataforma SaaS multitenant, AI-first, que permita a criação e operação de sites e blogs com geração automatizada de conteúdo, publicação recorrente e evolução futura para analytics, gestão de contatos e automações.

O MVP deve focar em:

- criação de blog
- publicação manual e assistida
- pesquisa de temas com IA
- geração de conteúdo com IA
- fluxo de aprovação
- agendamento de posts
- publicação automática básica

---

## 2. Product Scope

O produto completo será evoluído em etapas:

1. construir site
2. construir blog
3. produzir conteúdo
4. analisar resultados
5. gerenciar base de contatos
6. agendamento de e-mail / automações via webhook

O escopo do MVP contempla apenas a base necessária para lançar as etapas 2 e 3 de forma viável.

---

## 3. Product Principles

- arquitetura multi-tenant desde o início
- desenvolvimento Agent-First
- IA como camada operacional do produto, não apenas assistiva
- workflow editorial auditável
- separação entre painel administrativo e blog público
- execução assíncrona para tarefas pesadas
- escalabilidade gradual sem complexidade prematura

---

## 4. Core User Flows

### 4.1 Criar blog

1. usuário cria conta
2. usuário cria tenant
3. usuário cria site/blog
4. usuário escolhe tema
5. usuário define subdomínio ou mantém padrão da plataforma
6. blog fica disponível publicamente

---

### 4.2 Configurar automação de conteúdo

1. usuário acessa painel de automação
2. define palavras-chave base
3. define idioma
4. define nível de profundidade
5. define frequência de publicação
6. define modo de aprovação
7. salva configuração
8. sistema inicia pesquisa inicial de temas

---

### 4.3 Curar temas sugeridos

1. sistema gera lista de temas
2. usuário visualiza sugestões
3. usuário aprova, edita ou rejeita temas
4. temas aprovados viram briefs

---

### 4.4 Gerar e revisar conteúdo

1. sistema gera rascunho do post
2. usuário revisa
3. usuário aprova, rejeita ou edita
4. rejeições podem virar regra de IA

---

### 4.5 Agendar e publicar

1. sistema agenda posts de acordo com frequência definida
2. usuário pode alterar datas manualmente
3. worker publica posts na data/hora adequada
4. sistema atualiza sitemap e listagens

---

## 5. Functional Requirements

### 5.1 Tenancy e acesso

- sistema deve suportar múltiplos tenants
- cada tenant deve enxergar apenas seus próprios dados
- usuários podem pertencer a um tenant com papéis distintos
- painel administrativo deve funcionar em domínio centralizado

---

### 5.2 Site e blog

- criar site/blog
- definir idioma
- selecionar tema
- configurar subdomínio
- suportar domínio customizado futuramente
- publicar páginas e posts

---

### 5.3 Conteúdo manual

- criar post manualmente
- editar post
- salvar rascunho
- agendar publicação
- publicar imediatamente

---

### 5.4 Conteúdo com IA

- configurar parâmetros editoriais
- gerar temas a partir de pesquisa
- aprovar temas
- gerar briefs
- gerar artigos
- revisar e aprovar
- aprender com rejeições

---

### 5.5 Configuração de IA

- escolher provider
- definir API key própria ou usar créditos da plataforma
- escolher modelo
- ajustar parâmetros básicos
- definir tom editorial
- definir regras de estilo

---

### 5.6 Jobs e processamento assíncrono

- tarefas demoradas devem rodar via jobs
- jobs devem possuir status
- jobs devem registrar erro
- jobs devem permitir retry
- publicação agendada deve ocorrer por worker

---

## 6. Non-Functional Requirements

- arquitetura preparada para multitenancy
- uso de PostgreSQL via Supabase
- autenticação via Supabase Auth
- armazenamento de arquivos via Supabase Storage
- isolamento por tenant_id via Row Level Security (RLS)
- uso de Next.js
- worker em container separado para tarefas de IA
- documentação adequada para desenvolvimento Agent-First
- estrutura modular para evolução futura

---

## 7. Out of Scope for MVP

- CRM completo
- automação avançada de e-mail
- analytics avançado
- A/B test
- scoring avançado de SEO
- automações omnichannel
- construtor completo de sites multipágina avançado

---

## 8. Technical Decisions Already Consolidated

- painel administrativo em domínio centralizado
- blogs públicos em subdomínio ou domínio customizado
- Supabase como camada de infraestrutura (banco, auth, storage)
- isolamento multi-tenant via RLS nativo do PostgreSQL
- jobs em worker separado conectando via connection string
- IA organizada em pipeline de agentes
- feedback do usuário pode virar regra persistente da IA

---

## 9. MVP Success Criteria

- usuário consegue criar blog funcional
- usuário consegue configurar automação de conteúdo
- sistema gera temas com base em parâmetros
- usuário consegue aprovar temas
- sistema gera posts
- usuário consegue aprovar ou rejeitar
- sistema agenda e publica posts
- dados permanecem isolados por tenant