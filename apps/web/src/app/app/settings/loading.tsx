import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function SettingsLoading() {
  return (
    <section className="grid gap-6 xl:grid-cols-[18.5rem_minmax(0,1fr)]">
      <aside className="space-y-4">
        <LoadingSkeleton className="h-[180px] rounded-[28px]" />
        <div className="space-y-2">
          <LoadingSkeleton className="h-16 rounded-[24px]" />
          <LoadingSkeleton className="h-16 rounded-[24px]" />
          <LoadingSkeleton className="h-16 rounded-[24px]" />
          <LoadingSkeleton className="h-16 rounded-[24px]" />
          <LoadingSkeleton className="h-16 rounded-[24px]" />
        </div>
      </aside>

      <div className="space-y-6">
        <LoadingSkeleton className="h-[260px] rounded-[32px]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <LoadingSkeleton className="h-[480px] rounded-[32px]" />
          <LoadingSkeleton className="h-[480px] rounded-[32px]" />
        </div>
      </div>
    </section>
  );
}
