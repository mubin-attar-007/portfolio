"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV } from "@/config/nav";

/**
 * MobileNav — hamburger + slide-in drawer for < md. Dialog semantics, focus
 * trap, Escape/route-change/backdrop close, body scroll-lock, focus restore.
 * The overlay is portalled to <body>: the header carries `backdrop-filter`,
 * which would otherwise become the containing block for the drawer's
 * `position: fixed` and trap it inside the header pill instead of the viewport.
 * Props: none (reads NAV). A11y: `aria-expanded` on the toggle; drawer is a
 * labelled modal dialog; fully keyboard operable.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // scroll-lock + Escape + focus trap while open; restore focus on close
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        );
        if (items.length === 0) return;
        const first = items[0]!;
        const last = items[items.length - 1]!;
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        // Only while open: the drawer is portalled on demand, so a permanent
        // aria-controls would point at an element that isn't in the document.
        aria-controls={open ? "mobile-menu" : undefined}
        onClick={() => setOpen((v) => !v)}
        className="icon-btn inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-ink-secondary hover:text-ink"
      >
        {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/20"
            />
            <div
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute inset-y-0 right-0 flex w-[78%] max-w-xs flex-col gap-1 border-l border-border bg-surface px-5 pb-8 pt-20 shadow-[var(--shadow-overlay)]"
            >
              {NAV.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-[var(--radius-md)] px-3 py-3 text-lg transition-colors ${
                      active ? "text-accent" : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("open-assistant"));
                }}
                className="mt-3 rounded-[var(--radius-md)] border border-border-strong px-3 py-3 text-left text-lg text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Ask Friday
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
