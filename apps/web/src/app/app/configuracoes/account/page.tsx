import { redirect } from "next/navigation";

export default function LegacyAccountSettingsPage() {
  redirect("/dashboard/configuracoes?section=account");
}
