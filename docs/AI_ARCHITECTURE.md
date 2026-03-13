# AI Architecture

## Overview

Este documento descreve a arquitetura de inteligência artificial da plataforma.

A IA é responsável por:

- pesquisar temas
- analisar concorrentes
- gerar briefs de conteúdo
- escrever artigos
- revisar conteúdo
- aplicar preferências editoriais do usuário
- agendar publicações

A arquitetura segue o modelo **Agent Pipeline**, onde múltiplos agentes executam tarefas específicas.

---

# AI Pipeline

O pipeline principal de geração de conteúdo segue o fluxo:

keyword seeds
→ research
→ topic clustering
→ topic suggestions
→ user approval
→ brief generation
→ article generation
→ review
→ scheduling
→ publishing

Cada etapa pode gerar um job executado por um worker.

---

# AI Agents

## Research Agent

Responsável por:

- pesquisar palavras-chave
- analisar resultados de busca
- identificar concorrentes
- extrair headings e estruturas de artigos

Inputs:

- seed keywords
- language
- niche

Outputs:

- topic_candidates
- competitor_sources

---

## Topic Clustering Agent

Responsável por:

- agrupar temas similares
- eliminar redundâncias
- sugerir tópicos de alto valor

Outputs:

topic suggestions list

---

## Brief Generator Agent

Gera um brief editorial contendo:

- título sugerido
- palavras-chave
- ângulo do artigo
- estrutura de headings
- intenção de busca

---

## Content Writer Agent

Responsável por:

- gerar o artigo completo
- aplicar estilo editorial
- incluir headings estruturados
- gerar meta description

Output:

post draft

---

## Content Reviewer Agent

Responsável por:

- verificar consistência
- verificar redundâncias
- aplicar regras editoriais
- aplicar regras de IA aprendidas

---

## Publishing Agent

Responsável por:

- agendar posts
- publicar posts
- atualizar sitemap
- atualizar RSS

---

# AI Memory System

A IA possui três tipos de memória.

## Editorial Preferences

Preferências definidas pelo usuário.

Exemplos:

tone_of_voice  
expertise_level  
target_audience

---

## AI Rules

Regras explícitas criadas a partir de feedback do usuário.

Exemplo:

avoid_topics  
avoid_style  
mandatory_sections

---

## Rejection Learning

Quando um post é rejeitado:

usuário pode marcar:

"usar como aprendizado"

Isso gera uma regra persistente.

---

# Prompt Assembly

Prompts enviados ao modelo são construídos combinando:

base prompt  
+ editorial preferences  
+ ai rules  
+ content brief

---

# AI Providers

O sistema permite dois modos.

## User API Mode

Usuário fornece sua própria API key.

Exemplos:

OpenAI  
Anthropic  
Google AI

---

## Platform Mode

Usuário utiliza créditos da plataforma.

---

# AI Settings (Tenant Level)

Campos configuráveis:

ai_provider  
api_key  
model  
temperature  
max_tokens  
tone_of_voice  
writing_style  
expertise_level

---

# Future Extensions

Possíveis evoluções:

automatic content refresh  
SERP monitoring  
automatic internal linking  
content gap analysis