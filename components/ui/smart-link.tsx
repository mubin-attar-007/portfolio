import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * How a destination is reached: a page of this app, a file served as-is, a
 * place on the current page, or another site.
 */
export type LinkKind = "route" | "file" | "anchor" | "external";

const FILE = /\.[a-z0-9]+$/i;

/**
 * The kind of a destination, from its href alone: `#id` is an anchor;
 * `http(s):`, `mailto:` and `tel:` are external; a path whose last segment has
 * an extension (`/rss.xml`, `/llms.txt`, a PDF) is a file; any other `/path` is
 * a route.
 */
export function linkKind(href: string): LinkKind {
  if (href.startsWith("#")) return "anchor";
  if (!href.startsWith("/") || href.startsWith("//")) return "external";
  const path = href.split(/[?#]/, 1)[0] ?? href;
  return FILE.test(path) ? "file" : "route";
}

export type SmartLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  /** Overrides the kind read from `href` (rarely needed). */
  kind?: LinkKind;
  /** Opens in a new tab, with `rel="noopener noreferrer"` and a spoken note. Web links only. */
  newTab?: boolean;
  children: ReactNode;
};

/**
 * SmartLink — the one place that decides which element a link is.
 *
 * - A route renders `next/link` with `prefetch={false}`: prefetch is opt-in
 *   site-wide (spec/ENGINEERING.md §5); only the primary nav prefetches, on intent.
 * - A file, an anchor or another site renders a plain `<a>`, so the router never
 *   tries to navigate to a feed or a PDF.
 * - `newTab` adds `target="_blank"`, `rel="noopener noreferrer"` and a
 *   visually hidden "(opens in a new tab)" so the change of context is announced.
 *
 * A11y: a real link; its children are its name. Works in server and client
 * components (no hooks).
 */
export function SmartLink({ href, kind = linkKind(href), newTab = false, children, ...rest }: SmartLinkProps) {
  const body = newTab ? (
    <>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  ) : (
    children
  );
  if (kind === "route" && !newTab) {
    return (
      <Link href={href} prefetch={false} {...rest}>
        {body}
      </Link>
    );
  }
  return (
    <a href={href} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
      {body}
    </a>
  );
}
