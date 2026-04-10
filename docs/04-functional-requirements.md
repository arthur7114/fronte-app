# Requisitos Funcionais

## 1. Blog
- o sistema deve permitir criação de blog por template
- o usuário deve poder editar o blog
- o sistema deve permitir CMS próprio
- o sistema deve permitir integração com CMS externo
- o sistema deve publicar direto no blog

## 2. Briefing
- o sistema deve oferecer onboarding conversacional com IA
- o sistema deve consolidar o briefing automaticamente
- o usuário deve poder revisar e editar o briefing
- o briefing deve alimentar a estratégia do projeto

### Estado atual

- implementado: formulário persistido de briefing do negócio em `/app/briefing`
- implementado: revisão e edição manual do briefing
- parcialmente implementado: resumo consolidado simples gerado a partir dos campos preenchidos
- pendente: onboarding conversacional com IA
- pendente: uso automático do briefing para gerar estratégia de palavras-chave

## 3. Estratégia de palavras-chave
- o sistema deve aceitar palavras informadas pelo usuário
- o sistema deve sugerir palavras adicionais
- o sistema deve mostrar dificuldade relativa
- o sistema deve mostrar potencial estimado
- o sistema deve priorizar oportunidades

## 4. Jornada de compra
- o sistema deve classificar palavras e temas por estágio
- o sistema deve identificar short tail e long tail
- o sistema deve explicar o papel estratégico de cada tema

## 5. Plano editorial
- o sistema deve gerar temáticas com base nas palavras aprovadas
- o sistema deve justificar cada sugestão
- o sistema deve gerar calendário semanal e mensal
- o usuário deve poder ajustar o plano

## 6. Referências e configuração editorial
- o usuário deve poder subir PDFs e textos
- o sistema deve usar esse material como contexto
- o usuário deve poder escolher faixa de tamanho do artigo
- se não houver referência, o sistema deve sugerir um padrão

## 7. Produção
- o sistema deve gerar título, meta description e artigo
- o sistema deve ter modo automático e modo com aprovação
- o sistema deve permitir regeneração
- o sistema deve permitir edição antes e depois da publicação

## 8. Tendências
- o sistema deve disponibilizar insights semanais
- o sistema deve considerar tendências gerais, nicho e localização
- o sistema deve permitir transformar insights em pauta

## 9. Analytics
- o sistema deve exibir tráfego, CTR e ranking
- o sistema deve exibir performance por palavra e por página
- o sistema deve destacar melhores e piores conteúdos
- o sistema deve exibir cliques e conversões atribuídas
- o sistema deve agrupar desempenho por estágio da jornada
- o sistema deve oferecer visão SEO e GEO

## 10. Limites por plano
- o sistema deve aplicar limites por plano
- o sistema deve restringir quantidade de artigos
- o sistema deve restringir funcionalidades conforme o plano
