"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { cx } from "@/components/ui/cx";
import { ASSISTANT_OPEN_EVENT, openAssistant } from "@/components/assistant/open-assistant";
import styles from "./nav.module.css";

const PANEL_ID = "site-mobile-nav";
/** The open panel's id: the assistant checks for it and asks the menu to close first. */
const OPEN_ID = "mobile-menu";
/** The breakpoint above which the mobile menu does not exist (nav.module.css). */
const DESKTOP = "(min-width: 1001px)";

const CloseContext = createContext<(() => void) | null>(null);

/**
 * MobileMenu — the menu button (two lines that turn into an X) and the grouped
 * panel under the pill, below 1000px (prototype `.menu-btn`, `.mnav`).
 *
 * A disclosure, not a modal: the panel opens below the bar, focus stays on the
 * button and Tab moves into the links. It closes on Escape (focus returns to
 * the button), a tap outside, choosing a link, navigation, the assistant
 * opening, and the window widening past the breakpoint.
 *
 * Props: `labels` (the button's names when closed and open), `children` (the
 * panel's groups; `MobileMenuAsk` inside closes the menu before opening the
 * assistant).
 * A11y: `aria-expanded`/`aria-controls`, an accessible name that says what the
 * button will do. The hidden panel is `visibility: hidden`, so its links are
 * out of the tab order and the accessibility tree until opened.
 */
export function MobileMenu({
  labels,
  children,
}: {
  labels: { open: string; close: string };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const nav = buttonRef.current?.closest("nav");
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !nav?.contains(event.target)) setOpen(false);
    };
    const desktop = window.matchMedia(DESKTOP);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener(ASSISTANT_OPEN_EVENT, close);
    desktop.addEventListener("change", close);
    // The assistant's hand-off: close, then ask it to open once the menu is gone.
    const handOff = () => {
      setOpen(false);
      requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("open-assistant")));
    };
    window.addEventListener("close-menu-for-assistant", handOff);
    return () => {
      window.removeEventListener("close-menu-for-assistant", handOff);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener(ASSISTANT_OPEN_EVENT, close);
      desktop.removeEventListener("change", close);
    };
  }, [open]);

  const onPanelClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a")) setOpen(false);
  };

  return (
    <CloseContext.Provider value={() => setOpen(false)}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls={open ? OPEN_ID : PANEL_ID}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <div id={open ? OPEN_ID : PANEL_ID} className={cx(styles.mobile, open && styles.open)} onClick={onPanelClick}>
        {children}
      </div>
    </CloseContext.Provider>
  );
}

/**
 * MobileMenuAsk — the "Ask AI" row of the mobile menu: closes the menu, returns
 * focus to the menu button, then opens the assistant (which takes focus into
 * its own dialog).
 */
export function MobileMenuAsk({ className, children }: { className?: string; children: ReactNode }) {
  const close = useContext(CloseContext);
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        close?.();
        event.currentTarget.closest("nav")?.querySelector<HTMLElement>(`[aria-controls="${OPEN_ID}"]`)?.focus();
        openAssistant();
      }}
    >
      {children}
    </button>
  );
}
