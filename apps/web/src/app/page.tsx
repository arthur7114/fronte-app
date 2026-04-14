import Link from "next/link";
import { redirect } from "next/navigation";
import { PageFrame } from "@/components/page-frame";
import { getAuthContext } from "@/lib/auth-context";

export default async function HomePage() {
  const { user, tenant } = await getAuthContext();

  if (user) {
    redirect(tenant ? "/app" : "/onboarding");
  }

  redirect("/auth/login");
}
