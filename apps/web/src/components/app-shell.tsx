"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Menu,
  PenTool,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppNavItem } from "@/lib/app-navigation";
import { cn } from "@/lib/utils";

type AppShellProps = {
  workspace?: string;
  site?: string;
  userLabel?: string;
  userEmail?: string;
  navItems: AppNavItem[];
  children: ReactNode;
};

function getIconForAppNav(item: AppNavItem) {
  if (item.href === "/dashboard") return LayoutDashboard;
  if (item.href === "/dashboard/blog") return FileText;
  if (item.href.startsWith("/dashboard/estrategia")) return Lightbulb;
  if (item.href.startsWith("/dashboard/plano")) return CalendarDays;
  if (item.href.startsWith("/dashboard/artigos")) return PenTool;
  if (item.href.startsWith("/dashboard/tendencias")) return TrendingUp;
  if (item.href.startsWith("/dashboard/analytics")) return BarChart3;
  if (item.href.startsWith("/dashboard/configuracoes")) return Settings;
  return LayoutDashboard;
}

function isActiveItem(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

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

  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getWorkspaceInitials = (name?: string) => {
    if (!name) return "W";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Link
          href="/dashboard"
          className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6 transition hover:bg-sidebar-accent/30"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">ContentAI</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = isActiveItem(pathname, item.href);
            const Icon = getIconForAppNav(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-xl bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Precisa de ajuda?
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Nossa IA esta pronta para responder suas duvidas.
            </p>
            <button className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Falar com suporte
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <div className="flex items-center gap-3 lg:gap-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen((current) => !current)}
              className="text-muted-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 lg:px-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {getWorkspaceInitials(workspace)}
                  </div>
                  <div className="hidden flex-col items-start lg:flex">
                    <span className="text-sm font-medium">{workspace || "Workspace"}</span>
                    <span className="text-xs text-muted-foreground">
                      {site ? `${site}.antigravity.blog` : "Sem site configurado"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Seu contexto atual</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {getWorkspaceInitials(workspace)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{workspace || "Workspace"}</span>
                    <span className="text-xs text-muted-foreground">
                      {site ? `${site}.antigravity.blog` : "Sem site configurado"}
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden text-muted-foreground lg:inline-flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notificacoes
                  <span className="text-xs font-normal text-muted-foreground">0 novas</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 text-center text-muted-foreground">
                  Sem notificacoes no momento.
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                    <AvatarFallback className="bg-primary/10 text-sm text-primary">
                      {getInitials(userLabel || userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userLabel || userEmail || "Conta"}</p>
                    <p className="text-xs text-muted-foreground">{userEmail || "Sem email"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/configuracoes?section=account">Minha conta</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <LogoutButton />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {mobileOpen && (
          <div className="border-b border-border bg-sidebar px-4 py-3 lg:hidden">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = isActiveItem(pathname, item.href);
                const Icon = getIconForAppNav(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
