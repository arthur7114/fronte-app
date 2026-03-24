"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { SidebarNav, type SidebarNavItem } from "@/components/sidebar-nav";
import { Topbar } from "@/components/topbar";

type AppShellProps = {
  workspace?: string;
  site?: string;
  topbarActions?: ReactNode;
  navItems: SidebarNavItem[];
  children: ReactNode;
};

export function AppShell({
  workspace,
  site,
  topbarActions,
  navItems,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f6f2ea] text-[#121212]">
      <div className="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <SidebarNav title="Super" description="Navegacao principal do app." items={navItems} />
        </div>

        <div className="flex min-w-0 flex-col">
          <Topbar workspace={workspace} site={site}>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-10 items-center justify-center border border-black/10 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-black transition duration-200 hover:-translate-y-0.5 lg:hidden"
            >
              Menu
            </button>
            {topbarActions}
          </Topbar>

          {mobileOpen ? (
            <div className="border-b border-black/10 lg:hidden">
              <SidebarNav
                title="Super"
                description="Navegacao principal do app."
                items={navItems}
              />
            </div>
          ) : null}

          <div className="flex-1 px-5 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
