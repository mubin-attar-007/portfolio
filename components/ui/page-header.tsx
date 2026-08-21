import type { ReactNode } from "react";
import { EyebrowChip } from "./eyebrow-chip";

/**
 * PageHeader — the ONE page-top used by every route, so a visitor arriving on
 * /notes reads the same object they read on /work. Before this existed each
 * route had grown its own header (four different h1 sizes, three different
 * kicker treatments, two different ledes measures), which is what made the site
 * read as a designed homepage bolted to a set of drafts.
 *
 * Structure, top to bottom: kicker → h1 → lede → actions.
 *
 * Props:
 * - `kicker` — the branded page eyebrow: a short mono label.
 *   Use on index/landing routes.
 * - `meta` — a factual metadata line (status · role · timeline) for case
 *   studies. Deliberately a SEPARATE slot from `kicker` rather than one prop
 *   with a tone flag: they carry different information (a brand label vs. a
 *   record about this document) and are styled to say so.
 * - `title` — the h1. Held to ~20ch so it always breaks to two balanced lines at
 *   the desktop size rather than running as one thin ribbon.
 * - `lede` — one supporting paragraph, capped at 62ch.
 * - `align` — `start` (default) or `center`. Left is the norm; `center` exists
 *   for a header that opens a dark band, where the site already centres (see
 *   SectionHeading's align alternation).
 * - `children` — the actions slot: CTAs, a feed link, a cross-reference.
 *
 * Type: the shared `--text-section` step (32px → 52px). One step BELOW the
 * homepage hero's `--text-display` (40px → 84px), deliberately: the hero stays
 * the largest type on the site, so arriving on an index route still reads as
 * going one level in. Both are tokens, so the gap between them is a design
 * decision in tokens.css rather than two clamps in two files that happen to
 * differ today.
 *
 * A11y: renders the page's single `<h1>`. Performance: the entire header paints
 * immediately; the h1 is commonly the LCP element on index routes.
 */
export function PageHeader({
  kicker,
  meta,
  title,
  lede,
  align = "start",
  children,
}: {
  kicker?: string;
  meta?: string;
  title: string;
  lede?: string;
  align?: "start" | "center";
  children?: ReactNode;
}) {
  const centered = align === "center";
  const eyebrow = kicker ?? meta;
  return (
    <header
      className={`flex flex-col ${
        centered ? "items-center text-center" : ""
      }`}
    >
      {kicker ? <EyebrowChip>{kicker}</EyebrowChip> : null}
      {meta ? (
        <p className={`font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary ${
          kicker ? "mt-3" : ""
        }`}>
          {meta}
        </p>
      ) : null}
      <h1
        className={`${
          eyebrow ? "mt-6" : ""
        } max-w-[20ch] text-balance text-section font-[560] text-ink`}
      >
        {title}
      </h1>
      {/* `text-pretty`, not `text-balance`: at 62ch this is a two-line
          paragraph, and balancing it would leave a short orphan line under a
          headline that is already balanced. */}
      {lede ? (
        <p className="mt-6 max-w-[62ch] text-pretty text-lg text-ink-secondary">
          {lede}
        </p>
      ) : null}
      {children ? (
        <div className={`mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 ${
          centered ? "justify-center" : ""
        }`}>
          {children}
        </div>
      ) : null}
    </header>
  );
}
