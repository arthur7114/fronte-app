import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
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
      userLabel={profile?.full_name || tenant.name}
      userEmail={user.email || undefined}
    >
      {children}
    </AppShell>
  );
}
