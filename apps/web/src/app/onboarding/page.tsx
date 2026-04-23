import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { getAuthContext } from "@/lib/auth-context";
import { resolveAuthenticatedAppPath } from "@/lib/auth-routing";

export default async function OnboardingPage() {
  const { user, membership, tenant, site } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (membership && tenant) {
    redirect(
      resolveAuthenticatedAppPath({
        hasMembership: true,
        hasSite: Boolean(site),
      }),
    );
  }

  return <OnboardingForm />;
}
