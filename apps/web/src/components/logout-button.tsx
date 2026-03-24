import { logout } from "@/app/auth/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center border border-black/12 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.24em] text-black transition duration-200 hover:-translate-y-0.5"
      >
        Sair
      </button>
    </form>
  );
}
