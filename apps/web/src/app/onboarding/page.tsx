import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { getAuthContext } from "@/lib/auth-context";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

export default async function OnboardingPage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) redirect("/login");

  if (membership && tenant) {
    const briefing = await getBusinessBriefingForTenant(tenant.id);
    redirect(site ? (briefing ? "/dashboard" : "/onboarding/briefing") : "/onboarding/site");
  }

  return <OnboardingForm />;
}
