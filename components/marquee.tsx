const ITEMS = [
  "FastAPI", "Next.js", "Postgres / Neon", "LangGraph", "pgvector", "XGBoost",
  "Docker", "HF Spaces", "Vercel", "Redis", "Django / DRF", "Tailwind",
];

export function Marquee() {
  return (
    <section className="marquee relative overflow-hidden border-y border-line py-4" aria-label="Core stack">
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center gap-8 px-4" aria-hidden={k === 1}>
            {ITEMS.map((it) => (
              <span key={it} className="mono whitespace-nowrap text-sm text-dim">
                {it}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-bg to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-bg to-transparent sm:w-32" />
    </section>
  );
}
