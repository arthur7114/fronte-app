import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";

export default async function AppEntryPage() {
  const { user, membership, site } = await getAuthContext();

  if (!user) {
    redirect("/auth/login");
  }

  if (!membership) {
    redirect("/onboarding");
  }

  redirect(site ? "/app/overview" : "/onboarding/site");
}
