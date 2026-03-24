import type { PostStatus } from "@super/shared";

export type DemoSite = {
  name: string;
  subdomain: string;
  language: string;
  theme: string;
  tagline: string;
};

export type DemoPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  status: PostStatus;
  updatedAt: string;
  publishedAt: string | null;
};

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Rascunho",
  in_review: "Em revisao",
  approved: "Aprovado",
  scheduled: "Agendado",
  published: "Publicado",
  rejected: "Rejeitado",
};

export const demoSite: DemoSite = {
  name: "Super MVP",
  subdomain: "super-mvp",
  language: "pt-BR",
  theme: "Editorial neutro",
  tagline: "Linha editorial inicial para validar o fluxo do produto.",
};

export const demoPosts: DemoPost[] = [
  {
    id: "manifesto-editorial",
    title: "Manifesto editorial para o primeiro ciclo",
    slug: "manifesto-editorial",
    excerpt:
      "Definindo a voz do site antes de automatizar qualquer coisa: foco, cadencia e criterios de publicacao.",
    content: [
      "Este primeiro texto marca o tom do blog. Ele explica o problema que o site resolve, o tipo de audiencia que queremos atrair e o ritmo editorial que o time vai sustentar daqui para frente.",
      "A proposta do MVP e simples: publicar com clareza, manter consistencia e deixar a automacao para depois, quando o fluxo manual estiver claro para todo mundo.",
    ],
    status: "published",
    updatedAt: "23 mar 2026",
    publishedAt: "22 mar 2026",
  },
  {
    id: "roteiro-conteudo",
    title: "Roteiro de conteudo para a semana",
    slug: "roteiro-conteudo-semanal",
    excerpt:
      "Uma pauta enxuta para tirar o site do zero sem excesso de temas nem ruído editorial.",
    content: [
      "A pauta da semana organiza tres frentes: explicacao do produto, comparacao com alternativas e uma lista de aprendizados do processo.",
      "Cada tema precisa ter um objetivo claro: atrair visitantes, ensinar o leitor ou gerar uma conversao especifica.",
    ],
    status: "published",
    updatedAt: "21 mar 2026",
    publishedAt: "21 mar 2026",
  },
  {
    id: "brief-seed",
    title: "Brief de tema para pesquisa inicial",
    slug: "brief-tema-inicial",
    excerpt:
      "A primeira coleta de temas cria o mapa editorial que o restante do sistema vai reaproveitar.",
    content: [
      "Os temas iniciais ainda estao em revisao. O objetivo deste rascunho e validar a estrutura do briefing, nao o volume de producao.",
      "Quando o fluxo automatizado entrar, este brief vira a base para gerar novas pautas com muito menos retrabalho.",
    ],
    status: "in_review",
    updatedAt: "20 mar 2026",
    publishedAt: null,
  },
  {
    id: "rascunho-base",
    title: "Rascunho base do primeiro post",
    slug: "rascunho-base-primeiro-post",
    excerpt:
      "Um texto inicial que ainda precisa de ajuste de tom, exemplo e ordem de argumentos.",
    content: [
      "Este rascunho serve como ponto de partida para a equipe validar a arquitetura da pagina e o fluxo de edição.",
      "A versao final deve entrar no site apenas quando os campos, a navegacao e o estado editorial estiverem claros.",
    ],
    status: "draft",
    updatedAt: "19 mar 2026",
    publishedAt: null,
  },
];

export function getPublishedDemoPosts(subdomain: string) {
  if (subdomain !== demoSite.subdomain) {
    return [];
  }

  return demoPosts.filter((post) => post.status === "published");
}

export function getDemoPostById(id: string) {
  return demoPosts.find((post) => post.id === id) ?? null;
}

export function getDemoPostBySlug(subdomain: string, slug: string) {
  if (subdomain !== demoSite.subdomain) {
    return null;
  }

  return demoPosts.find(
    (post) => post.slug === slug && post.status === "published",
  ) ?? null;
}
