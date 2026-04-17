"use client"

import { useState } from "react"
import { Bell, ChevronDown, Search, Check, Plus } from "lucide-react"
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

const projects: Project[] = [
  { id: "1", name: "Minha Clínica Dental", url: "clinicadental.com.br" },
  { id: "2", name: "Consultoria Financeira", url: "consultoriafinanceira.com" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function Header() {
  const [activeProjectId, setActiveProjectId] = useState("1")
  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Project Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "group flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors",
            "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "data-[state=open]:bg-muted"
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
            {getInitials(activeProject.name)}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-foreground">
              {activeProject.name}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {activeProject.url}
            </span>
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
                  <span className="truncate text-sm font-medium text-foreground">
                    {project.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {project.url}
                  </span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
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

      {/* Right Side */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificações
              <span className="text-xs font-normal text-muted-foreground">
                3 novas
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Artigo publicado com sucesso</span>
              <span className="text-xs text-muted-foreground">
                {'"10 Dicas para Cuidar dos Dentes"'} foi publicado há 2 horas
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Nova tendência detectada</span>
              <span className="text-xs text-muted-foreground">
                {'"Clareamento dental caseiro"'} está em alta na sua região
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Meta alcançada!</span>
              <span className="text-xs text-muted-foreground">
                Você atingiu 1.000 visitas orgânicas este mês
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              Ver todas as notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg px-1.5 transition-colors",
              "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "data-[state=open]:bg-muted"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
              <AvatarFallback className="bg-primary/10 text-sm text-primary">
                JD
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">João da Silva</p>
                <p className="text-xs text-muted-foreground">
                  joao@clinicadental.com.br
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Minha conta</DropdownMenuItem>
            <DropdownMenuItem>Plano e cobrança</DropdownMenuItem>
            <DropdownMenuItem>Preferências</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
