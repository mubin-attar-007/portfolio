"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";
import { BoundaryMark } from "@/components/ui/boundary-mark";

/**
 * LogoLink — the wordmark: the BoundaryMark logomark + the name. Navigates home;
 * when already on the home page it smooth-scrolls to the top instead of a no-op
 * (so a click always *does* something). A hover cue signals it's interactive.
 * A11y: labelled link; the mark is decorative — the name is the accessible text.
 */
export function LogoLink() {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      onClick={(e) => {
        if (pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className="inline-flex items-center gap-2 transition-opacity duration-200 ease-[var(--ease-out)] hover:opacity-65"
      aria-label={`${SITE.name} — home`}
    >
      <BoundaryMark size={17} className="text-ink" />
      <span className="font-mono text-sm font-medium tracking-tight text-ink">
        {SITE.name.toLowerCase().replace(/\s+/g, " ")}
      </span>
    </Link>
  );
}
