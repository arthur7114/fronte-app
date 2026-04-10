export type AppNavItem = {
  href: string;
  label: string;
  description: string;
  shortCode: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/app/overview",
    label: "Dashboard",
    description: "Resumo do projeto, pipeline e proximos passos.",
    shortCode: "DB",
  },
  {
    href: "/app/site",
    label: "Meu blog",
    description: "Identidade do site, rota publica e configuracao editorial.",
    shortCode: "MB",
  },
  {
    href: "/app/briefing",
    label: "Estrategia",
    description: "Briefing do negocio e contexto que guia o conteudo.",
    shortCode: "ES",
  },
  {
    href: "/app/automation",
    label: "Plano de conteudo",
    description: "Temas, briefings e configuracao do motor de geracao.",
    shortCode: "PC",
  },
  {
    href: "/app/posts",
    label: "Artigos",
    description: "Lista editorial, novos rascunhos e edicao de posts.",
    shortCode: "AR",
  },
  {
    href: "/app/trends",
    label: "Tendencias",
    description: "Radar de sinais atuais com base nos temas pesquisados.",
    shortCode: "TD",
  },
  {
    href: "/app/analytics",
    label: "Analytics",
    description: "Leitura de saude operacional e impacto do conteudo.",
    shortCode: "AN",
  },
  {
    href: "/app/settings/account",
    label: "Configuracoes",
    description: "Conta, workspace, site e preferencias de IA.",
    shortCode: "CF",
  },
];

export function getAppRouteMeta(pathname: string) {
  if (pathname === "/app/overview") {
    return {
      breadcrumb: "Dashboard",
      label: "Dashboard",
    };
  }

  if (pathname.startsWith("/app/site")) {
    return {
      breadcrumb: "Meu blog",
      label: "Meu blog",
    };
  }

  if (pathname.startsWith("/app/posts/new")) {
    return {
      breadcrumb: "Artigos / Novo artigo",
      label: "Novo artigo",
    };
  }

  if (pathname.startsWith("/app/posts/")) {
    return {
      breadcrumb: "Artigos / Editor",
      label: "Editor",
    };
  }

  if (pathname.startsWith("/app/posts")) {
    return {
      breadcrumb: "Artigos",
      label: "Artigos",
    };
  }

  if (pathname.startsWith("/app/briefing")) {
    return {
      breadcrumb: "Estrategia",
      label: "Estrategia",
    };
  }

  if (pathname.startsWith("/app/automation/topics")) {
    return {
      breadcrumb: "Plano de conteudo / Temas",
      label: "Temas",
    };
  }

  if (pathname.startsWith("/app/automation/briefs")) {
    return {
      breadcrumb: "Plano de conteudo / Briefings",
      label: "Briefings",
    };
  }

  if (pathname.startsWith("/app/automation")) {
    return {
      breadcrumb: "Plano de conteudo",
      label: "Plano de conteudo",
    };
  }

  if (pathname.startsWith("/app/trends")) {
    return {
      breadcrumb: "Tendencias",
      label: "Tendencias",
    };
  }

  if (pathname.startsWith("/app/analytics")) {
    return {
      breadcrumb: "Analytics",
      label: "Analytics",
    };
  }

  if (pathname.startsWith("/app/jobs")) {
    return {
      breadcrumb: "Operacao / Jobs",
      label: "Jobs",
    };
  }

  if (pathname.startsWith("/app/settings/account")) {
    return {
      breadcrumb: "Configuracoes / Conta",
      label: "Conta",
    };
  }

  if (pathname.startsWith("/app/settings/workspace")) {
    return {
      breadcrumb: "Configuracoes / Workspace",
      label: "Workspace",
    };
  }

  if (pathname.startsWith("/app/settings/site")) {
    return {
      breadcrumb: "Configuracoes / Site",
      label: "Site",
    };
  }

  if (pathname.startsWith("/app/settings/ai")) {
    return {
      breadcrumb: "Configuracoes / IA",
      label: "IA",
    };
  }

  if (pathname.startsWith("/app/settings/automation")) {
    return {
      breadcrumb: "Configuracoes / Automacao",
      label: "Automacao",
    };
  }

  return {
    breadcrumb: "Workspace",
    label: "Workspace",
  };
}
