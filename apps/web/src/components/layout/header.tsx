"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, Plus, Search } from "lucide-react"
import { JobNotifications } from "@/components/layout/job-notifications"
import { LogoutButton } from "@/components/logout-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Project = {
  id: string
  name: string
  url: string
}

const fallbackProjects: Project[] = [
  { id: "1", name: "Minha Clínica Dental", url: "clinicadental.com.br" },
  { id: "2", name: "Consultoria Financeira", url: "consultoriafinanceira.com" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

type HeaderProps = {
  projects?: Project[]
  userName?: string
  userEmail?: string
}

export function Header({
  projects = fallbackProjects,
  userName = "João da Silva",
  userEmail = "joao@clinicadental.com.br",
}: HeaderProps) {
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id ?? "1")
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? fallbackProjects[0]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "group flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors",
            "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "data-[state=open]:bg-muted",
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
            {getInitials(activeProject.name)}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-foreground">{activeProject.name}</span>
            <span className="text-[11px] text-muted-foreground">{activeProject.url}</span>
          </div>
          <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Seus projetos
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((project) => {
            const isActive = project.id === activeProjectId
            return (
              <DropdownMenuItem
                key={project.id}
                onSelect={() => setActiveProjectId(project.id)}
                className="flex items-center gap-3 py-2.5 pr-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(project.name)}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{project.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{project.url}</span>
                </div>
                {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-primary">
            <Plus className="h-4 w-4" />
            Criar novo projeto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>
        <JobNotifications />
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg px-1.5 transition-colors",
              "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "data-[state=open]:bg-muted",
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
              <AvatarFallback className="bg-primary/10 text-sm text-primary">
                {getInitials(userName || userEmail || "Conta")}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{userName || "Conta"}</p>
                <p className="text-xs text-muted-foreground">{userEmail || "Sem email"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracoes">Minha conta</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracoes?section=billing">Plano e cobrança</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracoes?section=preferences">Preferências</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="p-1">
              <LogoutButton />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
