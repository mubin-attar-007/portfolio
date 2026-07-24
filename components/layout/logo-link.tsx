import Link from "next/link";
import { SITE } from "@/config/site";
import { BoundaryMark } from "@/components/ui/boundary-mark";

/**
 * LogoLink — the wordmark: the BoundaryMark logomark + the name. It remains a
 * Server Component because ordinary Link navigation already returns to the top
 * of the home route; no dedicated hydration boundary is needed for the logo.
 * A11y: labelled link; the mark is decorative and the name is accessible text.
 */
export function LogoLink() {
  return (
    <Link
      href="/"
      prefetch={false}
      className="inline-flex items-center gap-2 transition-opacity duration-fast ease-[var(--ease-out)] hover:opacity-65"
      aria-label={`${SITE.name} — home`}
    >
      <BoundaryMark size={17} className="text-ink" />
      <span className="font-mono text-sm font-medium tracking-tight text-ink">
        {SITE.name}
      </span>
    </Link>
  );
}
