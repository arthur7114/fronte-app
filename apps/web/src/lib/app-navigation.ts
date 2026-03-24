export type AppNavItem = {
  href: string;
  label: string;
  description: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/app/overview",
    label: "Visao geral",
    description: "Resumo do workspace e do fluxo atual.",
  },
  {
    href: "/app/posts",
    label: "Posts",
    description: "Editor, lista e operacao editorial.",
  },
  {
    href: "/app/automation",
    label: "Automacao",
    description: "Configuracao operacional e gatilhos.",
  },
  {
    href: "/app/automation/topics",
    label: "Temas",
    description: "Curadoria de temas gerados pelo worker.",
  },
  {
    href: "/app/automation/briefs",
    label: "Briefings",
    description: "Briefings prontos para gerar draft.",
  },
  {
    href: "/app/jobs",
    label: "Jobs",
    description: "Fila e historico de processamento.",
  },
  {
    href: "/app/settings/account",
    label: "Configuracoes",
    description: "Conta, workspace, site e IA.",
  },
];

export function getAppRouteMeta(pathname: string) {
  if (pathname === "/app/overview") {
    return {
      breadcrumb: "Visao geral",
      label: "Visao geral",
    };
  }

  if (pathname.startsWith("/app/posts/new")) {
    return {
      breadcrumb: "Conteudo / Novo post",
      label: "Novo post",
    };
  }

  if (pathname.startsWith("/app/posts/")) {
    return {
      breadcrumb: "Conteudo / Editor",
      label: "Editor",
    };
  }

  if (pathname.startsWith("/app/posts")) {
    return {
      breadcrumb: "Conteudo / Posts",
      label: "Posts",
    };
  }

  if (pathname.startsWith("/app/automation/topics")) {
    return {
      breadcrumb: "Automacao / Temas",
      label: "Temas",
    };
  }

  if (pathname.startsWith("/app/automation/briefs")) {
    return {
      breadcrumb: "Automacao / Briefings",
      label: "Briefings",
    };
  }

  if (pathname.startsWith("/app/automation")) {
    return {
      breadcrumb: "Automacao / Operacao",
      label: "Automacao",
    };
  }

  if (pathname.startsWith("/app/jobs")) {
    return {
      breadcrumb: "Automacao / Jobs",
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
    breadcrumb: "Painel",
    label: "Painel",
  };
}
