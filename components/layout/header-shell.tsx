"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * HeaderShell — the sticky `<header>` element and the ONE piece of state it
 * needs: whether the page has scrolled.
 *
 * At the top of the page the header is transparent and 72px tall, so the hero
 * reads as one uninterrupted plane. Past 8px of scroll it becomes a translucent,
 * blurred 64px bar with a hairline under it — the bar earns its background only
 * once there is content behind it to separate from.
 *
 * The client boundary is deliberately this thin: everything inside (wordmark,
 * nav, actions) is passed in as server-rendered `children`, so the interactive
 * surface area of the header is one boolean and a passive scroll listener.
 *
 * The border is present at BOTH states and only changes colour. A border that
 * appears on scroll moves every pixel of the page down by 1 — a layout shift
 * that costs CLS and reads as a twitch.
 *
 * `group` is load-bearing: the height transition belongs to the inner row, and
 * the state lives on the header, so the row reads it as `group-data-[scrolled]`.
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
    <header
      data-scrolled={scrolled ? "" : undefined}
      // The glass (translucent bg + blur) is unconditional: it used to arrive
      // with the scroll listener, which meant any context where JS had not run
      // — full-page capture tools, slow hydration, reader modes — drew the
      // chrome transparent over the page. JS now only adds what CSS cannot:
      // the hairline and the height compression once there is content behind.
      className="group/header sticky top-0 z-40 border-b border-transparent bg-bg/75 backdrop-blur-xl transition-[border-color] duration-base ease-[var(--ease-out)] data-[scrolled]:border-border"
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[var(--width-container)] items-center justify-between gap-6 px-5 transition-[height] duration-base ease-[var(--ease-out)] group-data-[scrolled]/header:h-16 sm:px-6 md:px-8">
        {children}
      </div>
    </header>
  );
}
