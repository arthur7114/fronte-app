# UI Screens

Este documento lista as telas reais do produto no estado atual do MVP.

---

## Auth e entrada

### `/auth/login`

Objetivo:

permitir entrada por email e senha

Principais elementos:

- email
- senha
- feedback de erro
- redirecionamento conforme estado do usuário

### `/auth/signup`

Objetivo:

criar a conta inicial

Principais elementos:

- email
- senha
- feedback de sucesso
- fallback para confirmação de email quando necessário

---

## Onboarding

### `/onboarding`

Objetivo:

criar o primeiro workspace

Principais elementos:

- nome do workspace
- slug do workspace
- contexto da etapa atual

### `/onboarding/site`

Objetivo:

criar o primeiro site do workspace

Principais elementos:

- nome do site
- idioma
- subdomínio

---

## App autenticado

### `/app/overview`

Objetivo:

ser a home operacional do produto

Principais elementos:

- resumo de posts
- temas pendentes
- briefings prontos
- jobs em andamento
- atalhos principais

### `/app/posts`

Objetivo:

listar e operar os posts do site atual

Principais elementos:

- tabela/lista de posts
- status editorial
- atalho para novo post

### `/app/posts/new`

Objetivo:

abrir um novo rascunho

Principais elementos:

- título
- slug
- conteúdo
- ações editoriais

### `/app/posts/[id]`

Objetivo:

editar um post existente

Principais elementos:

- formulário do post
- status atual
- ações editoriais

---

## Automação

### `/app/automation`

Objetivo:

configurar a operação editorial automatizada

Principais elementos:

- `keywords_seed`
- `language`
- `frequency`
- `approval_required`
- `tone_of_voice`
- `writing_style`
- `expertise_level`
- botão para pesquisar temas

### `/app/automation/topics`

Objetivo:

curar os temas gerados pelo worker

Principais elementos:

- lista de topics sugeridos
- editar tema
- aprovar
- rejeitar

### `/app/automation/briefs`

Objetivo:

acompanhar briefings gerados e disparar drafts

Principais elementos:

- lista de briefings
- ângulo
- keywords
- ação de gerar draft

### `/app/jobs`

Objetivo:

acompanhar a fila real de processamento

Principais elementos:

- tipo do job
- status
- tentativas
- horário
- resultado resumido
- erro resumido

---

## Configurações

### `/app/settings/account`

Objetivo:

gerenciar dados básicos da conta

Principais elementos:

- email somente leitura
- nome visível
- logout

### `/app/settings/workspace`

Objetivo:

editar a identidade do workspace

Principais elementos:

- nome
- slug

### `/app/settings/site`

Objetivo:

editar o site atual

Principais elementos:

- nome
- idioma
- subdomínio

### `/app/settings/ai`

Objetivo:

editar preferências editoriais da IA

Principais elementos:

- tom
- estilo
- nível de profundidade
- indicação de que o runtime é da plataforma

### `/app/settings/automation`

Objetivo:

editar a configuração editorial da automação

Principais elementos:

- keywords
- idioma
- frequência
- aprovação obrigatória

---

## Blog público

### `/blog/[subdomain]`

Objetivo:

mostrar a listagem pública de posts publicados

### `/blog/[subdomain]/[postSlug]`

Objetivo:

mostrar a página individual de um post publicado

---

## O que não existe hoje como tela concluída

- configuração de API key própria
- seleção de provider pelo usuário
- seleção de modelo na UI atual
- theme builder
- domain settings avançado
- contacts
- analytics
- admin tools
