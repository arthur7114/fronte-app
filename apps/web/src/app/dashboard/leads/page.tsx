import { getAuthContext } from "@/lib/auth-context"
import { getLeadsForTenant } from "@/lib/leads-server"
import { redirect } from "next/navigation"
import { LeadsClient } from "./leads-client"

export const metadata = {
  title: "Leads | Fronte",
  description: "Gerencie os contatos capturados pelo seu blog.",
}

export default async function LeadsPage() {
  const { tenant } = await getAuthContext()
  
  if (!tenant) {
    redirect("/login")
  }

  const leads = await getLeadsForTenant(tenant.id)

  return <LeadsClient initialLeads={leads} />
}
