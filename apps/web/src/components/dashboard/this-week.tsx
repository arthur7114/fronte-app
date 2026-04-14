import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertCircle } from "lucide-react"

export interface WeeklyArticle {
  id: string
  title: string
  scheduledFor?: string
  progress?: number
  createdAt?: string
}

interface ThisWeekProps {
  planned: WeeklyArticle[]
  inProgress: WeeklyArticle[]
  awaitingApproval: WeeklyArticle[]
}

export function ThisWeek({ planned, inProgress, awaitingApproval }: ThisWeekProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Esta Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Planned */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">Planejados</span>
            <Badge variant="secondary" className="text-xs">
              {planned.length}
            </Badge>
          </div>
          <div className="space-y-2 pl-8">
            {planned.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum artigo agendado.</p>
            )}
            {planned.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <span className="text-sm text-foreground line-clamp-1">{article.title}</span>
                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{article.scheduledFor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
              <div className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
            </div>
            <span className="text-sm font-medium text-foreground">Em produção</span>
            <Badge variant="secondary" className="text-xs">
              {inProgress.length}
            </Badge>
          </div>
          <div className="space-y-2 pl-8">
            {inProgress.length === 0 && (
              <p className="text-xs text-muted-foreground">Nem um rascunho ativo.</p>
            )}
            {inProgress.map((article) => (
              <div
                key={article.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground line-clamp-1">{article.title}</span>
                  <span className="text-xs font-medium text-primary ml-2">{article.progress || 0}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${article.progress || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awaiting Approval */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
              <AlertCircle className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-foreground">Aguardando aprovação</span>
            <Badge variant="secondary" className="text-xs">
              {awaitingApproval.length}
            </Badge>
          </div>
          <div className="space-y-2 pl-8">
            {awaitingApproval.length === 0 && (
              <p className="text-xs text-muted-foreground">Tudo em dia!</p>
            )}
            {awaitingApproval.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <span className="text-sm text-foreground line-clamp-1">{article.title}</span>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{article.createdAt}</span>
                  <button className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    Revisar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
