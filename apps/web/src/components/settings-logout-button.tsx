"use client";

import { logout } from "@/app/auth/actions";

export function SettingsLogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center rounded-full border border-[#1e293b]/12 bg-white/82 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#0f172a] transition duration-200 hover:-translate-y-0.5"
      >
        Sair
      </button>
    </form>
  );
}
