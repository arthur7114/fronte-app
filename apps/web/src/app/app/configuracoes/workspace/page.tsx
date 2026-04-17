import { redirect } from "next/navigation";

export default function LegacyWorkspaceSettingsPage() {
  redirect("/dashboard/configuracoes?section=workspace");
}
