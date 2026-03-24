"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarNavItem = {
  href: string;
  label: string;
  description?: string;
  active?: boolean;
};

type SidebarNavProps = {
  title: string;
  description: string;
  items: SidebarNavItem[];
};

export function SidebarNav({ title, description, items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="border-r border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,243,236,0.88))] p-5">
      <div className="mb-5 border-b border-black/8 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-black/58">{description}</p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/app/overview" && pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/app/settings/account" && pathname.startsWith("/app/settings"));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "block rounded-2xl border px-4 py-3 transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                isActive
                  ? "border-black bg-black text-white shadow-[0_10px_30px_rgba(17,17,17,0.14)]"
                  : "border-black/10 bg-white/70 text-black hover:border-black/20 hover:bg-white",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="text-[10px] uppercase tracking-[0.24em] opacity-70">
                  {isActive ? "Atual" : "Abrir"}
                </span>
              </div>
              {item.description ? (
                <p className="mt-1 text-xs leading-5 opacity-75">{item.description}</p>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
