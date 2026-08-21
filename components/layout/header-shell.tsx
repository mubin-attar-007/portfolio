"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * HeaderShell — the floating navigation bar, rebuilt to clerk.com's measured
 * anatomy: a slim (~44px) contained pill that FLOATS below the top edge rather
 * than a full-width bar welded to it. Measured on the reference: a 42px sticky
 * row offset from the top, transparent at the page level with the chrome on the
 * inner container.
 *
 * The pill's glass (translucent fill + blur + hairline) is unconditional CSS —
 * it must survive contexts where JS never runs (stitched captures, reader
 * modes, slow hydration). The scroll listener adds only what CSS cannot: a
 * raised shadow once there is content behind the bar.
 *
 * A11y: the shell is layout only; the landmark inside stays a plain <header>
 * child tree. The floating inset never overlaps content — the page's first
 * section clears it via its own top padding.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3 pt-2 sm:px-4 sm:pt-3">
      <div
        data-scrolled={scrolled ? "" : undefined}
        className="mx-auto flex h-11 w-full max-w-[var(--width-container)] items-center justify-between gap-4 rounded-[10px] border border-border bg-bg/80 px-3 backdrop-blur-xl transition-shadow duration-base ease-[var(--ease-out)] data-[scrolled]:shadow-[var(--shadow-sm)] sm:px-4"
      >
        {children}
      </div>
    </header>
  );
}
