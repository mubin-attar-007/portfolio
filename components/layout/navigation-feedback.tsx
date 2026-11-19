"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./navigation-feedback.module.css";

/** A click that lands within this long shows no bar at all (no flash). */
const SHOW_AFTER_MS = 120;
/** The bar gives up if a navigation never lands (a cancelled or failed click). */
const GIVE_UP_MS = 12_000;
/** How long the finished bar stays full before it fades. */
const DONE_MS = 280;

const FILE = /\.[a-z0-9]+$/i;

/**
 * The route a link leads to inside this app, or null: another site, a new tab,
 * a download, a file (a feed, a PDF), an API route, or a place on this page.
 */
export function routeOf(target: EventTarget | null, here: Location): string | null {
  const link = target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return null;
  const url = new URL(link.href, here.href);
  if (url.origin !== here.origin || FILE.test(url.pathname) || url.pathname.startsWith("/api/")) return null;
  if (url.pathname === here.pathname) return null;
  return url.pathname + url.search;
}

/**
 * NavigationFeedback — makes moving between pages feel immediate, site-wide,
 * from one listener on the document (no link changes):
 *
 * - **Intent prefetch.** When a pointer rests on, a finger touches, or the
 *   keyboard focuses a link to another page, that page is prefetched, so most
 *   clicks land at once. Never by viewport (spec/ENGINEERING.md §5): a page
 *   load still downloads no other route.
 * - **Pending bar.** If a click has not landed after 120ms, a thin accent bar
 *   runs along the top until the new page arrives, so a slow network never
 *   looks like a dead click.
 *
 * A11y: the bar is an empty element with no role or text, so assistive
 * technology has nothing to read (no `aria-hidden`: a modal's inert boundary
 * expects every body child to be released when it closes); the new page's
 * title and focus handling are the router's. Reduced motion: the bar appears and leaves
 * without travelling.
 */
export function NavigationFeedback() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");
  const prefetched = useRef(new Set<string>());
  const timers = useRef<number[]>([]);
  /** True while the bar is showing for a click that has not landed. */
  const showing = useRef(false);

  const clear = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };

  // The page arrived: drop a bar that has not shown yet, finish one that has.
  useEffect(() => {
    clear();
    if (!showing.current) return;
    showing.current = false;
    timers.current.push(
      window.setTimeout(() => setState("done"), 0),
      window.setTimeout(() => setState("idle"), DONE_MS),
    );
  }, [pathname]);

  useEffect(() => {
    const intent = (event: Event) => {
      const href = routeOf(event.target, window.location);
      if (!href || prefetched.current.has(href)) return;
      prefetched.current.add(href);
      router.prefetch(href);
    };
    const click = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!routeOf(event.target, window.location)) return;
      clear();
      timers.current.push(
        window.setTimeout(() => {
          showing.current = true;
          setState("pending");
        }, SHOW_AFTER_MS),
        window.setTimeout(() => {
          showing.current = false;
          setState("idle");
        }, GIVE_UP_MS),
      );
    };
    const options = { passive: true, capture: true } as const;
    document.addEventListener("pointerover", intent, options);
    document.addEventListener("touchstart", intent, options);
    document.addEventListener("focusin", intent, options);
    document.addEventListener("click", click, options);
    return () => {
      document.removeEventListener("pointerover", intent, options);
      document.removeEventListener("touchstart", intent, options);
      document.removeEventListener("focusin", intent, options);
      document.removeEventListener("click", click, options);
      clear();
    };
  }, [router]);

  return <div className={styles.bar} data-state={state} />;
}
