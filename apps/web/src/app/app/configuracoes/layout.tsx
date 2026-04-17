import type { ReactNode } from "react";

type SettingsLayoutProps = {
  children: ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return <div className="space-y-6">{children}</div>;
}
