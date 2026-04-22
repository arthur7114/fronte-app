export type AppNavItem = {
  href: string;
  label: string;
  description: string;
  shortCode: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    description: "Resumo do projeto, pipeline e proximos passos.",
    shortCode: "DB",
  },
  {
    href: "/app/blog",
    label: "Meu Blog",
    description: "Preview, identidade do site e configuracao editorial.",
    shortCode: "BL",
  },
  {
    href: "/app/estrategias",
    label: "Estrategias",
    description: "Direcao editorial, contexto do negocio e foco por estrategia.",
    shortCode: "ES",
  },
  {
    href: "/app/artigos",
    label: "Artigos",
    description: "Lista editorial, criacao, revisao e edicao de posts.",
    shortCode: "AR",
  },
  {
    href: "/app/calendario",
    label: "Calendario",
    description: "Agenda editorial, publicacoes e itens sem data.",
    shortCode: "CL",
  },
  {
    href: "/app/tendencias",
    label: "Tendencias",
    description: "Radar dos sinais atuais com base nos temas pesquisados.",
    shortCode: "TD",
  },
  {
    href: "/app/analytics",
    label: "Analytics",
    description: "Leitura operacional e sinais de performance do conteudo.",
    shortCode: "AN",
  },
  {
    href: "/app/newsletter",
    label: "Newsletter",
    description: "Campanhas, assinantes e envios editoriais.",
    shortCode: "NL",
  },
  {
    href: "/app/leads",
    label: "Leads",
    description: "Captacao, origem e acompanhamento de oportunidades.",
    shortCode: "LD",
  },
  {
    href: "/app/configuracoes",
    label: "Configuracoes",
    description: "Conta, workspace, site, automacao e preferencias de IA.",
    shortCode: "CF",
  },
];

function isPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAppRouteMeta(pathname: string) {
  if (pathname === "/dashboard" || pathname === "/app/dashboard") {
    return {
      breadcrumb: "Dashboard",
      label: "Dashboard",
    };
  }

  if (isPath(pathname, "/dashboard/blog") || isPath(pathname, "/app/blog")) {
    return {
      breadcrumb: "Blog",
      label: "Meu Blog",
    };
  }

  if (isPath(pathname, "/dashboard/artigos/novo") || isPath(pathname, "/app/artigos/new")) {
    return {
      breadcrumb: "Artigos / Novo artigo",
      label: "Novo artigo",
    };
  }

  if (
    (isPath(pathname, "/dashboard/artigos") && pathname !== "/dashboard/artigos") ||
    (isPath(pathname, "/app/artigos") && pathname !== "/app/artigos")
  ) {
    return {
      breadcrumb: "Artigos / Editor",
      label: "Editor",
    };
  }

  if (isPath(pathname, "/dashboard/artigos") || isPath(pathname, "/app/artigos")) {
    return {
      breadcrumb: "Artigos",
      label: "Artigos",
    };
  }

  if (
    (isPath(pathname, "/dashboard/estrategias") && pathname !== "/dashboard/estrategias") ||
    (isPath(pathname, "/dashboard/estrategia") && pathname !== "/dashboard/estrategia") ||
    (isPath(pathname, "/app/estrategias") && pathname !== "/app/estrategias")
  ) {
    return {
      breadcrumb: "Estrategia / Detalhe",
      label: "Estrategia",
    };
  }

  if (
    isPath(pathname, "/dashboard/estrategias") ||
    isPath(pathname, "/dashboard/estrategia") ||
    isPath(pathname, "/app/estrategias")
  ) {
    return {
      breadcrumb: "Estrategia",
      label: "Estrategia",
    };
  }

  if (isPath(pathname, "/dashboard/plano") || isPath(pathname, "/app/plano")) {
    return {
      breadcrumb: "Plano de Conteudo",
      label: "Plano",
    };
  }

  if (isPath(pathname, "/dashboard/calendario") || isPath(pathname, "/app/calendario")) {
    return {
      breadcrumb: "Calendario",
      label: "Calendario",
    };
  }

  if (isPath(pathname, "/dashboard/tendencias") || isPath(pathname, "/app/tendencias")) {
    return {
      breadcrumb: "Tendencias",
      label: "Tendencias",
    };
  }

  if (isPath(pathname, "/dashboard/analytics") || isPath(pathname, "/app/analytics")) {
    return {
      breadcrumb: "Analytics",
      label: "Analytics",
    };
  }

  if (isPath(pathname, "/dashboard/newsletter") || isPath(pathname, "/app/newsletter")) {
    return {
      breadcrumb: "Newsletter",
      label: "Newsletter",
    };
  }

  if (isPath(pathname, "/dashboard/leads") || isPath(pathname, "/app/leads")) {
    return {
      breadcrumb: "Leads",
      label: "Leads",
    };
  }

  if (
    isPath(pathname, "/dashboard/configuracoes") ||
    isPath(pathname, "/app/configuracoes")
  ) {
    return {
      breadcrumb: "Configuracoes",
      label: "Configuracoes",
    };
  }

  if (isPath(pathname, "/app/aprovacoes")) {
    return {
      breadcrumb: "Centro de Aprovacao",
      label: "Aprovacoes",
    };
  }

  if (isPath(pathname, "/app/jobs")) {
    return {
      breadcrumb: "Jobs",
      label: "Jobs",
    };
  }

  return {
    breadcrumb: "Portal",
    label: "Fronte",
  };
}
