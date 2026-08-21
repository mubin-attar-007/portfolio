import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { flagshipHome } from "@/content/home-visual";
import { Container } from "@/components/layout/container";

/**
 * ReliabilityBento — clerk.com's giant dark feature bento, adapted.
 *
 * The observed reference: a chamfered near-black plate (#131316, pt 128 /
 * pb 172) carrying a centred header and a grid of feature cards, each an
 * illustration well over a short title and one line of body. Here the cards
 * are the guarantees that recur across the four products — every body line
 * restates a mechanism or metric that content/projects.ts or content/evals.ts
 * already backs, so the bento is a re-arrangement of evidence, not a new set
 * of claims.
 *
 * Layout: a 6-column grid where `wide` cards span 3 and standard cards span 2
 * — Clerk's mixed-width rhythm — collapsing to two columns, then one. Cards
 * hover with the standard border-light answer; the glyph wells carry a faint
 * violet wash so the plate reads lit rather than flat.
 *
 * A11y: an `<ul>` of cards, each titled by an `<h3>`; glyphs are decorative
 * SVG (`aria-hidden`). The chamfer is a clip-path — geometry, not content.
 */
export function ReliabilityBento() {
  const b = flagshipHome.bento;

  return (
    <section
      className="tone-invert chamfer relative overflow-hidden pb-[var(--space-section-lg-end)] pt-[clamp(7rem,10vw,10.5rem)]"
      aria-labelledby="bento-title"
    >
      <div aria-hidden className="grid-field" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[56rem] -translate-x-1/2 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-accent)_19%,transparent),transparent)]"
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-[44rem] flex-col items-center text-center">
          <EyebrowChip variant="pill">{b.eyebrow}</EyebrowChip>
          <h2 id="bento-title" className="mt-4 text-balance text-section font-bold text-ink">
            {b.title}
          </h2>
          <p className="mt-4 max-w-[52ch] text-pretty text-base text-ink-secondary">{b.body}</p>
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
          {b.items.map((item) => (
            <li
              key={item.id}
              className={`group flex flex-col rounded-[var(--radius-md)] border border-border bg-surface p-5 transition-[border-color,transform] duration-base ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_38%,var(--color-border))] motion-reduce:hover:translate-y-0 ${
                "span" in item && item.span === 6 ? "lg:flex-row lg:items-center lg:gap-6 " : ""
              }${
                "span" in item && item.span === 6
                  ? "lg:col-span-6"
                  : "wide" in item && item.wide
                    ? "lg:col-span-3"
                    : "lg:col-span-2"
              }`}
            >
              <div
                className={`rounded-[var(--radius-sm)] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-accent)_9%,var(--color-bg-subtle)),var(--color-bg-subtle))] px-4 py-4 transition-[border-color,filter] duration-base ease-[var(--ease-out)] group-hover:border-[color-mix(in_srgb,var(--color-accent)_45%,var(--color-border))] group-hover:brightness-[1.25] ${
                  "span" in item && item.span === 6 ? "lg:w-72 lg:flex-none" : ""
                }`}
              >
                <BentoGlyph kind={item.glyph} />
              </div>
              <div className={"span" in item && item.span === 6 ? "lg:min-w-0 lg:flex-1" : ""}>
                <h3
                  className={`mt-4 text-[0.9375rem] font-[550] leading-snug text-ink ${
                    "span" in item && item.span === 6 ? "lg:mt-0" : ""
                  }`}
                >
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/**
 * BentoGlyph — nine small line drawings, one per guarantee, sharing a single
 * 120×36 viewBox and one stroke vocabulary so they read as one hand. Each
 * draws its card's actual mechanism (a gate one path fails, a fan-in route, a
 * lock below the route line, a scrambled-vs-flat pair of traces…) rather than
 * decorating the heading with an icon.
 */
function BentoGlyph({ kind }: { kind: string }) {
  const line = "stroke-[color-mix(in_srgb,currentColor_35%,transparent)]";
  const hot = "stroke-accent";
  return (
    <svg
      viewBox="0 0 120 36"
      className="block h-9 w-full text-ink"
      fill="none"
      strokeWidth="1.25"
      strokeLinecap="round"
      aria-hidden
      focusable="false"
    >
      {kind === "gate" ? (
        <>
          <path className={line} d="M4 10 H52 M4 18 H52 M4 26 H52" />
          <rect className={hot} x="56" y="6" width="3" height="24" rx="1.5" fill="currentColor" fillOpacity="0.15" />
          <path className={hot} d="M63 10 H116 M63 26 H116" />
          <path className={line} strokeDasharray="3 3" d="M63 18 H96" />
          <path className={line} d="M102 15 l6 6 M108 15 l-6 6" />
        </>
      ) : null}
      {kind === "retrieval" ? (
        <>
          <circle className={hot} cx="10" cy="18" r="3" />
          {[6, 14, 22, 30].map((y, i) => (
            <path key={y} className={i === 1 || i === 2 ? hot : line} d={`M14 18 C34 18 40 ${y} 60 ${y}`} />
          ))}
          <path className={hot} d="M64 14 C84 14 88 18 104 18 M64 22 C84 22 88 18 104 18" />
          <rect className={hot} x="104" y="13" width="12" height="10" rx="2" />
        </>
      ) : null}
      {kind === "matrix" ? (
        <>
          {Array.from({ length: 8 }).map((_, c) =>
            Array.from({ length: 3 }).map((__, r) => {
              const miss = (c === 2 && r === 1) || (c === 6 && r === 0);
              return miss ? (
                <rect key={`${c}${r}`} className={line} x={8 + c * 14} y={6 + r * 9} width="9" height="6" rx="1.5" strokeDasharray="2 2" />
              ) : (
                <rect key={`${c}${r}`} x={8 + c * 14} y={6 + r * 9} width="9" height="6" rx="1.5" fill="currentColor" className="fill-accent" fillOpacity="0.55" stroke="none" />
              );
            }),
          )}
        </>
      ) : null}
      {kind === "route" ? (
        <>
          {[6, 12, 18, 24, 30].map((y, i) => (
            <path key={y} className={i === 0 ? hot : line} d={`M6 ${y} H44 C60 ${y} 64 18 80 18`} />
          ))}
          <path className={hot} d="M80 18 H108" />
          <circle className={hot} cx="112" cy="18" r="3" />
        </>
      ) : null}
      {kind === "lock" ? (
        <>
          <path className={line} d="M4 12 H116" />
          <rect className={hot} x="52" y="18" width="16" height="12" rx="2" />
          <path className={hot} d="M56 18 v-3 a4 4 0 0 1 8 0 v3" />
          <path className={line} d="M4 30 H44 M76 30 H116" />
        </>
      ) : null}
      {kind === "wave" ? (
        <>
          <path className={hot} d="M4 22 L24 22 L34 12 L48 28 L58 18 L72 18" />
          <path className={line} strokeDasharray="3 3" d="M72 18 L82 6 L90 30 L98 4 L106 26 L116 10" />
          <path className={line} d="M72 4 V32" />
        </>
      ) : null}
      {kind === "scale" ? (
        <>
          <path className={line} d="M14 30 H106" />
          <rect className={line} x="24" y="12" width="20" height="18" rx="2" strokeDasharray="2.5 2.5" />
          <rect className={hot} x="66" y="17" width="20" height="13" rx="2" fill="currentColor" fillOpacity="0.12" />
          <path className={hot} d="M70 23 l4 4 7-8" />
        </>
      ) : null}
      {kind === "shield" ? (
        <>
          <path className={hot} d="M60 5 l14 5 v9 c0 7-6 11-14 13 -8-2-14-6-14-13 v-9 z" />
          <path className={hot} d="M53 18 l5 5 9-10" />
          <path className={line} d="M4 18 H38 M82 18 H116" strokeDasharray="3 3" />
        </>
      ) : null}
      {kind === "pipeline" ? (
        <>
          <path className={line} d="M8 18 H112" />
          <path className={hot} d="M8 18 H88" />
          {[8, 34, 60, 86, 112].map((x, i) => (
            <circle key={x} className={i < 4 ? hot : line} cx={x} cy="18" r="3.5" fill={i < 4 ? "currentColor" : "none"} fillOpacity={i < 4 ? 0.2 : undefined} />
          ))}
        </>
      ) : null}
    </svg>
  );
}
