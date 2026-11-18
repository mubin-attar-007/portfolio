import type { ReactNode } from "react";
import { cx } from "./cx";
import { Kicker } from "./kicker";

/**
 * PageHeader — the one page top (prototype `.page-head`): kicker → h1 → lead →
 * actions, so every route opens on the same object.
 *
 * Props:
 * - `kicker` — the violet line above the title.
 * - `meta` — a factual line under the kicker (status · role · timeline), in the
 *   quieter tertiary ink. Separate from `kicker` because it is a record, not a label.
 * - `title` — the page's `<h1>`.
 * - `lede` — one supporting paragraph (the page lead, 17 → 20px, held to 600px).
 * - `align` — `start` (default) or `center` (a centred hero).
 * - `size` — `display` (default, 40 → 64px) or `section` (28 → 40px, an article title).
 * - `titleId` — an id for the `<h1>`, to label the page's first section.
 * - `children` — the actions row (buttons, a feed link).
 *
 * Spacing: none outside itself. Put it in `<Section space="head">` for the
 * prototype's 96/64px page-head rhythm.
 *
 * A11y: renders the page's single `<h1>`. Performance: server-only and static;
 * the h1 is often the LCP element, so nothing here animates in.
 */
export function PageHeader({
  kicker,
  meta,
  title,
  lede,
  align = "start",
  size = "display",
  titleId,
  className,
  children,
}: {
  kicker?: string;
  meta?: string;
  title: string;
  lede?: string;
  align?: "start" | "center";
  size?: "display" | "section";
  titleId?: string;
  className?: string;
  children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <header className={cx("flex flex-col", centered && "items-center text-center", className)}>
      {kicker ? <Kicker className="mb-4">{kicker}</Kicker> : null}
      {meta ? <p className="mb-4 text-sm text-ink-tertiary">{meta}</p> : null}
      <h1
        id={titleId}
        className={cx(size === "display" ? "text-display" : "text-section", "text-ink")}
      >
        {title}
      </h1>
      {lede ? (
        <p className="mt-[22px] max-w-[600px] text-page-lead text-ink-secondary">{lede}</p>
      ) : null}
      {children ? (
        <div className={cx("mt-8 flex flex-wrap items-center gap-x-3 gap-y-3", centered && "justify-center")}>
          {children}
        </div>
      ) : null}
    </header>
  );
}
