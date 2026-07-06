import Link from "next/link";
import { SITE } from "@/config/site";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { Assistant } from "@/components/features/assistant";

/**
 * Header — site masthead. Logo (name in mono), primary nav, the grounded
 * "Ask about my work" assistant launcher, theme toggle, and the mobile drawer.
 * A11y: <header> landmark; nav is labelled; all controls keyboard operable with
 * visible focus.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 w-full max-w-[var(--width-container)] items-center justify-between px-6 md:px-8">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight text-ink"
          aria-label={`${SITE.name} — home`}
        >
          {SITE.name.toLowerCase().replace(/\s+/g, " ")}
        </Link>

        <div className="flex items-center gap-2 md:gap-5">
          <NavLinks />
          <Assistant />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
