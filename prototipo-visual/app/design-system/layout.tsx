import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Design System — ContentAI",
  description: "Tokens, tipografia e componentes que compõem a interface da ContentAI.",
}

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>
}
