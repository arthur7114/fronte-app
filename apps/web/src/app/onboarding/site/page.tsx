import { redirect } from "next/navigation";
import { OnboardingSiteForm } from "@/components/onboarding-site-form";
import { getAuthContext } from "@/lib/auth-context";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

export default async function OnboardingSitePage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) redirect("/login");
  if (!membership || !tenant) redirect("/onboarding");

  const briefing = await getBusinessBriefingForTenant(tenant.id);
  if (site) redirect(briefing ? "/app/dashboard" : "/onboarding/briefing");

  return <OnboardingSiteForm tenantName={tenant.name} />;
}
