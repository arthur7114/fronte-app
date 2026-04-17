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
    description: "Resumo do projeto, pipeline e próximos passos.",
    shortCode: "DB",
  },
  {
    href: "/app/aprovacoes",
    label: "Aprovações",
    description: "Operação pendente: revise e destrave a produção.",
    shortCode: "AP",
  },
  {
    href: "/app/estrategias",
    label: "Estratégias",
    description: "Gestor de conteúdo, temas e motor de inteligência.",
    shortCode: "ES",
  },
  {
    href: "/app/artigos",
    label: "Artigos",
    description: "Lista editorial, novos rascunhos e edição de posts.",
    shortCode: "AR",
  },
  {
    href: "/app/blog",
    label: "Blog",
    description: "Identidade do site, rota pública e configuração editorial.",
    shortCode: "BL",
  },
  {
    href: "/app/perfil",
    label: "Perfil do Negócio",
    description: "Contexto global que guia toda a operação de conteúdo.",
    shortCode: "PN",
  },
  {
    href: "/app/tendencias",
    label: "Tendências",
    description: "Radar de sinais atuais com base nos temas pesquisados.",
    shortCode: "TD",
  },
  {
    href: "/app/analytics",
    label: "Resultados",
    description: "Leitura de saúde operacional e impacto do conteúdo.",
    shortCode: "RE",
  },
  {
    href: "/app/configuracoes/account",
    label: "Configurações",
    description: "Conta, workspace, site e preferências de IA.",
    shortCode: "CF",
  },
];

export function getAppRouteMeta(pathname: string) {
  if (pathname === "/app/dashboard") {
    return {
      breadcrumb: "Dashboard",
      label: "Dashboard",
    };
  }

  if (pathname.startsWith("/app/aprovacoes")) {
    return {
      breadcrumb: "Centro de Aprovação",
      label: "Aprovações",
    };
  }

  if (pathname.startsWith("/app/blog")) {
    return {
      breadcrumb: "Blog",
      label: "Meu Blog",
    };
  }

  if (pathname.startsWith("/app/artigos/new")) {
    return {
      breadcrumb: "Artigos / Novo artigo",
      label: "Novo artigo",
    };
  }

  if (pathname.startsWith("/app/artigos/")) {
    return {
      breadcrumb: "Artigos / Editor",
      label: "Editor",
    };
  }

  if (pathname.startsWith("/app/artigos")) {
    return {
      breadcrumb: "Artigos",
      label: "Artigos",
    };
  }

  if (pathname.startsWith("/app/perfil")) {
    return {
      breadcrumb: "Perfil do Negócio",
      label: "Perfil do Negócio",
    };
  }

  if (pathname.startsWith("/app/estrategias/")) {
    return {
      breadcrumb: "Estratégias / Detalhe",
      label: "Estratégia",
    };
  }

  if (pathname.startsWith("/app/estrategias")) {
    return {
      breadcrumb: "Estratégias",
      label: "Estratégias de Conteúdo",
    };
  }

  if (pathname.startsWith("/app/tendencias")) {
    return {
      breadcrumb: "Tendências",
      label: "Tendências",
    };
  }

  if (pathname.startsWith("/app/analytics")) {
    return {
      breadcrumb: "Resultados",
      label: "Resultados",
    };
  }

  if (pathname.startsWith("/app/configuracoes/account")) {
    return {
      breadcrumb: "Configurações / Conta",
      label: "Conta",
    };
  }

  if (pathname.startsWith("/app/configuracoes/workspace")) {
    return {
      breadcrumb: "Configurações / Workspace",
      label: "Workspace",
    };
  }

  if (pathname.startsWith("/app/configuracoes/site")) {
    return {
      breadcrumb: "Configurações / Blog",
      label: "Configurações do Blog",
    };
  }

  if (pathname.startsWith("/app/configuracoes/ai")) {
    return {
      breadcrumb: "Configurações / IA",
      label: "Preferências de IA",
    };
  }

  if (pathname.startsWith("/app/configuracoes/automation")) {
    return {
      breadcrumb: "Configurações / Automação",
      label: "Regras de Automação",
    };
  }

  return {
    breadcrumb: "Portal",
    label: "Fronte",
  };
}

