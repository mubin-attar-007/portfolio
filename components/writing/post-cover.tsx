import type { ReactNode } from "react";
import { writingPage } from "@/content/pages/writing";
import { cx } from "@/components/ui/cx";
import styles from "./post-cover.module.css";

/**
 * PostCover — the typeset cover for an essay or guide (Clerk Blog): a brand
 * row, the title set large, and a small original illustration of the post's
 * idea. One component serves the index card and the article page; it scales
 * with its own width (container units), so the wide article cover is the same
 * object, bigger.
 *
 * The illustration comes from `COVER_ART`, keyed by slug. A new post with no
 * entry gets `DefaultArt`, so a cover is never missing.
 *
 * A11y: decorative (`aria-hidden`): the real title is the card's heading or the
 * page's h1. Performance: CSS and inline SVG only, no raster, no client JS.
 * Motion: on hover/focus of the enclosing link the art leans in and the shadow
 * deepens (transform and box-shadow; instant under reduced motion).
 */
export function PostCover({
  slug,
  title,
  className,
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const Art = COVER_ART[slug] ?? DefaultArt;
  return (
    <div aria-hidden="true" className={cx(styles.cover, className)}>
      <span className={styles.brand}>
        <span className={styles.mark}>MA</span>
        {writingPage.coverBrand}
      </span>
      <p className={styles.title}>{title}</p>
      <div className={styles.art}>
        <Art />
      </div>
    </div>
  );
}

/** Validator: three statements, two refused. */
function ValidatorArt() {
  const rows: [string, "deny" | "allow"][] = [
    ["DROP TABLE users;", "deny"],
    ["SELECT … LIMIT 50", "allow"],
    ["SELECT 1; DELETE …", "deny"],
  ];
  return (
    <div className={styles.sheet}>
      {rows.map(([sql, verdict]) => (
        <div key={sql} className={styles.row}>
          <span>{sql}</span>
          <span className={cx(styles.verdict, styles[verdict])}>
            {verdict === "deny" ? "Denied" : "Allowed"}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Trust: a shield that fails closed. */
function ShieldArt() {
  return (
    <Stack tag="Fails closed">
      <svg className={styles.shield} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v5.2c0 4.4-2.9 7.9-7 9.8-4.1-1.9-7-5.4-7-9.8V6z" className="fill-accent-soft" />
        <path d="M9 12l2.2 2.2L15.5 10" className="stroke-accent" strokeWidth="1.4" />
      </svg>
    </Stack>
  );
}

/** Look-ahead: closed candles left of "now", unknown ones dashed to its right. */
function CandlesArt() {
  const closed: [number, number, number, number, number, boolean][] = [
    // x, wick top, wick bottom, body top, body height, rising
    [14, 30, 80, 44, 24, true],
    [32, 36, 86, 50, 22, false],
    [50, 26, 70, 34, 26, true],
    [68, 20, 62, 28, 22, true],
  ];
  const future: [number, number, number, number, number][] = [
    [104, 14, 58, 22, 24],
    [122, 24, 70, 32, 26],
    [140, 10, 50, 18, 22],
  ];
  return (
    <Stack tag="Closed bars only">
      <svg className={styles.svg} viewBox="0 0 160 110">
        <g className="stroke-ink" strokeWidth="1.2">
          {closed.map(([x, y1, y2, by, bh, up]) => (
            <g key={x}>
              <line x1={x} y1={y1} x2={x} y2={y2} />
              <rect x={x - 4} y={by} width="8" height={bh} stroke="none" className={up ? "fill-positive" : "fill-negative"} />
            </g>
          ))}
        </g>
        <g className="stroke-border-strong" strokeWidth="1.2" strokeDasharray="2 2" fill="none">
          {future.map(([x, y1, y2, by, bh]) => (
            <g key={x}>
              <line x1={x} y1={y1} x2={x} y2={y2} />
              <rect x={x - 4} y={by} width="8" height={bh} />
            </g>
          ))}
        </g>
        <line x1="86" y1="4" x2="86" y2="96" className="stroke-accent" strokeWidth="1.4" strokeDasharray="4 3" />
        <text x="90" y="104" fontSize="9" className="fill-accent">
          now
        </text>
      </svg>
    </Stack>
  );
}

/** Retrieval: a schema of many tables, the top-k few lifted into the prompt. */
function RetrievalArt() {
  const tables = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const picked = new Set([1, 5, 6]);
  return (
    <Stack tag="Top-k tables, per question">
      <svg className={styles.svg} viewBox="0 0 160 96">
        {tables.map((t) => {
          const x = 6 + (t % 3) * 22;
          const y = 8 + Math.floor(t / 3) * 28;
          const on = picked.has(t);
          return (
            <g key={t}>
              <rect x={x} y={y} width="18" height="20" rx="3" className={on ? "fill-accent-soft stroke-accent" : "fill-surface stroke-border-strong"} strokeWidth="1" />
              <line x1={x + 4} y1={y + 7} x2={x + 14} y2={y + 7} className={on ? "stroke-accent" : "stroke-border-strong"} strokeWidth="1" />
              <line x1={x + 4} y1={y + 12} x2={x + 11} y2={y + 12} className={on ? "stroke-accent" : "stroke-border-strong"} strokeWidth="1" />
            </g>
          );
        })}
        <path d="M76 48 H95" className="stroke-ink" strokeWidth="1.2" />
        <path d="M93 44.5 L97 48 L93 51.5" className="stroke-ink" strokeWidth="1.2" fill="none" />
        <rect x="104" y="18" width="50" height="60" rx="5" className="fill-surface stroke-ink" strokeWidth="1.2" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="111" y={27 + i * 15} width="36" height="10" rx="2" className="fill-accent-soft stroke-accent" strokeWidth="1" />
        ))}
      </svg>
    </Stack>
  );
}

/** Any post without its own art: a page of ruled lines with one highlighted. */
function DefaultArt() {
  return (
    <svg className={styles.svg} viewBox="0 0 160 110">
      <rect x="36" y="8" width="88" height="94" rx="6" className="fill-surface stroke-border-strong" strokeWidth="1.2" />
      {[24, 36, 48, 60, 72, 84].map((y, i) => (
        <line key={y} x1="48" y1={y} x2={i % 3 === 2 ? 92 : 112} y2={y} className={i === 2 ? "stroke-accent" : "stroke-border-strong"} strokeWidth={i === 2 ? 2 : 1.2} strokeLinecap="round" />
      ))}
    </svg>
  );
}

function Stack({ tag, children }: { tag: string; children: ReactNode }) {
  return (
    <div className={styles.stack}>
      {children}
      <span className={styles.tag}>{tag}</span>
    </div>
  );
}

/** Per-post cover illustrations, keyed by slug. */
const COVER_ART: Record<string, () => ReactNode> = {
  "a-validator-is-not-a-better-prompt": ValidatorArt,
  "trust-is-not-a-safety-model": ShieldArt,
  "look-ahead-free-by-construction": CandlesArt,
  "retrieval-beats-stuffing": RetrievalArt,
};
