import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertCircle } from "lucide-react"

const articles = {
  planned: [
    { id: 1, title: "Como escolher a escova de dentes ideal", scheduledFor: "Amanhã" },
    { id: 2, title: "Benefícios do fio dental diário", scheduledFor: "Quinta-feira" },
  ],
  inProgress: [
    { id: 3, title: "Clareamento dental: mitos e verdades", progress: 75 },
  ],
  awaitingApproval: [
    { id: 4, title: "Dicas para cuidar do aparelho ortodôntico", createdAt: "Há 2 horas" },
    { id: 5, title: "Alimentação e saúde bucal", createdAt: "Há 1 dia" },
  ],
}

export function ThisWeek() {
  return (
    <Card>
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
              {articles.planned.length}
            </Badge>
          </div>
          <div className="space-y-2 pl-8">
            {articles.planned.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <span className="text-sm text-foreground">{article.title}</span>
                <span className="text-xs text-muted-foreground">{article.scheduledFor}</span>
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
              {articles.inProgress.length}
            </Badge>
          </div>
          <div className="space-y-2 pl-8">
            {articles.inProgress.map((article) => (
              <div
                key={article.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{article.title}</span>
                  <span className="text-xs font-medium text-primary">{article.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${article.progress}%` }}
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
              {articles.awaitingApproval.length}
            </Badge>
          </div>
          <div className="space-y-2 pl-8">
            {articles.awaitingApproval.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <span className="text-sm text-foreground">{article.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{article.createdAt}</span>
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
