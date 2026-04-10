# Requisitos Não Funcionais, Integrações, Riscos e Premissas

## Requisitos não funcionais
- interface simples e intuitiva
- linguagem não técnica
- onboarding rápido
- boa performance de carregamento
- arquitetura compatível com automação escalável
- segurança no upload de arquivos
- rastreabilidade básica das ações da IA
- navegação clara
- compatibilidade com uso por pequenas empresas
- experiência responsiva

## Integrações necessárias

### Obrigatórias no MVP ou logo após
- Google Analytics
- Google Tag Manager
- Meta Pixel
- Meta Conversions API

### Possíveis integrações futuras
- Google Search Console
- WordPress
- Webflow
- Framer
- CMSs adicionais

## Riscos principais
- conteúdo genérico demais
- dificuldade do usuário confiar em automação completa
- blog simples demais e pouco personalizável
- analytics complexo demais para o público
- baixa aderência entre sugestões e realidade do negócio
- atribuição de conversão incompleta
- dificuldade de mensuração real da camada GEO no início

## Premissas
- o público aceita templates prontos em troca de simplicidade
- o público valoriza velocidade mais do que customização profunda
- o usuário quer orientação, não só dados brutos
- a automação terá melhor adoção quando acompanhada de explicações
- GEO no MVP pode compartilhar boa parte da estrutura de SEO

## Configuracao Supabase
- o app usa Supabase via `@supabase/supabase-js` e `@supabase/ssr`
- os clients ficam centralizados em `packages/db`
- o web app consome os helpers em `apps/web/src/lib/supabase`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` sao aceitos para compatibilidade
- `.env.local` fica fora do Git e guarda as credenciais publicas locais
