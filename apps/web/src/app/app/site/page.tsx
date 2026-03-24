export default async function SitePage() {
  const { redirect } = await import("next/navigation");
  redirect("/app/settings/site");
}
