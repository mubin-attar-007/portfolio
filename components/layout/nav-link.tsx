"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

/**
 * How `href` relates to the current path: the page itself, a page inside its
 * section, or neither. A link to an anchor (`/work#field`) is never current.
 */
export function currentness(pathname: string, href: string): "page" | "true" | undefined {
  if (href.includes("#")) return undefined;
  const path = href.split("?", 1)[0] ?? href;
  if (pathname === path) return "page";
  if (path !== "/" && pathname.startsWith(`${path}/`)) return "true";
  return undefined;
}

/**
 * NavLink — a primary-navigation link: marks itself current
 * (`aria-current="page"` on its page, `"true"` inside its section) and
 * prefetches on intent.
 *
 * Prefetch: only after hover or focus, never by viewport (spec/ENGINEERING.md
 * §5), and never for the page already shown.
 * A11y: a real link; its children are its name; `aria-current` drives the
 * selected style, so the state is never colour alone.
 */
export function NavLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const [intent, setIntent] = useState(false);
  const current = currentness(pathname, href);
  return (
    <Link
      href={href}
      prefetch={!current && intent ? null : false}
      onMouseEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
      aria-current={current}
      className={className}
    >
      {children}
    </Link>
  );
}
