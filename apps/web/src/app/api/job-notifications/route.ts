import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/auth-context"
import { listAutomationJobsForTenant } from "@/lib/automation-data"
import { toJobNotifications, type JobNotificationItem } from "@/lib/job-feed"

export type JobNotificationsResponse = {
  notifications: JobNotificationItem[]
}

export async function GET() {
  const { tenant } = await getAuthContext()

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const jobs = await listAutomationJobsForTenant(tenant.id)
  return NextResponse.json<JobNotificationsResponse>({
    notifications: toJobNotifications(jobs).slice(0, 20),
  })
}
