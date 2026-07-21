"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";
import { BoundaryMark } from "@/components/ui/boundary-mark";

/**
 * LogoLink — the wordmark: the BoundaryMark logomark + the name. Navigates home;
 * when already on the home page it scrolls to the top instead of a no-op (so a
 * click always *does* something). A hover cue signals it's interactive.
 * A11y: labelled link; the mark is decorative — the name is the accessible text;
 * the scroll jumps instead of animating under prefers-reduced-motion.
 */
export function LogoLink() {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      onClick={(e) => {
        if (pathname !== "/") return;
        e.preventDefault();
        // Read at click time rather than on mount, so a mid-session change to
        // the OS setting is honoured. `scroll-behavior: smooth` on <html> is
        // already motion-gated in globals.css; this is the JS equivalent.
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      className="inline-flex items-center gap-2 transition-opacity duration-fast ease-[var(--ease-out)] hover:opacity-65"
      aria-label={`${SITE.name} — home`}
    >
      <BoundaryMark size={17} className="text-ink" />
      <span className="font-mono text-sm font-medium tracking-tight text-ink">
        {SITE.name.toLowerCase().replace(/\s+/g, " ")}
      </span>
    </Link>
  );
}
