"use client"

import { useMemo, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  Users,
  Mail,
  TrendingUp,
  Sparkles,
  Search,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  PauseCircle,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
// Use the new types and server actions
import type { Lead, LeadOrigin, LeadStatus } from "@/lib/leads-server"
import { updateLeadStatusAction, deleteLeadAction } from "@/actions/leads-actions"

const ORIGIN_LABELS: Record<LeadOrigin, string> = {
  popup: "Popup",
  inline: "Inline",
  cta: "CTA",
  footer: "Rodapé",
}

const INTEREST_LABELS: Record<string, string> = {
  blog: "Blog e artigos",
  dicas: "Dicas de conteúdo",
  promocoes: "Promoções",
  tudo: "Receber tudo",
}

const STATUS_OPTIONS: { value: "all" | LeadStatus; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "novo", label: "Novos" },
  { value: "engajado", label: "Engajados" },
  { value: "inativo", label: "Inativos" },
]

const ORIGIN_OPTIONS: { value: "all" | LeadOrigin; label: string }[] = [
  { value: "all", label: "Todas origens" },
  { value: "inline", label: "Inline" },
  { value: "popup", label: "Popup" },
  { value: "footer", label: "Rodapé" },
  { value: "cta", label: "CTA" },
]

// To retain the same mocked relative time experience simply because the seed sets mock dates for "yesterday" etc.
// But mostly we should just use Date.now() for real data.
const REFERENCE_NOW = Date.now()

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function relativeTime(iso: string) {
  const diff = REFERENCE_NOW - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Agora"
  if (mins < 60) return `Há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Há ${days}d`
  return formatDate(iso)
}

function statusBadge(status: LeadStatus) {
  if (status === "engajado") {
    return (
      <Badge className="bg-success/20 text-success border-0">
        Engajado
      </Badge>
    )
  }
  if (status === "inativo") {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
        Inativo
      </Badge>
    )
  }
  return (
    <Badge className="bg-primary/10 text-primary border-0">
      Novo
    </Badge>
  )
}

const chartConfig: ChartConfig = {
  leads: {
    label: "Leads",
    color: "var(--primary)",
  },
}

interface LeadsClientProps {
  initialLeads: Lead[]
}

export function LeadsClient({ initialLeads }: LeadsClientProps) {
  const [search, setSearch] = useState("")
  const [originFilter, setOriginFilter] = useState<"all" | LeadOrigin>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all")

  // Using standard useTransition hook to wait for Server Actions to complete revalidatePath
  const [isPending, startTransition] = useTransition()

  // For optimistic updates, we could use useOptimistic, but standard transition is sufficient since we don't have high-frequency updates.
  
  const filtered = useMemo(() => {
    return initialLeads.filter((lead) => {
      if (
        search &&
        !lead.email.toLowerCase().includes(search.toLowerCase()) &&
        !(lead.name ?? "").toLowerCase().includes(search.toLowerCase())
      )
        return false
      if (originFilter !== "all" && lead.origin !== originFilter) return false
      if (statusFilter !== "all" && lead.status !== statusFilter) return false
      return true
    })
  }, [initialLeads, search, originFilter, statusFilter])

  const stats = useMemo(() => {
    const total = initialLeads.length
    const novos = initialLeads.filter((l) => l.status === "novo").length
    const engajados = initialLeads.filter((l) => l.status === "engajado").length
    const taxa = total > 0 ? Math.round((engajados / total) * 100) : 0
    const last7 = initialLeads.filter((l) => {
      const diff = REFERENCE_NOW - new Date(l.createdAt).getTime()
      return diff < 7 * 24 * 60 * 60 * 1000
    }).length
    return { total, novos, engajados, taxa, last7 }
  }, [initialLeads])

  // Timeline: últimos 14 dias
  const timeline = useMemo(() => {
    const days: { date: string; label: string; leads: number }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({
        date: key,
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        leads: 0,
      })
    }
    initialLeads.forEach((lead) => {
      const key = new Date(lead.createdAt).toISOString().slice(0, 10)
      const bucket = days.find((d) => d.date === key)
      if (bucket) bucket.leads += 1
    })
    return days
  }, [initialLeads])

  // Origens agregadas
  const originBreakdown = useMemo(() => {
    const origins: LeadOrigin[] = ["inline", "popup", "footer", "cta", "organic_search"]
    // Removing items with 0 count implicitly maps correctly
    return origins
      .map((origin) => ({
        origin,
        label: ORIGIN_LABELS[origin] || origin,
        count: initialLeads.filter((l) => l.origin === origin).length,
      }))
      .filter(i => i.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [initialLeads])

  const handleExportCSV = () => {
    const headers = ["Nome", "Email", "Interesse", "Origem", "Status", "Data"]
    const rows = filtered.map((l) => [
      l.name ?? "",
      l.email,
      INTEREST_LABELS[l.interest] ?? l.interest,
      ORIGIN_LABELS[l.origin] ?? l.origin,
      l.status,
      formatDate(l.createdAt),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const maxOrigin = originBreakdown[0]?.count ?? 1

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Leads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Contatos capturados pelo newsletter e CTAs do seu blog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href="/blog"
              target="_blank"
              rel="noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver blog
            </a>
          </Button>
          <Button onClick={handleExportCSV} size="sm" className="gap-2">
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPIs compactos */}
      <div className="grid gap-0 overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Total de leads"
          value={stats.total.toString()}
          icon={Users}
          sub={`+${stats.last7} nos últimos 7 dias`}
        />
        <KpiTile
          label="Novos leads"
          value={stats.novos.toString()}
          icon={Sparkles}
          sub="Aguardando engajamento"
          divider
        />
        <KpiTile
          label="Engajados"
          value={stats.engajados.toString()}
          icon={TrendingUp}
          sub={`${stats.taxa}% do total`}
          divider
        />
        <KpiTile
          label="Taxa de engajamento"
          value={`${stats.taxa}%`}
          icon={Mail}
          sub="Abrem e-mails"
          divider
        />
      </div>

      {/* Timeline + Origens */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Leads capturados
                </h3>
                <p className="text-xs text-muted-foreground">Últimos 14 dias</p>
              </div>
              <Badge
                variant="secondary"
                className="bg-success/20 text-success border-0 gap-1"
              >
                <ArrowUpRight className="h-3 w-3" />
                {stats.last7} em 7d
              </Badge>
            </div>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <BarChart
                data={timeline}
                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  interval="preserveStartEnd"
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="leads"
                  fill="var(--color-leads)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Principais origens
            </h3>
            <p className="text-xs text-muted-foreground">
              De onde vêm seus leads
            </p>
            <div className="mt-6 space-y-4">
              {originBreakdown.map((item) => (
                <div key={item.origin} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${maxOrigin > 0 ? (item.count / maxOrigin) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-full border border-border bg-card p-0.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    statusFilter === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-full border border-border bg-card p-0.5">
              {ORIGIN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOriginFilter(opt.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    originFilter === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
              {filtered.length !== initialLeads.length && (
                <span> de {initialLeads.length}</span>
              )}
            </p>
          </div>

          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Nenhum lead encontrado
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ajuste os filtros para ver mais resultados.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Contato
                    </th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Origem
                    </th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Capturado
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className={isPending ? "opacity-60 pointer-events-none" : ""}>
                  {filtered.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} startTransition={startTransition} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function KpiTile({
  label,
  value,
  icon: Icon,
  sub,
  divider,
}: {
  label: string
  value: string
  icon: typeof Users
  sub?: string
  divider?: boolean
}) {
  return (
    <div
      className={cn(
        "p-6",
        divider && "border-t border-border sm:border-l sm:border-t-0",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function LeadRow({ lead, startTransition }: { lead: Lead; startTransition: React.TransitionStartFunction }) {
  const initials = lead.name
    ? lead.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : lead.email.slice(0, 2).toUpperCase()

  const handleUpdateStatus = (newStatus: LeadStatus) => {
    startTransition(async () => {
      await updateLeadStatusAction(lead.id, newStatus)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLeadAction(lead.id)
    })
  }

  return (
    <tr className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            {lead.name && (
              <p className="truncate text-sm font-medium text-foreground">
                {lead.name}
              </p>
            )}
            <p className="truncate text-sm text-muted-foreground">
              {lead.email}
            </p>
            {lead.sourceArticle && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                de &ldquo;{lead.sourceArticle}&rdquo;
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <Badge variant="outline" className="text-xs font-normal">
          {ORIGIN_LABELS[lead.origin] || lead.origin}
        </Badge>
      </td>
      <td className="px-6 py-3">{statusBadge(lead.status)}</td>
      <td className="px-6 py-3">
        <span
          className="text-sm text-muted-foreground"
          title={formatDate(lead.createdAt)}
        >
          {relativeTime(lead.createdAt)}
        </span>
      </td>
      <td className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleUpdateStatus("engajado")}
              disabled={lead.status === "engajado"}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marcar como engajado
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUpdateStatus("inativo")}
              disabled={lead.status === "inativo"}
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              Marcar como inativo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
