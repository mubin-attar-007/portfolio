"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/config/nav";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      href={href}
      // These routes are static but several carry long case-study/article RSC
      // payloads. Prefetch on demonstrated intent instead of downloading every
      // visible destination during the initial Lighthouse/user visit.
      prefetch={!active && intent ? null : false}
      onMouseEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
      aria-current={active ? "page" : undefined}
      className={`text-sm font-medium transition-colors ${
        active ? "text-accent" : "text-ink-secondary hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * NavLinks — desktop primary nav with an active state (the one accent this
 * region is allowed). Routes prefetch on pointer/keyboard intent, not merely
 * because all five links entered the viewport. A11y: `aria-current="page"` on
 * the active route.
 */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={active}
          />
        );
      })}
    </nav>
  );
}
