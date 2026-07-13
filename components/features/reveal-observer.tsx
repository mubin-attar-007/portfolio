"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * RevealObserver — makes the `.reveal` scroll-fade universal (Safari/Firefox as
 * well as Chromium), replacing the `animation-timeline: view()` version that only
 * fired in Chromium. Elements tagged `.reveal` start hidden ONLY when JS is on
 * (the `html.js` gate in globals.css), so no-JS and crawlers see full content.
 *
 * Fires once per element (unobserve after reveal). Re-scans on route change via
 * `usePathname` — the layout persists across client navigations, so the effect
 * re-runs and observes the new page's `.reveal` nodes. Honors reduced-motion by
 * revealing everything immediately (the opacity:0 is itself motion-gated in CSS,
 * so this is belt-and-suspenders). Renders nothing.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.reveal-in)"));
    if (els.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        }
      },
      // start the reveal a touch before the element is fully in view
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
