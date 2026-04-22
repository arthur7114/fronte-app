import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { getAuthContext } from "@/lib/auth-context"
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user, profile, membership, tenant, site } = await getAuthContext()

  if (!user) {
    redirect("/login")
  }

  if (!membership || !tenant) {
    redirect("/onboarding")
  }

  if (!site) {
    redirect("/onboarding/site")
  }

  const briefing = await getBusinessBriefingForTenant(tenant.id)

  if (!briefing) {
    redirect("/onboarding/briefing")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header
          projects={[
            {
              id: tenant.id,
              name: tenant.name,
              url: site.custom_domain || `${site.subdomain}.antigravity.blog`,
            },
          ]}
          userName={profile?.full_name || tenant.name}
          userEmail={user.email || ""}
        />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
