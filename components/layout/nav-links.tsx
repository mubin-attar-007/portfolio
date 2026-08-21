"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/config/nav";

/**
 * NavLink — one destination.
 *
 * The active state is expressed TWICE and never by colour alone: full-ink text
 * (against secondary-ink for the rest) plus a 1.5px accent rule tucked under the
 * label. Both are visible to a reader who cannot distinguish the accent, and
 * `aria-current="page"` carries it to assistive technology.
 *
 * Prefetch fires on demonstrated intent (hover or focus), not merely because the
 * link entered the viewport: several of these routes carry long case-study RSC
 * payloads, and downloading all four during the first paint is exactly the kind
 * of invisible cost that shows up as a slower LCP.
 */
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      href={href}
      prefetch={!active && intent ? null : false}
      onMouseEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
      aria-current={active ? "page" : undefined}
      className={`relative py-1 text-[0.8125rem] font-medium transition-colors duration-fast ease-[var(--ease-out)] ${
        active ? "text-ink" : "text-ink-secondary hover:text-ink"
      }`}
    >
      {label}
      <span
        aria-hidden
        className={`pointer-events-none absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left rounded-[var(--radius-pill)] bg-accent transition-transform duration-base ease-[var(--ease-out)] ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </Link>
  );
}

/**
 * NavLinks — the desktop primary nav.
 *
 * A11y: a labelled `<nav>` landmark; the active route is marked with
 * `aria-current="page"`.
 */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return <NavLink key={item.href} href={item.href} label={item.label} active={active} />;
      })}
    </nav>
  );
}
