import Link from "next/link";

type AutomationNavProps = {
  active: "overview" | "topics" | "briefs" | "jobs";
  topicCount: number;
  briefCount: number;
  jobCount: number;
};

const NAV_ITEMS = [
  { href: "/app/estrategias", key: "overview", label: "Resumo" },
  { href: "/app/estrategias/topics", key: "topics", label: "Temas" },
  { href: "/app/estrategias/briefs", key: "briefs", label: "Briefings" },
  { href: "/app/jobs", key: "jobs", label: "Fila" },
] as const;

export function AutomationNav({
  active,
  topicCount,
  briefCount,
  jobCount,
}: AutomationNavProps) {
  const counts = {
    overview: `${topicCount + briefCount + jobCount}`,
    topics: `${topicCount}`,
    briefs: `${briefCount}`,
    jobs: `${jobCount}`,
  };

  return (
    <section className="border border-black/12 bg-[rgba(255,255,255,0.84)] p-5 shadow-[0_24px_80px_rgba(17,17,17,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
        Navegacao
      </p>
      <div className="mt-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center justify-between border px-4 py-3 text-sm transition duration-200 hover:-translate-y-0.5 ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white/80 text-black"
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span
                className={`text-[11px] uppercase tracking-[0.22em] ${
                  isActive ? "text-white/80" : "text-black/45"
                }`}
              >
                {counts[item.key]}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 border-t border-black/10 pt-4 text-sm leading-7 text-black/62">
        <p>Runtime de IA: OpenAI via ambiente do projeto.</p>
        <p>Fluxo humano: temas, briefings e jobs seguem curadoria manual.</p>
      </div>
    </section>
  );
}

