import { ARTICLES, type ArticleItem } from "@/lib/strategies"

export type BlogPost = {
  slug: string
  articleId: string
  title: string
  excerpt: string
  category: string
  cover: string
  publishedAt: string
  readTime: string
  author: {
    name: string
    role: string
    initials: string
  }
  keywords: string[]
  body: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "h3"; text: string }
    | { type: "quote"; text: string; cite?: string }
    | { type: "ul"; items: string[] }
    | { type: "cta" }
  >
}

const DEFAULT_AUTHOR = {
  name: "Dra. Helena Rocha",
  role: "CRO-SP 54.321 · Dentista há 12 anos",
  initials: "HR",
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "10-dicas-para-manter-os-dentes-brancos-em-casa",
    articleId: "a1",
    title: "10 Dicas para Manter os Dentes Brancos em Casa",
    excerpt:
      "Técnicas simples e eficazes para preservar o brilho natural do seu sorriso sem precisar de tratamentos caros.",
    category: "Saúde Bucal",
    cover: "/blog/dentes-brancos.jpg",
    publishedAt: "5 de abril de 2026",
    readTime: "6 min de leitura",
    author: DEFAULT_AUTHOR,
    keywords: ["clareamento dental", "dentes brancos", "higiene bucal"],
    body: [
      {
        type: "p",
        text: "Manter os dentes brancos em casa é mais sobre consistência do que sobre produtos caros. Neste guia, reunimos as práticas que recomendamos aos nossos pacientes no dia a dia e que fazem a maior diferença no longo prazo.",
      },
      { type: "h2", text: "1. Escove os dentes corretamente, não com mais força" },
      {
        type: "p",
        text: "A ideia de que escovar com mais vigor deixa o sorriso mais branco é um mito perigoso. Escovação agressiva desgasta o esmalte e expõe a dentina — que é naturalmente amarelada. O segredo é técnica, não força: movimentos curtos, inclinação de 45° em relação à gengiva e uma escova macia.",
      },
      { type: "h2", text: "2. Use fio dental todos os dias" },
      {
        type: "p",
        text: "O fio dental remove placa entre os dentes que a escova não alcança. Essa placa acumulada escurece as interfaces entre os dentes e cria uma aparência opaca. Dois minutos de fio dental por dia já são suficientes para manter o sorriso mais uniforme.",
      },
      { type: "cta" },
      { type: "h2", text: "3. Reduza bebidas pigmentadas" },
      {
        type: "p",
        text: "Café, vinho tinto, chá preto e refrigerantes escuros manchaam o esmalte ao longo do tempo. Você não precisa eliminá-los, mas vale beber com canudo quando possível e enxaguar a boca com água depois.",
      },
      {
        type: "ul",
        items: [
          "Prefira beber café e chá até 30 minutos antes da escovação",
          "Aguarde 30 minutos após ingerir ácidos antes de escovar",
          "Hidrate-se com água entre as refeições",
        ],
      },
      { type: "h2", text: "4. Inclua alimentos que limpam naturalmente" },
      {
        type: "p",
        text: "Maçãs, cenouras, aipo e pepino funcionam como escovas naturais: a mastigação deles estimula saliva e remove pigmentos superficiais. Queijos e laticínios também ajudam porque aumentam o pH e reforçam o esmalte.",
      },
      { type: "h2", text: "5. Use creme dental com flúor e cuidado com abrasivos" },
      {
        type: "p",
        text: "Cremes dentais clareadores funcionam — mas muitos são excessivamente abrasivos. Procure selos de aprovação odontológica e evite o uso contínuo de fórmulas com carvão ativado, que tendem a desgastar o esmalte.",
      },
      {
        type: "quote",
        text: "Clareamento sustentável é consequência de rotina, não de um produto milagroso.",
        cite: "Dra. Helena Rocha",
      },
      { type: "h2", text: "6 a 10. Hábitos que fazem diferença no longo prazo" },
      {
        type: "ul",
        items: [
          "Beba água após refeições com alimentos pigmentados",
          "Não fume — o tabaco é um dos maiores causadores de manchas",
          "Mastigue chiclete sem açúcar depois das refeições",
          "Faça limpeza profissional a cada 6 meses",
          "Avalie um clareamento de consultório 1x por ano, se indicado",
        ],
      },
      {
        type: "p",
        text: "Se seus dentes continuam amarelados mesmo com todas essas práticas, pode existir um fator intrínseco — como uso de tetraciclina na infância ou envelhecimento natural da dentina. Nesses casos, só o clareamento profissional resolve.",
      },
    ],
  },
  {
    slug: "quanto-custa-um-implante-dentario-em-2026",
    articleId: "a2",
    title: "Quanto Custa um Implante Dentário em 2026",
    excerpt:
      "Um guia direto sobre valores, etapas e o que realmente influencia o custo de um implante dentário hoje.",
    category: "Implantes",
    cover: "/blog/implante-dentario.jpg",
    publishedAt: "2 de abril de 2026",
    readTime: "8 min de leitura",
    author: DEFAULT_AUTHOR,
    keywords: ["implante dentário", "preço implante", "valor implante"],
    body: [
      {
        type: "p",
        text: "Se você pesquisou recentemente, percebeu que o preço do implante varia muito. A diferença entre uma clínica e outra pode passar de R$ 4.000 para o mesmo procedimento. Neste artigo, explicamos onde esse dinheiro realmente está.",
      },
      { type: "h2", text: "Faixa de preço em 2026" },
      {
        type: "p",
        text: "Em São Paulo, um implante unitário com coroa em 2026 custa, em média, entre R$ 3.500 e R$ 9.000. Esse valor engloba três etapas distintas: o implante em si (o pino), o pilar (conector) e a coroa protética.",
      },
      {
        type: "ul",
        items: [
          "Implante (pino de titânio): R$ 1.200 a R$ 3.500",
          "Pilar protético: R$ 400 a R$ 1.200",
          "Coroa (porcelana ou zircônia): R$ 1.500 a R$ 4.500",
        ],
      },
      { type: "cta" },
      { type: "h2", text: "O que faz o preço variar" },
      {
        type: "h3",
        text: "1. Marca do implante",
      },
      {
        type: "p",
        text: "Implantes premium (como Straumann, Nobel Biocare) custam mais por oferecerem taxas de sucesso acima de 97% a longo prazo e compatibilidade com peças de reposição por décadas.",
      },
      {
        type: "h3",
        text: "2. Material da coroa",
      },
      {
        type: "p",
        text: "Zircônia custa mais que porcelana pura, mas é praticamente indistinguível do dente natural e mais resistente. Para dentes frontais, geralmente compensa.",
      },
      {
        type: "h3",
        text: "3. Necessidade de enxerto ósseo",
      },
      {
        type: "p",
        text: "Se você perdeu o dente há muito tempo, é comum o osso ter sofrido reabsorção. Nesse caso, pode ser necessário um enxerto — que soma R$ 800 a R$ 3.000 ao tratamento.",
      },
      {
        type: "quote",
        text: "O implante mais caro não é o melhor; o melhor implante é aquele indicado para o seu caso clínico específico.",
      },
      { type: "h2", text: "Formas de pagamento e financiamento" },
      {
        type: "p",
        text: "A maior parte das clínicas parcela em até 18x no cartão e algumas oferecem financiamento direto com aprovação em minutos. Planos odontológicos raramente cobrem implantes — mas cobrem as etapas preparatórias (extração, avaliação, enxerto em casos específicos).",
      },
      { type: "h2", text: "Vale a pena fazer implante em outros estados?" },
      {
        type: "p",
        text: "Em tese, sim, você pode reduzir até 30% do custo. Mas lembre-se: implante exige pelo menos 3 consultas ao longo de 4 a 6 meses. Some passagens, hospedagem e o risco de não ter acompanhamento imediato em caso de complicação.",
      },
    ],
  },
  {
    slug: "melhor-dentista-em-moema-guia-2026",
    articleId: "a6",
    title: "Melhor Dentista em Moema: Guia 2026",
    excerpt:
      "Como escolher uma clínica odontológica em Moema com segurança e sem cair em armadilhas de preço.",
    category: "Guia Local",
    cover: "/blog/clinica-moema.jpg",
    publishedAt: "3 de abril de 2026",
    readTime: "5 min de leitura",
    author: DEFAULT_AUTHOR,
    keywords: ["dentista moema", "dentista são paulo", "clínica odontológica"],
    body: [
      {
        type: "p",
        text: "Moema tem dezenas de clínicas odontológicas num raio de poucos quarteirões. Escolher bem faz diferença não só no preço, mas principalmente na qualidade do que será feito na sua boca — um investimento que fica com você por décadas.",
      },
      { type: "h2", text: "O que avaliar antes de marcar a primeira consulta" },
      {
        type: "ul",
        items: [
          "CRO ativo do profissional responsável (consulte no site do Conselho)",
          "Registro sanitário vigente da clínica",
          "Avaliações recentes no Google Maps e Doctoralia",
          "Estrutura: sala de raio-x, esterilização visível, cadeiras atualizadas",
          "Orçamento detalhado por escrito, sem insistência para fechar na hora",
        ],
      },
      { type: "cta" },
      { type: "h2", text: "Sinais de alerta" },
      {
        type: "p",
        text: "Desconfie de clínicas que oferecem tratamentos completos com desconto agressivo se você fechar no mesmo dia. Bons planos de tratamento exigem diagnóstico cuidadoso — e diagnóstico leva tempo.",
      },
      { type: "h2", text: "Primeira consulta: o que esperar" },
      {
        type: "p",
        text: "Uma primeira consulta bem feita em Moema dura 40 a 60 minutos. Inclui anamnese (histórico), exame clínico completo, radiografia panorâmica quando indicada e apresentação do plano de tratamento com alternativas.",
      },
      {
        type: "quote",
        text: "O melhor dentista não é o mais próximo — é aquele com quem você se sente à vontade para fazer perguntas.",
      },
      { type: "h2", text: "Nossa abordagem na Clínica Dental" },
      {
        type: "p",
        text: "Atendemos em Moema há mais de 12 anos. Acreditamos em diagnóstico detalhado, orçamento transparente e tratamentos minimamente invasivos. Se quiser conhecer, a primeira avaliação é sem compromisso.",
      },
    ],
  },
]

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function getPublishedArticles(): ArticleItem[] {
  return ARTICLES.filter((a) => a.status === "published")
}

export function postToArticle(post: BlogPost): ArticleItem | undefined {
  return ARTICLES.find((a) => a.id === post.articleId)
}
