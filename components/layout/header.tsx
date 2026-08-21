import Link from "next/link";
import { HeaderShell } from "./header-shell";
import { LogoLink } from "./logo-link";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { Assistant } from "@/components/features/assistant";
import { buttonVariants } from "@/components/ui/button";
import { PRIMARY_CTA } from "@/config/nav";

/**
 * Header — wordmark left, four links centre-right, one primary action right.
 *
 * Composition rules this header follows and the previous one did not:
 *
 * 1. ONE action. Contact left the link list and became the button; a link and a
 *    button pointing at the same route is two calls to action wearing different
 *    clothes.
 * 2. The utilities (assistant, theme) are quiet icons in their own group,
 *    separated from the action by a hairline. They are tools, not destinations,
 *    and grouping them says so without a label.
 * 3. No capsule, no floating pill, no elevation. The chrome earns a background
 *    only once the page is scrolled — that state lives in `HeaderShell`.
 * 4. The primary action survives to `sm`. On a phone it moves into the menu,
 *    where it is the first thing under the links rather than a fifth row.
 *
 * The assistant shows its label and ⌘K hint only from `xl`, where there is room
 * for it beside the action. Below that it is the icon, with the same accessible
 * name and the same two keyboard shortcuts.
 */
export function Header() {
  return (
    <HeaderShell>
      <LogoLink />

      <div className="flex items-center gap-0.5 lg:gap-5">
        <NavLinks />

        <div className="flex items-center gap-0.5">
          <Assistant />
          <ThemeToggle />
        </div>

        {/* The divider and the action share ONE wrapper that owns the
            breakpoint. Putting `hidden` on the Link itself would collide with
            the `inline-flex` that `buttonVariants` already sets: two display
            utilities at equal specificity, where the winner is decided by
            stylesheet order rather than by the order they are written in — which
            is how the button stayed visible at 360px and pushed the header 16px
            past the viewport. */}
        <div className="hidden items-center pl-1.5 sm:flex">
          <Link
            href={PRIMARY_CTA.href}
            prefetch={false}
            className={buttonVariants("primary", "sm")}
          >
            {PRIMARY_CTA.label}
          </Link>
        </div>

        <MobileNav />
      </div>
    </HeaderShell>
  );
}
