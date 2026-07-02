"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#build", label: "How I build" },
  { href: "#about", label: "About" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`flex w-full max-w-5xl items-center justify-between rounded-full px-4 py-2 transition-all duration-300 ${
          scrolled
            ? "border border-line bg-[rgba(10,11,14,0.72)] backdrop-blur-xl"
            : "border border-transparent"
        }`}
      >
        <a href="#top" className="mono px-2 text-sm font-semibold tracking-tight">
          mubin<span className="text-accent">.</span>
        </a>
        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a href="#contact" className="btn btn-ghost !px-4 !py-1.5">
          Let&apos;s talk
        </a>
      </nav>
    </header>
  );
}
