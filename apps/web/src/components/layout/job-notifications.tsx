"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, Bell, CheckCircle2, Loader2, PlayCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { JobNotificationItem } from "@/lib/job-feed"
import { cn } from "@/lib/utils"

const READ_STORAGE_KEY = "fronte.jobNotifications.read"
const POLL_INTERVAL_MS = 8000

function readStoredIds() {
  if (typeof window === "undefined") return new Set<string>()
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set<string>()
  }
}

function writeStoredIds(ids: Set<string>) {
  window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-100)))
}

function notify(item: JobNotificationItem) {
  if (item.event === "failed") {
    toast.error(item.title, { description: item.description })
    return
  }
  if (item.event === "completed") {
    toast.success(item.title, { description: item.description })
    return
  }
  toast.message(item.title, { description: item.description })
}

function EventIcon({ event }: { event: JobNotificationItem["event"] }) {
  if (event === "failed") return <AlertCircle className="h-4 w-4 text-destructive" />
  if (event === "completed") return <CheckCircle2 className="h-4 w-4 text-green-600" />
  return <PlayCircle className="h-4 w-4 text-primary" />
}

export function JobNotifications() {
  const [notifications, setNotifications] = useState<JobNotificationItem[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const [isLoading, setIsLoading] = useState(true)
  const hasLoadedRef = useRef(false)
  const knownIdsRef = useRef<Set<string>>(new Set())

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/job-notifications", { cache: "no-store" })
      if (!response.ok) return
      const data = (await response.json()) as { notifications?: JobNotificationItem[] }
      const nextNotifications = data.notifications ?? []

      if (hasLoadedRef.current) {
        nextNotifications
          .filter((item) => !knownIdsRef.current.has(item.id))
          .reverse()
          .forEach(notify)
      }

      knownIdsRef.current = new Set(nextNotifications.map((item) => item.id))
      setNotifications(nextNotifications)
      hasLoadedRef.current = true
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setReadIds(readStoredIds())
    void fetchNotifications()
    const intervalId = window.setInterval(fetchNotifications, POLL_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [fetchNotifications])

  const unreadCount = notifications.filter((item) => !readIds.has(item.id)).length

  const markVisibleAsRead = (open: boolean) => {
    if (!open || notifications.length === 0) return
    const next = new Set(readIds)
    notifications.forEach((item) => next.add(item.id))
    setReadIds(next)
    writeStoredIds(next)
  }

  return (
    <DropdownMenu onOpenChange={markVisibleAsRead}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificações
          <span className="text-xs font-normal text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} nova(s)` : "Tudo lido"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando jobs
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link
                href={item.href ?? "/dashboard/artigos"}
                className={cn(
                  "flex cursor-pointer items-start gap-3 py-3",
                  !readIds.has(item.id) && "bg-primary/5",
                )}
              >
                <span className="mt-0.5">
                  <EventIcon event={item.event} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">Sem notificações</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Jobs iniciados, concluídos e com erro aparecerão aqui.
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
