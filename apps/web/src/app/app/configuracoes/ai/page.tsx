import { redirect } from "next/navigation";

export default function LegacyAiSettingsPage() {
  redirect("/dashboard/configuracoes?section=ai");
}
