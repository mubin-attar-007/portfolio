import { ArrowRight } from "lucide-react";
import { STATUS } from "@/config/site";

/**
 * StatusBar — a slim dark bar at the very top (Clerk-style announcement rail),
 * repurposed as an evergreen availability status. Uses the `tone-invert` dark
 * scope so it's dark in both themes. A11y: a labelled region; the CTA is a link.
 */
export function StatusBar() {
  return (
    <div className="tone-invert">
      <div className="mx-auto flex w-full max-w-[var(--width-container)] items-center justify-center gap-x-3 gap-y-1 px-6 py-2 text-center text-xs md:px-8">
        <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-positive" aria-hidden />
        <span className="text-ink-secondary">{STATUS.text}</span>
        <a
          href={STATUS.href}
          className="group inline-flex items-center gap-1 font-medium text-ink hover:text-accent"
        >
          {STATUS.cta}
          <ArrowRight
            size={12}
            strokeWidth={2}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </div>
  );
}
