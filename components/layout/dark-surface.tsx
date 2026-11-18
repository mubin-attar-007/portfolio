import type { ElementType, ReactNode } from "react";

/**
 * DarkSurface — marks a dark page (/about, /evals, the 404): renders
 * `data-surface="dark"`, which paints the deep plate canvas, remaps every
 * colour token inside it to the plate ramp (tokens.css), and — through
 * `html:has([data-surface="dark"])` — switches the nav, footer and launcher to
 * their dark variants. Wrap the page's content once.
 * Optionally also export `viewport = { themeColor: BROWSER_CHROME.dark }`.
 */
export function DarkSurface({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag data-surface="dark" className={className}>
      {children}
    </Tag>
  );
}
