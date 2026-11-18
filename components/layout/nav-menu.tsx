"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type MouseEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { cx } from "@/components/ui/cx";
import styles from "./nav.module.css";

/** How long the pointer may stray off a menu before it closes, in ms. */
const HOVER_GRACE = 140;
/** A click this soon after a hover-open keeps the menu open instead of toggling it shut. */
const HOVER_CLICK_WINDOW = 400;

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const subscribeFinePointer = (onChange: () => void) => {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** True on a mouse or trackpad, where menus also open on hover. */
function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
}

type MenusState = { openId: string | null; setOpenId: Dispatch<SetStateAction<string | null>> };
const MenusContext = createContext<MenusState | null>(null);

/**
 * NavMenus — the primary links list, and the one owner of which menu is open,
 * so opening one closes the other.
 *
 * Closes the open menu on Escape (returning focus to its trigger), on a click
 * or focus outside it, and on navigation.
 */
export function NavMenus({ className, children }: { className?: string; children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpenId(null);
  }

  useEffect(() => {
    if (!openId) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Element && target.closest(`[data-nav-menu="${openId}"]`) !== null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const trigger = document.querySelector<HTMLElement>(`[aria-controls="${openId}"]`);
      setOpenId(null);
      trigger?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!inside(event.target)) setOpenId(null);
    };
    const onFocus = (event: FocusEvent) => {
      if (!inside(event.target)) setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [openId]);

  return (
    <MenusContext.Provider value={{ openId, setOpenId }}>
      <ul className={className}>{children}</ul>
    </MenusContext.Provider>
  );
}

/**
 * NavMenu — one dropdown in the pill nav: a disclosure button and its panel
 * (the prototype's "Company" menu pattern).
 *
 * Opens on hover with a fine pointer, and on click, Enter or Space everywhere.
 * The panel is `visibility: visible` from the first frame of opening, so Tab
 * moves straight into it; it fades and springs in (instant under reduced
 * motion). Choosing a link closes it.
 *
 * Props: `id` (the panel's id), `label` (the trigger's text), `wide` (the
 * two-column rich panel), `sections` (routes under this menu: the trigger
 * shows the section is current), `children` (the panel's content).
 *
 * A11y: `aria-expanded` and `aria-controls` on a real button; Escape closes and
 * returns focus to it. Without JavaScript the panel opens on hover and focus.
 */
export function NavMenu({
  id,
  label,
  wide = false,
  sections = [],
  children,
}: {
  id: string;
  label: string;
  wide?: boolean;
  sections?: readonly string[];
  children: ReactNode;
}) {
  const menus = useContext(MenusContext);
  if (!menus) throw new Error("NavMenu must be rendered inside NavMenus");
  const { openId, setOpenId } = menus;
  const open = openId === id;
  const pathname = usePathname();
  const inSection = sections.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const finePointer = useFinePointer();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hoverOpenedAt = useRef(0);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const onTriggerClick = () => {
    const justHovered = Date.now() - hoverOpenedAt.current <= HOVER_CLICK_WINDOW;
    setOpenId(open && !justHovered ? null : id);
  };
  const onPointerEnter = () => {
    if (!finePointer) return;
    clearTimeout(closeTimer.current);
    if (!open) hoverOpenedAt.current = Date.now();
    setOpenId(id);
  };
  const onPointerLeave = () => {
    if (!finePointer) return;
    closeTimer.current = setTimeout(() => setOpenId((current) => (current === id ? null : current)), HOVER_GRACE);
  };
  const onPanelClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a")) setOpenId(null);
  };

  return (
    <li data-nav-menu={id} onMouseEnter={onPointerEnter} onMouseLeave={onPointerLeave}>
      <button
        type="button"
        className={styles.item}
        aria-expanded={open}
        aria-controls={id}
        data-section={inSection ? "" : undefined}
        onClick={onTriggerClick}
      >
        {label}
        <svg className={styles.chevron} viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      <div id={id} className={cx(styles.menu, wide && styles.wide, open && styles.open)} onClick={onPanelClick}>
        {children}
      </div>
    </li>
  );
}
