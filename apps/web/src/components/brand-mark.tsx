import Link from "next/link";

type BrandMarkProps = {
  subtle?: boolean;
};

export function BrandMark({ subtle = false }: BrandMarkProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span
        className={[
          "flex h-11 w-11 items-center justify-center border text-sm font-semibold uppercase tracking-[0.2em]",
          subtle
            ? "border-black/15 bg-white/80 text-black"
            : "border-black bg-black text-white",
        ].join(" ")}
      >
        S
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold uppercase tracking-[0.32em] text-black/60">
          Super
        </span>
        <span className="text-xs uppercase tracking-[0.26em] text-black/35">
          Base do produto
        </span>
      </span>
    </Link>
  );
}
