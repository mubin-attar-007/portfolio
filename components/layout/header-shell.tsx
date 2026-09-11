"use client";

import { useEffect, useState, type ReactNode } from "react";

/** A full-width navigation seam. Elevation appears only while scrolling. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-md">
      <div
        data-scrolled={scrolled ? "" : undefined}
        className="mx-auto flex h-16 w-full max-w-[var(--width-container)] items-center justify-between gap-4 px-5 transition-shadow duration-base ease-[var(--ease-out)] data-[scrolled]:shadow-[var(--shadow-sm)] sm:px-6 md:px-8"
      >
        {children}
      </div>
    </header>
  );
}
