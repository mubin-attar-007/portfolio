import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STATUS } from "@/config/site";

/**
 * AvailabilityBar — the slim strip above the header.
 *
 * It is chrome, not an announcement: 32px tall, one line, no marquee, no
 * dismiss button, and it scrolls away with the page rather than sticking. The
 * whole bar is one link to the contact route, so the click target is the strip
 * and not a 40px word inside it.
 *
 * It renders NOTHING when there is no availability status in the content model
 * — an empty strip is worse than no strip, and this is the graceful state for
 * the day the status line is cleared.
 *
 * A11y: a single link whose accessible name is the full sentence plus its
 * action; the status dot is decorative and the word "Available" carries the
 * meaning, so nothing here is communicated by colour alone. Height is below the
 * 44px touch minimum by design — it is a supplementary shortcut to a route that
 * is also the header's primary button and a footer link, never the only path.
 */
export function AvailabilityBar() {
  if (!STATUS.text) return null;

  return (
    <div data-print="hide" className="border-b border-border bg-bg-subtle">
      <Link
        href={STATUS.href}
        prefetch={false}
        className="group mx-auto flex h-8 w-full max-w-[var(--width-container)] items-center justify-center gap-2 px-5 text-center sm:px-6 md:px-8"
      >
        <span
          aria-hidden
          className="relative inline-flex h-1.5 w-1.5 shrink-0 rounded-[var(--radius-pill)] bg-positive"
        />
        <span className="text-xs font-medium text-ink-secondary transition-colors group-hover:text-ink">
          <span className="sm:hidden">{STATUS.short}</span>
          <span className="hidden sm:inline">{STATUS.text}</span>
        </span>
        <ArrowRight
          size={12}
          strokeWidth={2}
          aria-hidden
          className="hidden shrink-0 text-ink-tertiary transition-transform duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5 sm:block"
        />
      </Link>
    </div>
  );
}
