"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import type { AppNavItem } from "@/lib/app-navigation";
import { cn } from "@/lib/utils";
import { getAppRouteMeta } from "@/lib/app-navigation";

type AppShellProps = {
  workspace?: string;
  site?: string;
  userLabel?: string;
  userEmail?: string;
  navItems: AppNavItem[];
  children: ReactNode;
};

export function AppShell({
  workspace,
  site,
  userLabel,
  userEmail,
  navItems,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const routeMeta = getAppRouteMeta(pathname);

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="dashboard-grid min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar/95 px-4 py-5 backdrop-blur lg:flex lg:min-h-screen lg:flex-col">
          <Link href="/app/overview" className="rounded-lg px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                AI
              </div>
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground">Antigravity</p>
                <p className="text-xs text-muted-foreground">Content operating system</p>
              </div>
            </div>
          </Link>

          <div className="mt-6 rounded-lg border border-sidebar-border bg-white/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Projeto atual
            </p>
            <p className="mt-3 text-lg font-semibold text-sidebar-foreground">
              {workspace || "Workspace"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {site ? `${site}.antigravity.blog` : "Sem site configurado"}
            </p>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/app/overview" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-3 transition",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-white/90 hover:text-sidebar-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold uppercase tracking-[0.14em]",
                      active
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-sidebar-border bg-white/85 text-muted-foreground",
                    )}
                  >
                    {item.shortCode}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 opacity-80">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-lg border border-sidebar-border bg-white/82 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Conta
            </p>
            <p className="mt-3 text-sm font-semibold text-sidebar-foreground">
              {userLabel || userEmail || "Conta"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{userEmail || "Sem email"}</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-[rgba(251,253,255,0.86)] backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen((value) => !value)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground lg:hidden"
                >
                  Menu
                </button>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    {routeMeta.breadcrumb}
                  </p>
                  <p className="text-base font-semibold text-foreground">{routeMeta.label}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {site ? (
                  <Link
                    href={`/blog/${site}`}
                    className="hidden h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground md:inline-flex"
                  >
                    Abrir blog
                  </Link>
                ) : null}
                <Link
                  href="/app/posts/new"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
                >
                  Novo artigo
                </Link>
              </div>
            </div>
          </header>

          {mobileOpen ? (
            <div className="border-b border-border bg-white/92 px-4 py-3 lg:hidden">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/app/overview" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-sm",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "bg-transparent text-foreground",
                      )}
                    >
                      <span className="block font-semibold">{item.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
