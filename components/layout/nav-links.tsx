"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/config/nav";

/**
 * NavLinks — desktop primary nav with an active state (the one accent this
 * region is allowed). A11y: `aria-current="page"` on the active route.
 */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        // "Hire me" is the conversion action for a hiring audience — promote it to
        // a filled accent control so it clearly leads (the assistant keeps its own
        // bordered pill; both stay, the hire action just ranks above it).
        if (item.href === "/hire") {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              // A pill CTA inside a pill bar — a 6px-radius key inside a fully
              // rounded container reads as a mismatched part.
              className="rounded-[var(--radius-pill)] bg-accent px-4 py-1.5 text-sm font-medium text-on-accent shadow-[var(--shadow-btn)] transition-colors hover:bg-accent-hover active:translate-y-px"
            >
              {item.label}
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            // font-medium at 14px: Clerk's nav sits a notch heavier than body
            // text so it holds its own against the logo at small size.
            className={`text-sm font-medium transition-colors ${
              active ? "text-accent" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
