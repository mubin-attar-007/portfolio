import Link from "next/link";
import { SITE } from "@/config/site";
import { BoundaryMark } from "@/components/ui/boundary-mark";

/**
 * LogoLink — the wordmark: the BoundaryMark logomark plus the name.
 *
 * The name is set in the SANS at 15px/600 with tight tracking, not in the mono
 * it used to use. A monospaced wordmark reads as a terminal prompt; this site's
 * argument is that the engineering is *product* engineering, and the wordmark is
 * the first thing that has to say so. Mono is still the site's voice for values,
 * labels and code — everywhere it means "this is a measurement".
 *
 * Remains a Server Component: ordinary Link navigation already returns to the
 * top of the home route, so the logo needs no hydration boundary of its own.
 *
 * A11y: one labelled link; the mark is decorative (aria-hidden by construction)
 * and the visible name carries the accessible name.
 */
export function LogoLink() {
  return (
    <Link
      href="/"
      prefetch={false}
      className="group/logo inline-flex shrink-0 items-center gap-2"
      aria-label={`${SITE.name} — home`}
    >
      <BoundaryMark
        size={18}
        className="text-accent transition-transform duration-base ease-[var(--ease-out)] group-hover/logo:scale-[1.06]"
      />
      <span className="text-[0.9375rem] font-semibold tracking-[-0.017em] text-ink">
        {SITE.name}
      </span>
    </Link>
  );
}
