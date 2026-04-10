# Brief de Implementação para Ferramenta de Código

## Objetivo
Criar um MVP de um micro SaaS PLG para usuários leigos que desejam aumentar presença orgânica por meio de SEO e GEO.

## O produto deve permitir
1. criação de blog por templates
2. CMS próprio e integração com CMS externo
3. onboarding via IA para coletar briefing do negócio
4. geração de estratégia de palavras-chave com sugestões, dificuldade, potencial e priorização
5. classificação das palavras e pautas por estágios da jornada de compra: conhecimento, atração, avaliação e decisão
6. geração de plano editorial semanal e mensal
7. upload de referências em texto e PDF
8. configuração de faixa de tamanho dos artigos
9. geração de artigos com IA, incluindo título, meta description e conteúdo completo
10. modo automático ou modo com validação manual
11. edição de artigos antes e depois da publicação
12. publicação direta no blog
13. área de tendências com insights semanais baseados em temas gerais, nicho e localização
14. analytics com tráfego, CTR, ranking, palavras com melhor performance, páginas com melhor performance, cliques em CTA e visão por etapa da jornada
15. uma camada GEO usando a mesma estrutura do SEO, mas com narrativa orientada à presença em IA
16. integração com Google Analytics, Google Tag Manager, Meta Pixel e Meta Conversions API
17. limites por plano, incluindo quantidade de artigos e acesso a funcionalidades

## Estrutura principal do produto
- Dashboard
- Meu Blog
- Estratégia
- Plano de Conteúdo
- Artigos
- Tendências
- Analytics
- Configurações

## Diretrizes de experiência
- linguagem simples
- onboarding intuitivo
- foco em usuários não técnicos
- experiência extremamente fluida

## Recomendação para uso com agentes de código
Ao implementar:
- tratar `Projeto` como entidade central
- separar domínio de conteúdo, tracking e billing
- começar por fluxo de ativação completo antes de sofisticar analytics
- priorizar clareza de estados e ações do usuário
- manter SEO e GEO como camadas paralelas sobre a mesma estrutura-base

## Resumo final
Este material já é suficiente para orientar visão de produto, arquitetura inicial do MVP, backlog base e execução assistida por ferramentas de código.
