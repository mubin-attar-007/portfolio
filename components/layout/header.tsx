import { LogoLink } from "./logo-link";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { Assistant } from "@/components/features/assistant";

/**
 * Header — a floating, fully-rounded pill nav (Clerk-style): logo, primary nav,
 * the grounded assistant launcher, theme toggle, and the mobile drawer. Sticky,
 * it floats over the page with a blurred surface, inset from the top edge rather
 * than welded to it — the gap above is what makes it read as a floating object
 * instead of a page-wide bar, so `pt` here is structural, not decorative.
 * The left inset is deeper than the right because the right end terminates in
 * controls that carry their own padding; a symmetric inset would look lopsided.
 *
 * Elevation is earned, not worn: `.header-pill` (globals.css) runs a
 * scroll-driven CSS animation that fades the border, tint and shadow in over
 * the first --scroll-cue-range of the document, so the pill is weightless on
 * the hero and solid once content passes beneath it. The Tailwind classes here
 * are the resting fallback for browsers without scroll-timeline support, which
 * is why they still describe the fully-elevated state.
 *
 * Performance: no scroll listener and no client boundary — this stays a Server
 * Component. The whole effect is CSS reading scroll position.
 *
 * A11y: <header> landmark; nav is labelled; all controls keyboard operable with
 * visible focus. The animation touches colour and shadow only — no motion, and
 * no contrast change for the pill's own text (it sits on the page background
 * either way).
 */
export function Header() {
  return (
    // The negative bottom margin exactly cancels the header's flow height
    // (pt-3 + h-14 = 4.25rem; sm: pt-4 + h-14 = 4.5rem), so the page's first
    // band starts at the TOP of the viewport and runs underneath the pill.
    // Without this the hero's aurora began below the header, leaving a strip of
    // plain page background behind the menu — a visible seam Clerk doesn't
    // have: their gradient bleeds from the viewport edge and the pill floats
    // over it. Every route's first Section pads far more than the header's
    // height, so nothing can collide with the pill.
    <header className="sticky top-0 z-40 -mb-17 px-3 pt-3 sm:-mb-18 sm:px-4 sm:pt-4">
      <div className="header-pill mx-auto flex h-14 w-full max-w-[var(--width-container)] items-center justify-between rounded-[var(--radius-pill)] border border-border bg-bg/80 pl-6 pr-3 shadow-[var(--shadow-md)] backdrop-blur-md">
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
