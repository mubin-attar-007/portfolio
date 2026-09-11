"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/config/nav";
import styles from "./nav-links.module.css";

/**
 * NavLink — one destination.
 *
 * The active state is expressed TWICE and never by colour alone: full-ink text
 * (against secondary-ink for the rest) plus a persistent accent rule. Hover and
 * keyboard focus add a neutral surface and rule without implying a route change;
 * `aria-current="page"` remains the source of the selected appearance.
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
      className={styles.link}
    >
      {label}
      <span
        aria-hidden
        className={styles.indicator}
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
    <nav aria-label="Primary" className={styles.nav}>
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return <NavLink key={item.href} href={item.href} label={item.label} active={active} />;
      })}
    </nav>
  );
}
