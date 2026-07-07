"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";

/**
 * LogoLink — the wordmark. Navigates home; when already on the home page it
 * smooth-scrolls to the top instead of a no-op (so a click always *does*
 * something). A hover cue signals it's interactive. A11y: labelled link.
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
      className="font-mono text-sm font-medium tracking-tight text-ink transition-opacity duration-200 ease-[var(--ease-out)] hover:opacity-65"
      aria-label={`${SITE.name} — home`}
    >
      {SITE.name.toLowerCase().replace(/\s+/g, " ")}
    </Link>
  );
}
