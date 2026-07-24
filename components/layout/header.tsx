import { LogoLink } from "./logo-link";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { Assistant } from "@/components/features/assistant";

/**
 * Header — a calm, sticky navigation bar. It is intentionally solid and flat:
 * no pill shell, blur, gradient, or decorative elevation. The compact mobile
 * menu and assistant remain true overlays and own their overlay shadows.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 w-full max-w-[var(--width-container)] items-center justify-between px-6 sm:px-8">
        <LogoLink />

        <div className="flex items-center gap-2 lg:gap-5">
          <NavLinks />
          <Assistant />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
