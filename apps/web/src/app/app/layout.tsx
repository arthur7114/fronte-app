import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LogoutButton } from "@/components/logout-button";
import { APP_NAV_ITEMS } from "@/lib/app-navigation";
import { getAuthContext } from "@/lib/auth-context";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user, profile, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/auth/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  if (!site) {
    redirect("/onboarding/site");
  }

  return (
    <AppShell
      workspace={tenant.name}
      site={site.subdomain}
      navItems={APP_NAV_ITEMS}
      topbarActions={
        <>
          <Link
            href="/app/settings/account"
            className="inline-flex h-10 items-center justify-center border border-black/10 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-black transition duration-200 hover:-translate-y-0.5"
          >
            {profile?.full_name || user.email || "Conta"}
          </Link>
          <LogoutButton />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
