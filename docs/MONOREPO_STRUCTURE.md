# Monorepo Structure

## What Is a Monorepo

Monorepo é uma estratégia onde todo o sistema vive em um único repositório.

Em vez de separar frontend, worker e bibliotecas em vários repositórios, tudo fica junto.

Isso facilita:

- Compartilhamento de tipos
- Compartilhamento de utilitários
- Consistência de dependências
- Documentação centralizada
- Trabalho Agent-First

---

## Recommended Structure

```text
repo/
  apps/
    web/
    worker/
  packages/
    db/
    ai/
    automation/
    ui/
    tenancy/
    shared/
  docs/
  scripts/
```

### `apps/web`

Contém a aplicação Next.js.

Responsável por:

- Dashboard
- APIs
- Auth
- UI do CMS
- Renderização pública do blog

### `apps/worker`

Contém o processo de background.

Responsável por:

- Polling de jobs (conecta no Supabase via connection string)
- Execução do pipeline de IA
- Publicação agendada
- Tarefas assíncronas

### `packages/db`

Responsável por:

- Supabase client configurado
- Types geradas do schema
- Queries compartilhadas
- Helpers de acesso ao banco
- Migrations (via Supabase CLI)

### `packages/ai`

Responsável por:

- Integração com providers
- Prompt builder
- Agents
- Memory rules
- Parsing de respostas

### `packages/automation`

Responsável por:

- Definição dos *job types*
- Handlers
- Scheduler logic
- Orquestração do pipeline

### `packages/ui`

Responsável por:

- Design system
- Componentes reutilizáveis
- Padrões visuais compartilhados

### `packages/tenancy`

Responsável por:

- Resolução de tenant
- Resolução por domínio/subdomínio
- Guards de acesso
- Helpers de isolamento

### `packages/shared`

Responsável por:

- Tipos comuns
- Constantes
- Validações
- Utilitários genéricos

### `docs`

Documentação técnica e funcional.

Esses arquivos servem como referência para humanos e agentes.

---

## Why This Matters

Essa estrutura reduz acoplamento e facilita evolução futura. 
Também evita que a lógica de IA ou de multitenancy fique espalhada em locais inconsistentes.