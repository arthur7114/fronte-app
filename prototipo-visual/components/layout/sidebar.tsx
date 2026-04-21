"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  PenTool,
  TrendingUp,
  BarChart3,
  Settings,
  Sparkles,
  Users,
  Mail,
  Calendar,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meu Blog", href: "/dashboard/blog", icon: FileText },
  { name: "Estratégias", href: "/dashboard/estrategias", icon: Lightbulb },
  { name: "Artigos", href: "/dashboard/artigos", icon: PenTool },
  { name: "Calendário", href: "/dashboard/calendario", icon: Calendar },
  { name: "Tendências", href: "/dashboard/tendencias", icon: TrendingUp },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          ContentAI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              (pathname === item.href ||
                pathname.startsWith(item.href + "/")))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0",
                isActive ? "text-primary" : ""
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Help Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Precisa de ajuda?
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Nossa IA está pronta para responder suas dúvidas.
          </p>
          <button className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Falar com suporte
          </button>
        </div>
      </div>
    </aside>
  )
}
