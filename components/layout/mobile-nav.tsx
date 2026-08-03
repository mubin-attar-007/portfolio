"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV } from "@/config/nav";

const DESKTOP_QUERY = "(min-width: 64rem)";

function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.getClientRects().length > 0);
}

/**
 * MobileNav — a compact floating menu for < lg. Dialog semantics, focus trap,
 * Escape/route-change/backdrop close, body scroll-lock, and focus restoration.
 * The overlay is portalled to <body> so it stays independent of sticky-header
 * stacking and can lock the document cleanly.
 */
export function MobileNav() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const mountedRef = useRef(false);
  const visibleRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const afterCloseRef = useRef<(() => void) | null>(null);

  const finishClose = useCallback(() => {
    visibleRef.current = false;
    mountedRef.current = false;
    setVisible(false);
    setMounted(false);
  }, []);

  const closeMenu = useCallback(() => {
    if (!mountedRef.current) return;
    if (
      !visibleRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finishClose();
      return;
    }
    visibleRef.current = false;
    setVisible(false);
  }, [finishClose]);

  const openMenu = () => {
    if (mountedRef.current) {
      closeMenu();
      return;
    }
    mountedRef.current = true;
    setMounted(true);
  };

  // Opening is intentionally one fast fade + 8px rise. The same effect is
  // removed by the global reduced-motion rule.
  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => {
      visibleRef.current = true;
      setVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  // Scroll lock, focus trap, Escape close, and focus return all share the
  // mounted lifetime so the closing transition cannot release the page early.
  useEffect(() => {
    if (!mounted) return;
    const toggle = toggleRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      const preferred =
        panelRef.current?.querySelector<HTMLElement>("[data-menu-autofocus]") ??
        panelRef.current?.querySelector<HTMLElement>("a,button");
      preferred?.focus();
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const items = tabbables(panelRef.current);
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [closeMenu, mounted]);

  // A persistent header can survive both navigation and a responsive resize;
  // neither should leave a portalled mobile overlay stranded on screen.
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      closeMenu();
    }
  }, [closeMenu, pathname]);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (media.matches) finishClose();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [finishClose]);

  useEffect(() => {
    if (mounted || !afterCloseRef.current) return;
    const afterClose = afterCloseRef.current;
    afterCloseRef.current = null;
    const frame = requestAnimationFrame(afterClose);
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-label={mounted ? "Close menu" : "Open menu"}
        aria-expanded={mounted}
        // Only while mounted: the menu is portalled on demand, so a permanent
        // aria-controls would point at an element that isn't in the document.
        aria-controls={mounted ? "mobile-menu" : undefined}
        onClick={openMenu}
        className="icon-btn inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-ink-secondary hover:text-ink"
      >
        <Menu size={20} strokeWidth={1.5} aria-hidden />
      </button>

      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <div
              role="presentation"
              onClick={closeMenu}
              className={`absolute inset-0 bg-ink/20 transition-opacity duration-fast ease-[var(--ease-out)] motion-reduce:transition-none ${
                visible ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-title"
              aria-describedby="mobile-menu-help"
              onTransitionEnd={(event) => {
                if (
                  event.target === event.currentTarget &&
                  event.propertyName === "opacity" &&
                  !visible
                ) {
                  finishClose();
                }
              }}
              className={`absolute inset-x-3 top-20 mx-auto flex max-h-[calc(100dvh-6rem)] max-w-sm flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-overlay)] transition-[opacity,transform] duration-fast ease-[var(--ease-out)] motion-reduce:transform-none motion-reduce:transition-none ${
                visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
              }`}
            >
              <div className="flex min-h-14 items-center justify-between border-b border-border px-4">
                <div>
                  <h2 id="mobile-menu-title" className="text-sm font-medium text-ink">
                    Menu
                  </h2>
                  <p className="font-mono text-xs text-ink-tertiary">Five essential pages</p>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] px-2 text-sm text-ink-secondary transition-colors hover:text-ink"
                >
                  Close
                  <X size={17} strokeWidth={1.5} aria-hidden />
                </button>
              </div>
              <p id="mobile-menu-help" className="sr-only">
                Press Escape to close. Use Tab and Enter to move through menu items.
              </p>
              <nav aria-label="Mobile primary" className="min-h-0 flex-1 overflow-y-auto p-2">
                <ul className="grid gap-1">
                  {NAV.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          prefetch={false}
                          onClick={closeMenu}
                          aria-current={active ? "page" : undefined}
                          data-menu-autofocus={active ? "" : undefined}
                          className={`flex min-h-11 items-center justify-between rounded-[var(--radius-md)] px-3 text-base transition-colors ${
                            active
                              ? "bg-bg-subtle font-medium text-ink"
                              : "text-ink-secondary hover:bg-bg-subtle hover:text-ink"
                          }`}
                        >
                          {item.label}
                          {active ? (
                            <span className="font-mono text-xs text-ink-tertiary">Current</span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="border-t border-border p-2">
                <button
                  type="button"
                  onClick={() => {
                    afterCloseRef.current = () =>
                      window.dispatchEvent(new CustomEvent("open-assistant"));
                    closeMenu();
                  }}
                  className="flex min-h-11 w-full items-center justify-between rounded-[var(--radius-md)] px-3 text-left text-sm text-ink transition-colors hover:bg-bg-subtle"
                >
                  <span>Ask this site</span>
                  <span className="font-mono text-xs text-ink-tertiary">Grounded · cited</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
