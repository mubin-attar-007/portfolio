"use client";

import { Suspense, lazy, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Sparkles } from "lucide-react";
import type { ChatTurn } from "@/lib/ai/chat-contract";

const AssistantPanel = lazy(() =>
  import("./assistant-panel").then((m) => ({ default: m.AssistantPanel })),
);
const ASSISTANT_LAUNCHER_ATTR = "data-assistant-launcher";

/** True on macOS, iOS and iPadOS, where the shortcut is ⌘K rather than Ctrl+K. */
function isApplePlatform(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform ?? nav.platform ?? "");
}

const noSubscription = () => () => {};

/**
 * The shortcut hint for this device, or null while server-rendering and
 * hydrating — the platform is unknown until then, and guessing would flash the
 * wrong hint.
 */
function useShortcutHint(): string | null {
  return useSyncExternalStore(
    noSubscription,
    () => (isApplePlatform() ? "⌘K" : "Ctrl K"),
    () => null,
  );
}

/** True when focus is in a field that takes typing. */
function isEditable(el: Element | null): boolean {
  return (
    el instanceof HTMLElement &&
    (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
  );
}

/**
 * Assistant — the "Ask about my work" launcher. Renders a quiet trigger and,
 * only once opened, lazy-loads the panel (keeps it off the initial bundle per
 * the ≤60KB assistant budget).
 *
 * It owns the conversation: the launcher lives in the header, which stays
 * mounted across page changes, so closing the panel or opening a cited page
 * keeps the transcript until the tab is closed. Nothing is stored.
 *
 * Shortcut: Ctrl+K, or ⌘K on Apple devices — a modifier shortcut, so typing a
 * character never opens anything (WCAG 2.1.4). On a Mac, Ctrl+K in a text
 * field keeps its system meaning (delete to the end of the line).
 *
 * A11y: owns the close path so focus always returns to a launcher the visitor
 * can see (WCAG 2.4.3). The accessible name is the visible label; the shortcut
 * is announced through `aria-keyshortcuts`.
 */
export function Assistant() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const hint = useShortcutHint();

  const launch = useCallback(() => {
    if (document.getElementById("mobile-menu")) {
      window.dispatchEvent(new CustomEvent("close-menu-for-assistant"));
      return;
    }
    // Respect any other modal that owns focus rather than layering another.
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (dialog && dialog.id !== "assistant-panel-dialog") return;
    setOpen(true);
  }, []);

  // Restore to the launcher that is actually visible at the current breakpoint.
  // getClientRects() is robust for both fixed and in-flow controls.
  //
  // Deferred by a frame, and that frame is load-bearing. While the panel is
  // open the page behind it is `inert`, and the launcher lives in the header —
  // inside that inert subtree. Focusing it in the same tick as `setOpen(false)`
  // would silently do nothing: the panel has not unmounted yet, so the header
  // is still inert and inert elements cannot take focus. The frame lets React
  // commit the unmount and run the boundary's cleanup first.
  const close = useCallback(() => {
    setOpen(false);
    const restore = () => {
      const launchers = document.querySelectorAll<HTMLElement>(
        `[${ASSISTANT_LAUNCHER_ATTR}]`,
      );
      for (const el of launchers) {
        if (el.getClientRects().length > 0) {
          el.focus();
          return document.activeElement === el;
        }
      }
      return true;
    };
    // One retry. Effect-flush timing is a scheduler detail, not a contract, so
    // if the first attempt lands while the header is still inert we take the
    // next frame rather than leaving focus stranded on <body> (WCAG 2.4.3).
    requestAnimationFrame(() => {
      if (!restore()) requestAnimationFrame(restore);
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== "k") return;
      if (e.ctrlKey && !e.metaKey && isApplePlatform() && isEditable(document.activeElement)) return;
      e.preventDefault();
      launch();
    };
    // Mobile nav (and any other trigger) can open the same panel via this event.
    const onOpen = launch;
    document.addEventListener("keydown", onKey);
    window.addEventListener("open-assistant", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-assistant", onOpen);
    };
  }, [launch]);

  return (
    <>
      <button
        {...{ [ASSISTANT_LAUNCHER_ATTR]: "" }}
        type="button"
        onClick={launch}
        aria-expanded={open}
        aria-controls={open ? "assistant-panel-dialog" : undefined}
        aria-label="Ask this site"
        aria-keyshortcuts="Control+K Meta+K"
        title={hint ? `Ask this site (${hint})` : "Ask this site"}
        className="icon-btn inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-ink-secondary hover:text-ink xl:h-8 xl:w-auto xl:gap-2 xl:rounded-[var(--radius-sm)] xl:border xl:border-border xl:bg-surface xl:px-2.5 xl:text-[0.8125rem] xl:text-ink-secondary xl:shadow-[var(--shadow-sm)] xl:hover:border-border-strong xl:hover:text-ink"
      >
        <Sparkles size={18} strokeWidth={1.5} className="xl:hidden" aria-hidden />
        <span className="hidden xl:inline">Ask this site</span>
        {/* Fixed width: "⌘K" and "Ctrl K" take the same room, so the hint
            appearing after hydration shifts nothing. */}
        <kbd
          aria-hidden
          className="hidden min-w-[3.25rem] rounded-[var(--radius-xs)] border border-border bg-bg-subtle px-1.5 text-center font-mono text-[0.7rem] text-ink-tertiary xl:inline-block"
        >
          {hint}
        </kbd>
      </button>
      {open ? (
        <Suspense fallback={null}>
          <AssistantPanel turns={turns} setTurns={setTurns} onClose={close} />
        </Suspense>
      ) : null}
    </>
  );
}
