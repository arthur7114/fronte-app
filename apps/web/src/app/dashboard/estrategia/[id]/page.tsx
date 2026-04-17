import { notFound } from "next/navigation";
import { StrategyDetailPanel } from "@/components/strategy-detail-panel";
import { loadAutomationWorkspaceData } from "@/app/app/estrategias/data";
import { getBusinessBriefingForTenant } from "@/lib/business-briefing-data";

type StrategyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StrategyDetailPage({ params }: StrategyDetailPageProps) {
  const { id } = await params;
  const data = await loadAutomationWorkspaceData();
  const strategy = data.strategies.find((item) => item.id === id);

  if (!strategy) {
    notFound();
  }

  const briefing = await getBusinessBriefingForTenant(data.tenant.id);
  const strategyKeywords = data.keywords.filter((keyword) => keyword.strategy_id === id);
  const strategyTopics = data.topics.filter((topic) => topic.strategy_id === id);
  const strategyPosts = data.posts;

  return (
    <div className="space-y-6">
      <StrategyDetailPanel
        strategy={strategy}
        briefing={briefing}
        keywordCount={strategyKeywords.length}
        approvedKeywordCount={strategyKeywords.filter((keyword) => keyword.status === "approved").length}
        topicCount={strategyTopics.length}
        approvedTopicCount={strategyTopics.filter((topic) => topic.status === "approved").length}
        postCount={strategyPosts.length}
        pendingJobsCount={data.jobs.filter((job) => job.status === "pending" || job.status === "running").length}
      />
    </div>
  );
}
