import Link from "next/link";
import { getAuthContext } from "@/lib/auth-context";
import {
  listAutomationJobsForTenant,
  listContentBriefsForTenant,
  listTopicCandidatesForTenant,
} from "@/lib/automation-data";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";
import { listPostsForSite } from "@/lib/post-data";

import { KPICards, KPIData } from "@/components/dashboard/kpi-cards";
import { ThisWeek, WeeklyArticle } from "@/components/dashboard/this-week";
import { AISuggestions, SuggestionData } from "@/components/dashboard/ai-suggestions";
import { PerformanceHighlights, TopPerformingData, WorstPerformingData } from "@/components/dashboard/performance-highlights";

import { Button } from "@/components/ui/button";
import { Sparkles, Users, FileText, Target, MousePointerClick, RefreshCcw, TrendingUp } from "lucide-react";

export default async function OverviewPage() {
  const { tenant, site, user } = await getAuthContext();

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

  // 1. Prepare KPI Data
  const kpiData: KPIData[] = [
    {
      title: "Tráfego Orgânico",
      value: "0",
      description: "visitantes este mês (em breve)",
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
      title: "Automações Ativas",
      value: jobs.filter(j => j.status === "running" || j.status === "pending").length.toString(),
      description: "tarefas da IA",
      icon: MousePointerClick,
    },
  ];

  // 2. Prepare This Week Data
  const plannedArticles: WeeklyArticle[] = scheduledPosts.map(p => ({
    id: p.id,
    title: p.title,
    scheduledFor: "Agendado", // TODO: Format proper date
  }));

  const inProgressArticles: WeeklyArticle[] = draftPosts.map(p => ({
    id: p.id,
    title: p.title,
    progress: 40, // Mock progress for visual flair
  }));

  const awaitingApprovalArticles: WeeklyArticle[] = pendingTopics.map((t, idx) => ({
    id: t.id,
    title: t.topic,
    createdAt: "Curadoria pendente",
  }));

  // 3. Prepare AI Suggestions
  const suggestions: SuggestionData[] = pendingTopics.slice(0, 3).map((topic, i) => ({
    id: topic.id,
    title: `Aprovar tema: ${topic.topic}`,
    description: "A IA sugeriu isso com base na sua audiência.",
    icon: i % 2 === 0 ? TrendingUp : RefreshCcw,
    priority: i === 0 ? "high" : "medium",
  }));

  // Se nao configurou briefing, colocar uma suggestao priority alta
  if (!businessBriefing) {
    suggestions.unshift({
      id: "action-briefing",
      title: "Complete seu Briefing de Negócio",
      description: "As sugestões de palavras-chave estão pausadas até você explicar sobre sua empresa.",
      icon: ZapIcon,
      priority: "high"
    });
  }

  // 4. Performance Mock (Until Analytics Phase 8 is implemented)
  const bestPerforming: TopPerformingData[] = [];
  const worstPerforming: WorstPerformingData[] = [];

  const userName = tenant.name;

  return (
    <div className="space-y-8 pb-10">
      {/* Aviso de Briefing Pendente */}
      {!businessBriefing && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Seu projeto precisa de direção
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Para que a IA crie pautas e artigos que realmente convertem, precisamos entender o que sua empresa vende.
              </p>
            </div>
            <Link href="/app/perfil">
              <Button size="lg" className="whitespace-nowrap">
                Fazer o Briefing Agora
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Olá, {userName}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Veja como seu conteúdo está performando e o que fazer em seguida.
          </p>
        </div>
        <Link href="/app/artigos/new">
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Escrever Artigo
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <KPICards data={kpiData} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* This Week - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ThisWeek 
            planned={plannedArticles}
            inProgress={inProgressArticles}
            awaitingApproval={awaitingApprovalArticles}
          />
        </div>

        {/* AI Suggestions */}
        <div>
          <AISuggestions suggestions={suggestions} />
        </div>
      </div>

      {/* Performance Highlights */}
      <PerformanceHighlights 
        bestPerforming={bestPerforming}
        worstPerforming={worstPerforming}
      />
    </div>
  );
}

function ZapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

