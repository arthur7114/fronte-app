import { redirect } from "next/navigation";
import { OnboardingBriefingForm } from "@/components/onboarding-briefing-form";
import { getAuthContext } from "@/lib/auth-context";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

export default async function OnboardingBriefingPage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) redirect("/login");
  if (!membership || !tenant) redirect("/onboarding");
  if (!site) redirect("/app");

  const briefing = await getBusinessBriefingForTenant(tenant.id);
  if (briefing) redirect("/app/dashboard");

  return <OnboardingBriefingForm tenantName={tenant.name} siteName={site.name} />;
}
