import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <section
      className={`border border-black/10 bg-white/85 p-6 shadow-[0_20px_60px_rgba(17,17,17,0.06)] sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}
