import { LogoLink } from "./logo-link";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { Assistant } from "@/components/features/assistant";

/**
 * Header — a floating, rounded "pill" nav (Clerk-style): logo, primary nav, the
 * grounded assistant launcher, theme toggle, and the mobile drawer. Sticky, it
 * floats over the page with a blurred, bordered surface. A11y: <header> landmark;
 * nav is labelled; all controls keyboard operable with visible focus.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex h-14 w-full max-w-[var(--width-container)] items-center justify-between rounded-[var(--radius-lg)] border border-border bg-bg/80 pl-5 pr-2.5 shadow-[var(--shadow-md)] backdrop-blur-md">
        <LogoLink />

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
