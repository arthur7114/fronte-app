import type { ReactNode } from "react";

type AuthPanelProps = {
  mode: "login" | "signup";
  children: ReactNode;
};

export function AuthPanel({ mode, children }: AuthPanelProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      {children}
    </div>
  );
}
