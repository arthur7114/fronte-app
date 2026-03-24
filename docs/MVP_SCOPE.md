# MVP Scope

## Objetivo

Definir com clareza o que entra e o que não entra no MVP operacional do Super.

---

## In Scope

### Tenant e auth

- signup via Supabase Auth
- login via Supabase Auth
- criação do primeiro workspace
- sessão autenticada com SSR
- papéis básicos por membership

---

### Site e blog

- criação do primeiro site/blog
- configuração de nome
- idioma
- subdomínio
- tema inicial padrão
- listagem pública de posts
- página individual de post

---

### CMS básico

- lista de posts
- criar post
- editar post
- salvar rascunho
- aprovar post
- rejeitar post
- agendar post
- publicar post manualmente

---

### Automação de conteúdo

- tela de configuração da automação
- seed keywords
- idioma
- expertise level
- frequência
- aprovação obrigatória ou não
- pesquisa inicial de temas
- lista de topics sugeridos
- aprovação, rejeição e edição de topics
- geração de brief
- geração de draft

---

### Configuração de IA

- preferências editoriais de IA
- tom
- estilo
- nível de profundidade
- exibição do runtime da IA como infraestrutura da plataforma
- preparação de produto para seleção de modelo no desenho futuro

### Diretriz de produto para IA

- a IA é operada pela plataforma
- o usuário não conecta API key própria no MVP
- o modelo continua relevante como variável de custo, qualidade e consumo

---

### Worker e jobs

- job de pesquisa
- job de geração de brief
- job de geração de post
- lista básica de jobs por tenant

### Já implementado no código

- `research_topics`
- `generate_brief`
- `generate_post`

### Ainda pendente no escopo original

- `publish_post`

---

## Out of Scope

- analytics avançado
- CRM
- base de contatos avançada
- automações de e-mail
- jornadas por webhook complexas
- múltiplos sites avançados por tenant
- AI memory sofisticada com embeddings
- personalização visual profunda de site builder
- API key própria do usuário
- provider externo conectado diretamente pelo cliente

---

## Risks do MVP

- qualidade inconsistente da geração de conteúdo
- custo variável conforme modelo e volume de uso
- falta de observabilidade mais forte dos jobs
- regras de IA ainda pouco controláveis sem UI de `ai_rules`
- acoplamento excessivo entre app e worker se o pipeline crescer sem disciplina

---

## Constraints do MVP

- manter baixa complexidade operacional
- priorizar velocidade de implementação
- priorizar clareza arquitetural
- evitar microserviços prematuros
- manter o runtime de IA centralizado na plataforma
