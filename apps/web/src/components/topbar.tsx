"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { getAppRouteMeta } from "@/lib/app-navigation";

type TopbarProps = {
  workspace?: string;
  site?: string;
  children?: ReactNode;
};

export function Topbar({ workspace, site, children }: TopbarProps) {
  const pathname = usePathname();
  const routeMeta = getAppRouteMeta(pathname);

  return (
    <header className="border-b border-black/10 bg-white/82 px-5 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
            <BrandMark subtle />
            <div className="hidden h-10 w-px bg-black/10 lg:block" />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/45">
                {routeMeta.breadcrumb}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-black/62">
                {workspace ? <span>{workspace}</span> : null}
              {workspace && site ? <span className="text-black/25">/</span> : null}
              {site ? <span>{site}</span> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {children}
        </div>
      </div>
    </header>
  );
}
