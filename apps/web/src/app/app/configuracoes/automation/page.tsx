import { redirect } from "next/navigation";

export default function LegacyAutomationSettingsPage() {
  redirect("/dashboard/configuracoes?section=automation");
}
