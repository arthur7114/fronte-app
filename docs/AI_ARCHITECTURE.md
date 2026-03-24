# AI Architecture

## Overview

Este documento descreve a arquitetura de IA do produto no estado atual do MVP.

A IA hoje é responsável por:

- pesquisar temas
- gerar briefings
- gerar drafts
- aplicar preferências editoriais do tenant
- consumir regras de IA quando elas existirem no banco

O desenho do produto continua AI-first, mas o pipeline ativo ainda é deliberadamente enxuto.

---

## Diretriz operacional

No MVP atual:

- a IA é operada pela plataforma
- o usuário não conecta token próprio
- o runtime é centralizado no ambiente do projeto

O usuário configura preferências editoriais e automação. A infraestrutura de LLM permanece sob controle da plataforma.

---

## Pipeline ativo hoje

O fluxo real já implementado é:

`keywords_seed -> research_topics -> topic_candidates -> aprovação humana -> generate_brief -> content_brief -> generate_post -> post em draft`

Esse é o loop principal já validado no produto.

---

## Etapas do pipeline

### 1. Configuração editorial

O tenant define:

- `keywords_seed`
- `language`
- `frequency`
- `approval_required`
- `tone_of_voice`
- `writing_style`
- `expertise_level`

Essas informações alimentam os prompts e o comportamento do worker.

### 2. Research

O job `research_topics` usa a configuração editorial do tenant e gera `topic_candidates`.

Saída:

- sugestões de tema
- score/origem quando disponível

### 3. Curadoria humana

O usuário revisa os temas sugeridos e pode:

- aprovar
- rejeitar
- editar antes de aprovar

O MVP continua com humano no loop entre tema, briefing e draft.

### 4. Brief generation

O job `generate_brief` transforma um tema aprovado em `content_brief`.

Elementos esperados:

- tema
- ângulo
- keywords
- estrutura editorial mínima

### 5. Draft generation

O job `generate_post` transforma o briefing em um post real no CMS.

Saída:

- post criado em `draft`

---

## Preferências editoriais

O sistema já usa uma camada explícita de preferências do tenant.

Campos atuais:

- `tone_of_voice`
- `writing_style`
- `expertise_level`

Essas preferências fazem parte do contrato real do produto, não só da arquitetura teórica.

---

## Regras de IA

O schema possui `ai_rules` e o worker já consegue consumi-las.

Estado atual:

- capacidade de backend existe
- UI e loop de produto ainda não estão completos

Isso significa que `ai_rules` fazem parte da arquitetura, mas ainda não da experiência fechada do MVP.

---

## Runtime, provider e modelo

### Runtime atual

- IA da plataforma
- credenciais mantidas no ambiente do projeto
- operação centralizada

### Provider

Hoje o runtime ativo está centrado em OpenAI via ambiente da plataforma.

O produto pode evoluir para model routing ou abstração maior de provider no futuro, mas isso não é a experiência atual do MVP.

### Modelo

O `modelo` é uma variável importante do produto porque interfere em:

- qualidade de saída
- latência
- consumo de tokens
- custo operacional

Mesmo quando não estiver exposto na UI atual, ele deve ser tratado como dimensão real de produto e monetização.

---

## Economia de uso

A direção do produto é vender capacidade de IA da própria plataforma.

Isso implica:

- sem BYO key no MVP
- consumo controlado internamente
- futura leitura comercial baseada em créditos

O débito de consumo tende a variar conforme:

- tipo de operação
- volume de tokens
- modelo utilizado

---

## O que ainda não está ativo

Estas etapas continuam como evolução futura:

- revisão automática mais rica
- publicação automática
- aprendizado completo a partir de rejeições
- política de consumo exposta ao usuário
- seleção de modelo na UI, se isso entrar no fechamento comercial do módulo

---

## Próximos passos arquiteturais naturais

- implementar `publish_post`
- fechar a camada de `ai_rules`
- aumentar observabilidade do pipeline
- conectar a arquitetura de IA à futura sistemática de créditos

O ponto importante é que a arquitetura já saiu do papel: o pipeline principal existe e roda com jobs reais.
