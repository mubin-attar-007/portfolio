import type { ReactNode } from "react";
import { stagger } from "@/constants/page";

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
 * - `kicker` — the branded page eyebrow: an accent mark plus a short mono label.
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
 * Type: Clerk's measured header scale — weight 700, 1.1 line-height, -0.025em
 * tracking, clamping to 56px on desktop. That is one step BELOW the homepage
 * hero's 64px ceiling, deliberately: the hero stays the largest type on the
 * site, so arriving on an index route still reads as going one level in.
 *
 * A11y: renders the page's single `<h1>`. The accent mark beside the kicker is
 * `aria-hidden` decoration and carries no meaning that the label does not.
 * The kicker's TEXT is `ink-secondary`, not accent, and that is a correctness
 * decision rather than a stylistic one: these headers sit on an `aurora` band,
 * whose violet stop is strongest exactly where the eyebrow sits, and accent text
 * composited over that tint measures ~3.6:1 — below AA for body-size text. The
 * homepage hero already had to make the same swap at the same position in the
 * same gradient. The accent survives as the mark, which is a non-text element
 * and clears the 3:1 bar it is held to.
 *
 * Performance: the h1 is the LCP element on these routes, so it is the one child
 * with NO entrance animation and no `--i` — it paints immediately while the
 * elements around it fade in. This is why the stagger runs 1, (skip 2), 3, 4.
 * The same rule is honoured by the homepage hero. No client boundary; the whole
 * entrance is CSS, and `.hero-item` is defined only inside a
 * `prefers-reduced-motion: no-preference` block, so reduced motion renders the
 * header at rest rather than hidden.
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
    // `relative z-10`: on an `aurora` band the gradient is painted by an ::after
    // that follows the container in DOM order, so header content needs its own
    // layer or the wash tints the type instead of the ground behind it.
    <header
      className={`reveal-stagger relative z-10 flex flex-col ${
        centered ? "items-center text-center" : ""
      }`}
    >
      {kicker ? (
        <p
          className="hero-item inline-flex w-fit items-center gap-2.5 font-mono text-xs uppercase tracking-[0.04em] text-ink-secondary"
          style={stagger(1)}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            aria-hidden
          />
          {kicker}
        </p>
      ) : null}
      {meta ? (
        <p
          className={`hero-item font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary ${
            kicker ? "mt-3" : ""
          }`}
          style={stagger(1)}
        >
          {meta}
        </p>
      ) : null}
      <h1
        className={`${
          eyebrow ? "mt-6" : ""
        } max-w-[20ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.025em] text-ink`}
      >
        {title}
      </h1>
      {/* `text-pretty`, not `text-balance`: at 62ch this is a two-line
          paragraph, and balancing it would leave a short orphan line under a
          headline that is already balanced. */}
      {lede ? (
        <p
          className="hero-item mt-6 max-w-[62ch] text-pretty text-lg text-ink-secondary"
          style={stagger(3)}
        >
          {lede}
        </p>
      ) : null}
      {children ? (
        <div
          className={`hero-item mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 ${
            centered ? "justify-center" : ""
          }`}
          style={stagger(4)}
        >
          {children}
        </div>
      ) : null}
    </header>
  );
}
