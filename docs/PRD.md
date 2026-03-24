# PRD

## Product Name

Super

---

## 1. Product Objective

Construir uma plataforma SaaS multi-tenant, AI-first, para operar sites e blogs com produção de conteúdo assistida e automatizada, combinando fluxo editorial, jobs assíncronos e IA operada pela própria plataforma.

O MVP deve focar em:

- criação de workspace e site/blog
- publicação manual e assistida
- pesquisa de temas com IA
- geração de briefings e drafts com IA
- fluxo de aprovação humana
- operação básica de jobs

---

## 2. Product Scope

O produto completo será evoluído em etapas:

1. fundação do app autenticado
2. blog e CMS
3. produção de conteúdo com IA
4. governança de consumo e monetização da IA
5. analytics
6. contatos e automações futuras

O escopo atual do MVP cobre a fundação necessária para lançar o núcleo de blog + automação editorial.

---

## 3. Product Principles

- arquitetura multi-tenant desde o início
- IA como capability operacional do produto
- fluxo editorial auditável
- separação entre painel administrativo e blog público
- execução assíncrona para tarefas pesadas
- escalabilidade gradual sem complexidade prematura
- controle centralizado do runtime de IA pela plataforma

---

## 4. Core User Flows

### 4.1 Criar workspace e site

1. usuário cria conta
2. usuário cria workspace
3. usuário cria o primeiro site/blog
4. blog fica disponível publicamente

### 4.2 Configurar automação editorial

1. usuário acessa o painel de automação
2. define palavras-chave base
3. define idioma
4. define nível de profundidade
5. define frequência
6. define modo de aprovação
7. salva configuração
8. dispara a pesquisa inicial de temas

### 4.3 Curar temas sugeridos

1. sistema gera lista de temas
2. usuário visualiza sugestões
3. usuário aprova, edita ou rejeita temas
4. temas aprovados viram briefings

### 4.4 Gerar e revisar conteúdo

1. sistema gera o rascunho do post
2. usuário revisa
3. usuário edita, aprova, rejeita, agenda ou publica manualmente

### 4.5 Acompanhar a operação

1. usuário acompanha jobs no painel
2. identifica falhas ou conclusões
3. segue do briefing para draft e do draft para publicação

---

## 5. Functional Requirements

### 5.1 Tenancy e acesso

- o sistema deve suportar múltiplos tenants
- cada tenant deve enxergar apenas seus próprios dados
- usuários podem pertencer a um tenant com papéis distintos
- o painel administrativo deve funcionar em domínio centralizado

### 5.2 Site e blog

- criar site/blog
- definir idioma
- usar tema inicial padrão
- configurar subdomínio
- publicar páginas e posts

### 5.3 Conteúdo manual

- criar post manualmente
- editar post
- salvar rascunho
- agendar publicação
- publicar imediatamente

### 5.4 Conteúdo com IA

- configurar parâmetros editoriais
- gerar temas a partir de pesquisa
- aprovar temas
- gerar briefings
- gerar artigos
- revisar e ajustar

### 5.5 Configuração de IA

- configurar preferências editoriais
- definir tom
- definir estilo
- definir profundidade
- tratar `modelo` como variável relevante de produto, custo e consumo

### 5.6 Jobs e processamento assíncrono

- tarefas demoradas devem rodar via jobs
- jobs devem possuir status
- jobs devem registrar erro
- jobs devem permitir retry
- o pipeline central deve suportar pesquisa, briefing e draft

### 5.7 Consumo e monetização de IA

- a IA deve ser tratada como recurso da plataforma
- o usuário não fornece API key própria no MVP
- o produto deverá controlar consumo de IA em evolução futura
- o consumo deverá considerar a operação executada e o modelo utilizado
- o produto deverá evoluir para exibir governança de créditos ao usuário

---

## 6. IA da plataforma

### Decisão de produto

No MVP e na direção atual do produto:

- a IA é vendida pela plataforma
- o usuário não conecta token próprio
- o runtime é gerenciado internamente

Essa decisão reduz fricção de entrada e dá mais controle sobre experiência, custo e previsibilidade operacional.

### Papel do modelo

O `modelo` continua importante porque afeta:

- qualidade
- latência
- consumo de tokens
- custo operacional

Mesmo quando não estiver exposto na UI do MVP, ele deve existir no desenho de produto e na lógica comercial.

---

## 7. Sistemática conceitual de créditos

Créditos são a unidade comercial futura de consumo de IA da plataforma.

### Princípios

- o produto não precisa fechar pricing neste momento
- o produto não precisa fechar billing neste momento
- o PRD precisa fechar a lógica conceitual

### Leitura esperada

- cada operação de IA consome recursos
- o consumo varia conforme a natureza da operação
- o consumo também varia conforme o modelo utilizado

### Exemplos de operações que tendem a consumir créditos

- pesquisa de temas
- geração de briefing
- geração de draft
- futuras revisões automáticas
- futura publicação automatizada, se envolver processamento adicional

### Evolução futura

O produto deverá evoluir para:

- registrar consumo por operação
- associar consumo ao workspace/tenant
- mostrar saldo ou histórico de uso
- permitir diferenciação por plano

---

## 8. Non-Functional Requirements

- arquitetura preparada para multi-tenancy
- uso de PostgreSQL via Supabase
- autenticação via Supabase Auth
- armazenamento via Supabase Storage
- isolamento por tenant via RLS
- uso de Next.js no painel
- worker em processo separado para tarefas de IA
- documentação adequada para desenvolvimento Agent-First
- estrutura modular para evolução futura

---

## 9. Out of Scope for MVP

- CRM completo
- automação avançada de e-mail
- analytics avançado
- construtor completo de sites
- provider externo conectado pelo cliente
- API key própria do usuário
- billing completo de créditos nesta fase

---

## 10. Technical Decisions Already Consolidated

- painel administrativo em domínio centralizado
- blogs públicos separados do app autenticado
- Supabase como camada principal de infraestrutura
- jobs em worker separado
- IA operada pela plataforma
- modelo como dimensão importante de custo e qualidade
- monetização futura baseada em consumo/créditos

---

## 11. MVP Success Criteria

- usuário consegue criar workspace e site funcional
- usuário consegue operar o CMS e publicar conteúdo
- usuário consegue configurar automação de conteúdo
- sistema gera temas com base em parâmetros editoriais
- usuário consegue aprovar temas
- sistema gera briefings
- sistema gera drafts reais no CMS
- jobs ficam rastreáveis por tenant
- dados permanecem isolados por tenant

---

## 12. Próximo fechamento de produto

Os próximos pontos que aproximam o produto do fechamento completo do MVP são:

- implementar `publish_post`
- criar superfície real para `ai_rules`
- melhorar observabilidade de jobs
- preparar a camada de consumo por modelo/créditos
