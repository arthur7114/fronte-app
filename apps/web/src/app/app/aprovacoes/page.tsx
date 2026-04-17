import { PageHeader } from "@/components/page-header";
import { ApprovalCenterPanel } from "@/components/approval-center-panel";
import { loadAutomationWorkspaceData } from "../estrategias/data";

export default async function ApprovalCenterPage() {
  const data = await loadAutomationWorkspaceData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Centro de Aprovação"
        title="Sua pauta operacional do dia."
        description="Analise o que a IA preparou e tome as decisões finais. Aqui você aprova Keywords, Temas e Artigos para manter o motor editorial girando."
      />

      <div className="px-8">
        <ApprovalCenterPanel 
          keywords={data.keywords}
          topics={data.topics}
          posts={data.posts}
          strategies={data.strategies}
        />
      </div>
    </div>
  );
}
