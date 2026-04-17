import Link from "next/link";
import {
  FileText,
  MousePointerClick,
  RefreshCcw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISuggestions, type SuggestionData } from "@/components/dashboard/ai-suggestions";
import { KPICards, type KPIData } from "@/components/dashboard/kpi-cards";
import {
  PerformanceHighlights,
  type TopPerformingData,
  type WorstPerformingData,
} from "@/components/dashboard/performance-highlights";
import { ThisWeek, type WeeklyArticle } from "@/components/dashboard/this-week";
import { getAuthContext } from "@/lib/auth-context";
import {
  listAutomationJobsForTenant,
  listContentBriefsForTenant,
  listTopicCandidatesForTenant,
} from "@/lib/automation-data";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";
import { listPostsForSite } from "@/lib/post-data";

export default async function DashboardPage() {
  const { tenant, site } = await getAuthContext();

  if (!tenant || !site) {
    return null;
  }

  const [posts, topics, briefs, jobs, businessBriefing] = await Promise.all([
    listPostsForSite(tenant.id, site.id),
    listTopicCandidatesForTenant(tenant.id),
    listContentBriefsForTenant(tenant.id),
    listAutomationJobsForTenant(tenant.id),
    getBusinessBriefingForTenant(tenant.id),
  ]);

  const publishedPosts = posts.filter((post) => post.status === "published").length;
  const scheduledPosts = posts.filter((post) => post.status === "scheduled");
  const draftPosts = posts.filter((post) => post.status === "draft");
  const pendingTopics = topics.filter((topic) => topic.status === "pending");

  const kpiData: KPIData[] = [
    {
      title: "Trafego Organico",
      value: "0",
      description: "visitantes este mes (em breve)",
      icon: Users,
    },
    {
      title: "Artigos Publicados",
      value: publishedPosts.toString(),
      trend: publishedPosts > 0 ? "up" : "neutral",
      change: publishedPosts > 0 ? `+${publishedPosts}` : "0",
      description: "nesta base de dados",
      icon: FileText,
    },
    {
      title: "Palavras Ranqueadas",
      value: "0",
      description: "no top 10 do Google (em breve)",
      icon: Target,
    },
    {
      title: "Automacoes Ativas",
      value: jobs.filter((job) => job.status === "running" || job.status === "pending").length.toString(),
      description: "tarefas da IA",
      icon: MousePointerClick,
    },
  ];

  const plannedArticles: WeeklyArticle[] = scheduledPosts.map((post) => ({
    id: post.id,
    title: post.title,
    scheduledFor: "Agendado",
  }));

  const inProgressArticles: WeeklyArticle[] = draftPosts.map((post) => ({
    id: post.id,
    title: post.title,
    progress: 40,
  }));

  const awaitingApprovalArticles: WeeklyArticle[] = pendingTopics.map((topic) => ({
    id: topic.id,
    title: topic.topic,
    createdAt: "Curadoria pendente",
  }));

  const suggestions: SuggestionData[] = pendingTopics.slice(0, 3).map((topic, index) => ({
    id: topic.id,
    title: `Aprovar tema: ${topic.topic}`,
    description: "A IA sugeriu isso com base no contexto atual do negocio.",
    icon: (index % 2 === 0 ? TrendingUp : RefreshCcw) as LucideIcon,
    priority: index === 0 ? "high" : "medium",
  }));

  if (!businessBriefing) {
    suggestions.unshift({
      id: "action-briefing",
      title: "Complete seu briefing",
      description: "Sem briefing, o plano editorial nao consegue refletir a verdade atual do produto.",
      icon: Target,
      priority: "high",
    });
  }

  const bestPerforming: TopPerformingData[] = [];
  const worstPerforming: WorstPerformingData[] = [];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Saude editorial, proximos passos e sinais do conteudo em um unico lugar.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/plano?tab=topics">Ver plano</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/dashboard/artigos/novo">
              <FileText className="h-4 w-4" />
              Novo artigo
            </Link>
          </Button>
        </div>
      </div>

      <KPICards data={kpiData} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ThisWeek
            planned={plannedArticles}
            inProgress={inProgressArticles}
            awaitingApproval={awaitingApprovalArticles}
          />
        </div>

        <div>
          <AISuggestions suggestions={suggestions} />
        </div>
      </div>

      <PerformanceHighlights
        bestPerforming={bestPerforming}
        worstPerforming={worstPerforming}
      />

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Briefings aprovados
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">
            {briefs.filter((brief) => brief.status === "approved").length}
          </p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Temas pendentes
          </p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{pendingTopics.length}</p>
        </article>
        <article className="dashboard-surface rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Proxima prioridade
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {pendingTopics[0]?.topic ?? "Sem fila critica no momento"}
          </p>
        </article>
      </section>
    </div>
  );
}
