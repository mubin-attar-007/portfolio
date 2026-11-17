"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx } from "@/components/ui/cx";
import { ASSISTANT_OPEN_EVENT, openAssistant } from "@/components/assistant/open-assistant";
import { useInertBackground } from "@/lib/use-inert-background";
import styles from "./nav.module.css";

const PANEL_ID = "site-mobile-nav";
/** The open panel's id: the assistant checks for it and asks the menu to close first. */
const OPEN_ID = "mobile-menu";
/** The breakpoint above which the mobile menu does not exist (nav.module.css). */
const DESKTOP = "(min-width: 1001px)";
/** What Tab can reach inside the open sheet. */
const TABBABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const CloseContext = createContext<(() => void) | null>(null);

/**
 * MobileMenu — the menu button (two lines that turn into an X) and the grouped
 * panel under the pill, below 1000px (prototype `.menu-btn`, `.mnav`).
 *
 * A modal sheet (ADR-018, amended 17 Nov 2026), like the reference's overlay
 * menu: while it is open the button and the panel are one dialog, everything
 * else on the page is `inert` and the page does not scroll
 * (lib/use-inert-background.ts; the header is the modal root, so the pill stays
 * live), and a light scrim dims the page (nav.module.css). Focus moves to the
 * first link on open and Tab cycles within the dialog. It closes on Escape and
 * on a tap on the scrim (focus returns to the button), on choosing a link, on
 * navigation, when the assistant opens, and when the window widens past the
 * breakpoint.
 *
 * Props: `labels` (the button's names when closed and open, and the dialog's
 * name), `children` (the panel's groups; `MobileMenuAsk` inside closes the
 * menu before opening the assistant).
 * A11y: the button keeps `aria-expanded`/`aria-controls` and a name that says
 * what it will do; the open sheet is `role="dialog"` with `aria-modal` and a
 * name. The closed panel is `visibility: hidden`, so its links are out of the
 * tab order and the accessibility tree. Reduced motion: the global rule makes
 * the sheet appear and go at once.
 */
export function MobileMenu({
  labels,
  children,
}: {
  labels: { open: string; close: string; dialog: string };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  // The header is the modal root while the sheet is open, so the inert pass
  // leaves the pill and the panel live. A layout effect, so the mark is in
  // place before `useInertBackground`'s passive effect reads it.
  useLayoutEffect(() => {
    if (!open) return;
    const header = rootRef.current?.closest("header");
    header?.setAttribute("data-modal-root", "");
    return () => header?.removeAttribute("data-modal-root");
  }, [open]);
  useInertBackground(open);

  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const nav = root?.closest("nav");
    const close = () => setOpen(false);
    const dismiss = () => {
      setOpen(false);
      buttonRef.current?.focus();
    };
    // Focus moves into the sheet: its first link.
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(TABBABLE)?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !root) return;
      // The links change with the route, so the cycle is recomputed each time.
      const items = Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    // A tap on the scrim (the header's backdrop, outside the pill) closes it; a
    // control in the pill (the brand, the assistant, Hire me) acts for itself.
    // The scrim's own press is cancelled, so the browser's mousedown default does
    // not blur the button that focus has just returned to.
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && nav?.contains(event.target)) return;
      event.preventDefault();
      dismiss();
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
      cancelAnimationFrame(frame);
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
      <div
        ref={rootRef}
        className={styles.menuRoot}
        {...(open ? { role: "dialog", "aria-modal": true, "aria-label": labels.dialog } : {})}
      >
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
        <div
          ref={panelRef}
          id={open ? OPEN_ID : PANEL_ID}
          className={cx(styles.mobile, open && styles.open)}
          onClick={onPanelClick}
        >
          {children}
        </div>
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
