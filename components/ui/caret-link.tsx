import type { ReactNode } from "react";
import { cx } from "./cx";
import { SmartLink, isWebLink, opensOutside } from "./smart-link";
import styles from "./caret-link.module.css";

/**
 * Caret — the arrow-swap glyph: two masked triangles in a clipped 10×8 box. When
 * the nearest link or button is hovered or focused, the first slides out to the
 * right and the second slides in from the left (`.caret-swap`, globals.css), so
 * a whole card can animate the caret of the link inside it.
 *
 * Decorative (`aria-hidden`). Reduced motion: the swap is instant.
 */
export function Caret({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cx("caret-swap", className)} />;
}

/**
 * ArrowOut — the out-arrow ↗ of a link that leaves the site (a new tab or a
 * mail client), and only of those (design-system §11.4). The caret's twin: the
 * arrow leaves up and to the right while a second arrives from the lower left
 * (`.arrow-out`, globals.css). `CaretLink` and `Button` add it themselves; use
 * it directly after a plain link's text, with `inline` inside a sentence.
 *
 * Decorative (`aria-hidden`): the link's spoken "(opens in a new tab)" or its
 * mailto address carries the meaning. Reduced motion: the swap is instant.
 */
export function ArrowOut({ inline = false, className }: { inline?: boolean; className?: string }) {
  return <span aria-hidden="true" className={cx("arrow-out", inline && "arrow-out-inline", className)} />;
}

export type CaretLinkProps = {
  href: string;
  children: ReactNode;
  /** `ink` (default) for a "read more"; `muted` beside other actions; `accent` for the one violet link in a band. */
  tone?: "ink" | "muted" | "accent";
  /** `sm` 14px (default, card and list links) or `md` 15px (a section's "more" link). */
  size?: "sm" | "md";
  /** `strong` (default) is 600; `regular` is 500, for a quieter link under body copy. */
  weight?: "strong" | "regular";
  /** Opens another site in a new tab (announced). Defaults to true for web links outside the site. */
  newTab?: boolean;
  className?: string;
};

/**
 * CaretLink — the site's "go" link: a label followed by the arrow-swap caret
 * (prototype `.caret`, `.more`). The one forward affordance, everywhere: section
 * "more" links, card links, list rows.
 *
 * Variants: `tone` (ink · muted · accent), `size` (sm · md), `weight`.
 * Every tone adapts to dark plates and pages through the colour tokens.
 * A link that leaves the site (a new tab or a mail client) carries the
 * out-arrow ↗ instead of the caret.
 *
 * A11y: a real link whose label is its name; the caret is decorative. Its
 * minimum height is 24px (WCAG 2.5.8). A new-tab link says so to screen readers.
 * Performance: server-safe, no client JS; routes never prefetch (SmartLink).
 */
export function CaretLink({
  href,
  children,
  tone = "ink",
  size = "sm",
  weight = "strong",
  newTab,
  className,
}: CaretLinkProps) {
  const opensTab = newTab ?? isWebLink(href);
  return (
    <SmartLink
      href={href}
      newTab={opensTab}
      className={cx(styles.link, styles[tone], styles[size], weight === "regular" && styles.regular, className)}
    >
      <span>{children}</span>
      {opensOutside(href, opensTab) ? <ArrowOut /> : <Caret />}
    </SmartLink>
  );
}
