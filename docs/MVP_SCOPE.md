# MVP Scope

## Objective

Definir com precisão o que entra e o que não entra no MVP.

---

## In Scope

### Tenant e Auth

- signup (via Supabase Auth)
- login (via Supabase Auth)
- criação de tenant
- sessão autenticada (gerenciada pelo Supabase)
- papéis básicos por membership

---

### Blog

- criação de blog
- configuração de nome
- idioma
- subdomínio
- tema inicial
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
- publicar post

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
- aprovação/rejeição/edição de topics
- geração de brief
- geração de draft

---

### Configuração de IA

- selecionar provider
- informar API key
- escolher modelo
- definir tom
- definir estilo
- definir regras básicas

---

### Worker e Jobs

- job de pesquisa
- job de geração de brief
- job de geração de post
- job de publicação
- lista de jobs básicos por tenant

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

---

## MVP Risks

- qualidade inconsistente da geração de conteúdo
- complexidade de domínio customizado
- acoplamento excessivo entre app e worker
- falta de observabilidade dos jobs
- regras de IA pouco previsíveis no início

---

## MVP Constraints

- manter baixa complexidade operacional
- priorizar velocidade de implementação
- priorizar clareza arquitetural
- evitar microserviços prematuros