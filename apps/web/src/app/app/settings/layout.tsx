import type { CSSProperties, ReactNode } from "react";
import { Newsreader, Roboto } from "next/font/google";

const settingsHeading = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--settings-heading-font",
});

const settingsBody = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type SettingsLayoutProps = {
  children: ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div
      className={`${settingsBody.className} min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.06),transparent_28%),linear-gradient(180deg,rgba(248,250,252,1),rgba(248,246,241,0.92))] text-[#0f172a]`}
      style={{ [settingsHeading.variable]: settingsHeading.style.fontFamily } as CSSProperties}
    >
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {children}
      </div>
    </div>
  );
}
