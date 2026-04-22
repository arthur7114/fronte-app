# Arquitetura de Informacao, Telas e Fluxos

> Versao: 4.0 - Abril 2026
> Fonte de verdade visual e estrutural: `prototipo-visual/`
> Fonte de verdade do design system: `prototipo-visual/design-system/` e `prototipo-visual/app/globals.css`

---

## Principio central

O front do app real deve seguir o prototipo visual antes da implementacao antiga. O backend, loaders e actions devem servir essa experiencia, nao redefini-la.

Fluxo principal:

```text
Conta -> Workspace -> Site -> Estrategia/briefing -> Dashboard -> Operacao recorrente
```

Navegacao recorrente atual:

```text
Dashboard
Meu Blog
Estrategias
Artigos
Calendario
Tendencias
Analytics
Newsletter
Leads
Configuracoes
```

---

## Fluxos principais

### Ativacao

1. usuario entra por `/login` ou `/cadastro`
2. cria workspace em `/onboarding`
3. cria site em `/onboarding/site`
4. segue para a etapa visual de escolha/estrategia do prototipo quando aplicavel
5. conclui briefing minimo exigido pelo backend em `/onboarding/briefing`
6. entra em `/dashboard`

Rotas visuais adicionais do prototipo:

- `/onboarding/escolher`
- `/onboarding/estrategia`
- `/onboarding/resumo`
- `/onboarding/estrategias`

### Operacao recorrente

1. `/dashboard` mostra resumo, proximas acoes e desempenho
2. `/dashboard/estrategias` concentra linhas editoriais
3. `/dashboard/artigos` concentra producao, revisao e fila
4. `/dashboard/calendario` organiza agenda editorial
5. `/dashboard/blog` configura e visualiza o canal
6. `/dashboard/newsletter` e `/dashboard/leads` expandem captura e relacionamento

---

## Arvore de rotas canonica

```text
/
  -> redireciona para /login, /onboarding ou /dashboard

/login
/cadastro

/onboarding
  /site
  /briefing
  /escolher
  /estrategia
  /resumo
  /estrategias

/dashboard
  /blog
  /estrategias
    /nova
    /[id]
  /artigos
    /novo
    /[id]
  /calendario
  /tendencias
  /analytics
  /newsletter
  /leads
  /configuracoes
  /estrategia
    /[id] -> redirect de compatibilidade

/blog
  /[slug]

/design-system
```

### Dominios personalizados futuros

Dominios personalizados de clientes sao uma capacidade planejada, mas fora do escopo imediato.
Quando implementados, o subdominio publico da plataforma e o dominio customizado devem resolver para o mesmo site publico.

Fluxo recomendado:

- o cliente configura um subdominio como `blog.cliente.com.br`
- o DNS usa `CNAME` com nome `blog` apontando para o dominio canonico da plataforma, por exemplo `cname.fronte.app`
- o produto salva o dominio em `sites.custom_domain` com status inicial `pending_dns`
- uma verificacao confirma o CNAME antes de marcar o dominio como `active`
- a infraestrutura emite e renova SSL automaticamente
- a renderizacao publica resolve o `site` pelo header `host` quando a requisicao vier pelo dominio customizado

O primeiro suporte deve priorizar subdominio customizado via CNAME. Dominio raiz (`cliente.com.br`) fica fora da primeira entrega porque exige `A/AAAA`, `ALIAS` ou `ANAME`, variando por provedor DNS.

### Compatibilidade

- `/dashboard/estrategia` redireciona para `/dashboard/estrategias`.
- `/dashboard/estrategia/[id]` redireciona para `/dashboard/estrategias/[id]`.
- `/auth/*` e `/app/*` permanecem como redirects quando possuem equivalente.
- `/app/aprovacoes` e `/app/jobs` seguem como legado por URL direta, fora da navegacao principal.

---

## Shell autenticada

A shell do dashboard segue o prototipo:

- sidebar fixa no desktop
- header com seletor de projeto, busca, notificacoes e usuario
- conteudo em `main` com padding responsivo
- dados reais de usuario/workspace/site injetados no header quando disponiveis

---

## Estrutura por tela

| Rota | Intencao |
|---|---|
| `/dashboard` | resumo operacional e proximas acoes |
| `/dashboard/blog` | preview, template, personalizacao e configuracoes do blog |
| `/dashboard/estrategias` | lista multi-estrategia com cards, status e acoes |
| `/dashboard/estrategias/nova` | criacao visual de estrategia por preset, formulario ou assistente |
| `/dashboard/estrategias/[id]` | detalhe de estrategia com assistente, formulario e preview |
| `/dashboard/artigos` | lista editorial, editor, geracao em massa e fila de producao |
| `/dashboard/calendario` | agenda editorial e itens sem data |
| `/dashboard/tendencias` | oportunidades e sinais externos |
| `/dashboard/analytics` | leitura de performance SEO/GEO |
| `/dashboard/newsletter` | campanhas, assinantes e performance de newsletter |
| `/dashboard/leads` | captura e gestão de contatos |
| `/dashboard/configuracoes` | configuracoes unificadas |
| `/blog` e `/blog/[slug]` | experiencia publica do blog no formato do prototipo |
| `/design-system` | visualizacao viva dos tokens e componentes |

---

## Regras de implementacao

- `prototipo-visual/` manda em layout, hierarquia, densidade, navegacao e estados visuais.
- O design system do prototipo manda em tokens, tipografia, cores, radius e componentes.
- Mocks temporarios sao aceitaveis quando faltam integracoes, desde que documentados.
- Dados reais devem substituir mocks progressivamente sem alterar a composicao visual.
- A UI antiga nao deve ser usada como fallback estrutural das telas principais.
