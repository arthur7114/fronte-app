import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { APP_NAV_ITEMS } from "@/lib/app-navigation";
import { getAuthContext } from "@/lib/auth-context";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (!membership || !tenant) {
    redirect("/onboarding");
  }

  if (!site) {
    redirect("/onboarding/site");
  }

  const briefing = await getBusinessBriefingForTenant(tenant.id);

  if (!briefing) {
    redirect("/onboarding/briefing");
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
