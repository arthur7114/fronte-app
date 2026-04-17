import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";

export default async function HomePage() {
  const { user, tenant } = await getAuthContext();

  if (user) {
    redirect(tenant ? "/dashboard" : "/onboarding");
  }

  redirect("/login");
}
