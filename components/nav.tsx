"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { profile } from "@/lib/content";

/**
 * Nav link targets.
 * - `href` is the canonical destination (route or root-anchored hash so it
 *   resolves from any page, e.g. from /work back to the home `#about`).
 * - `section` (when present) is the id we watch on the home page to light the
 *   active state via a scroll spy.
 */
type NavLink = { href: string; label: string; section?: string };

const LINKS: NavLink[] = [
  { href: "/work", label: "Work", section: "work" },
  { href: "/#playground", label: "Playground", section: "playground" },
  { href: "/#about", label: "About", section: "about" },
  { href: "/#contact", label: "Contact", section: "contact" },
];

/** Scroll-spy: returns the id of the section currently in view (home only). */
function useActiveSection(enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // Only run the scroll spy on the home page. On other routes we skip setup;
    // callers gate the active state on `isHome`, so a stale value is harmless.
    if (!enabled) return;
    const ids = LINKS.map((l) => l.section).filter(Boolean) as string[];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const onWork = pathname === "/work" || pathname.startsWith("/work/");

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const activeSection = useActiveSection(isHome);

  /** Is this link the current one? Route links match by path; anchors by spy. */
  const isActive = (l: NavLink) => {
    if (l.href === "/work") return onWork;
    if (isHome && l.section) return activeSection === l.section;
    return false;
  };

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Lock scroll, wire Escape, and move focus into the panel while open.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current; // stable node — capture for cleanup
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    // focus the first link in the slide-over
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      // restore focus to the toggle when closing
      toggle?.focus();
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Primary"
        className={`flex w-full max-w-5xl items-center justify-between rounded-full px-4 py-2 transition-all duration-300 ${
          scrolled
            ? "border border-line bg-[rgba(8,11,15,0.72)] shadow-[0_10px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            : "border border-transparent"
        }`}
      >
        <Link
          href="/"
          aria-label="Home"
          className="mono px-2 text-sm font-semibold tracking-tight"
        >
          mubin<span className="text-accent">.</span>
        </Link>

        {/* desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => {
            const active = isActive(l);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active ? "text-accent" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost !px-4 !py-1.5 max-md:hidden"
          >
            Résumé ↗
          </a>
          <Link href="/#contact" className="btn btn-accent !px-4 !py-1.5 max-sm:hidden">
            Let&apos;s talk
          </Link>

          {/* mobile hamburger */}
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line2 text-ink transition hover:border-accent hover:text-accent sm:hidden"
          >
            <Burger open={open} />
          </button>
        </div>
      </nav>

      {/* mobile slide-over */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 sm:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* backdrop */}
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-[rgba(4,6,9,0.72)] backdrop-blur-sm"
            />
            {/* panel */}
            <motion.div
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduce ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={
                reduce
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 320, damping: 34 }
              }
              className="absolute right-0 top-0 flex h-full w-[78%] max-w-xs flex-col gap-1 border-l border-line bg-elev/95 px-5 pb-8 pt-24 backdrop-blur-xl"
            >
              <span className="eyebrow mb-2 px-2">Navigate</span>
              {LINKS.map((l) => {
                const active = isActive(l);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-xl px-3 py-3 text-lg transition hover:bg-[rgba(53,224,192,0.08)] ${
                      active ? "text-accent" : "text-ink hover:text-accent"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mono mt-3 rounded-xl px-3 py-3 text-sm text-muted transition hover:bg-[rgba(53,224,192,0.08)] hover:text-accent"
              >
                Résumé ↗
              </a>
              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className="btn btn-accent mt-2 justify-center"
              >
                Let&apos;s talk
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* animated hamburger → X */
function Burger({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-4">
      <span
        className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-300 ${
          open ? "top-1.5 rotate-45" : "top-0.5"
        }`}
      />
      <span
        className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-current transition-all duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-300 ${
          open ? "top-1.5 -rotate-45" : "top-[10px]"
        }`}
      />
    </span>
  );
}
