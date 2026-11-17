"use client";

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Sparkles } from "lucide-react";
import { ASSISTANT_COPY } from "@/components/assistant/copy";
import {
  ASSISTANT_OPEN_EVENT,
  LEGACY_OPEN_EVENT,
  requestedQuestion,
} from "@/components/assistant/open-assistant";
import styles from "@/components/assistant/trigger.module.css";
import type { ChatTurn } from "@/lib/ai/chat-contract";
import type { SeedQuestion } from "./assistant-panel";

/**
 * The panel's code-split chunk. It is never part of a page's first load: it is
 * fetched on the first sign of intent (see `Assistant`) or, at the latest, on
 * the first open. The module system caches it, so every later call resolves at
 * once.
 */
const loadPanel = () => import("./assistant-panel");
const AssistantPanel = lazy(() => loadPanel().then((m) => ({ default: m.AssistantPanel })));
const ASSISTANT_LAUNCHER_ATTR = "data-assistant-launcher";
const PANEL_ID = "assistant-panel-dialog";

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
 * Assistant — the "Ask this site" trigger and the owner of the conversation.
 * Mount it ONCE, in the persistent header: it renders the trigger and, only
 * once opened, renders the lazy panel (kept off the first load per the ≤60KB
 * assistant budget; its chunk is warmed when a pointer or focus first reaches
 * a launcher).
 *
 * It owns the conversation: the header stays mounted across page changes, so
 * closing the panel or opening a cited page keeps the transcript until the tab
 * is closed. Nothing is stored.
 *
 * Opening:
 * - the trigger; Ctrl+K, or ⌘K on Apple devices — a modifier shortcut, so
 *   typing a character never opens anything (WCAG 2.1.4). On a Mac, Ctrl+K in
 *   a text field keeps its system meaning (delete to the end of the line);
 * - the `assistant:open` window event from any other control (the floating
 *   launcher, an article's "Ask AI about this"), see `openAssistant()` in
 *   `components/assistant/open-assistant.ts`. A `detail.question` is sent as
 *   the next question once the panel is open;
 * - the older `open-assistant` event, which the mobile menu sends after it
 *   has closed itself.
 *
 * A11y: owns the close path, so focus returns to the launcher that opened the
 * panel when it is still on screen, and otherwise to the first visible one
 * (WCAG 2.4.3). A launcher is any element marked `data-assistant-launcher`.
 * The accessible name is the visible label; the shortcut is announced through
 * `aria-keyshortcuts`.
 *
 * @param className Optional classes appended to the trigger, for the nav's own
 *   spacing. The trigger's look and its breakpoints stay its own.
 */
export function Assistant({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [seed, setSeed] = useState<SeedQuestion | null>(null);
  const seedCount = useRef(0);
  // A question waiting out the mobile menu's close-then-reopen hand-off.
  const pendingQuestion = useRef<string | null>(null);
  // The launcher that opened the panel, if one did.
  const returnTo = useRef<HTMLElement | null>(null);
  const hint = useShortcutHint();

  const launch = useCallback((question: string | null = null) => {
    const request = question ?? pendingQuestion.current;
    pendingQuestion.current = null;
    if (document.getElementById("mobile-menu")) {
      pendingQuestion.current = request;
      window.dispatchEvent(new CustomEvent("close-menu-for-assistant"));
      return;
    }
    // Respect any other modal that owns focus rather than layering another.
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (dialog && dialog.id !== PANEL_ID) return;
    if (!dialog) {
      const active = document.activeElement;
      returnTo.current =
        active instanceof HTMLElement
          ? active.closest<HTMLElement>(`[${ASSISTANT_LAUNCHER_ATTR}]`)
          : null;
    }
    if (request) {
      seedCount.current += 1;
      setSeed({ id: seedCount.current, question: request });
    }
    setOpen(true);
  }, []);

  const takeSeed = useCallback((id: number) => {
    setSeed((current) => (current?.id === id ? null : current));
  }, []);

  // Restore to the launcher that opened the panel, or else to the one that is
  // actually visible at the current breakpoint. getClientRects() is robust for
  // both fixed and in-flow controls.
  //
  // Deferred by a frame, and that frame is load-bearing. While the panel is
  // open the page behind it is `inert`, and the launchers live in that inert
  // subtree. Focusing one in the same tick as `setOpen(false)` would silently
  // do nothing: the panel has not unmounted yet, so the page is still inert and
  // inert elements cannot take focus. The frame lets React commit the unmount
  // and run the boundary's cleanup first.
  const close = useCallback(() => {
    setOpen(false);
    setSeed(null);
    const restore = () => {
      const launchers = [
        returnTo.current,
        ...document.querySelectorAll<HTMLElement>(`[${ASSISTANT_LAUNCHER_ATTR}]`),
      ];
      for (const el of launchers) {
        if (el && el.getClientRects().length > 0) {
          el.focus();
          return document.activeElement === el;
        }
      }
      return true;
    };
    // One retry. Effect-flush timing is a scheduler detail, not a contract, so
    // if the first attempt lands while the page is still inert we take the
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
    const onOpenRequest = (event: Event) => launch(requestedQuestion(event));
    document.addEventListener("keydown", onKey);
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpenRequest);
    window.addEventListener(LEGACY_OPEN_EVENT, onOpenRequest);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpenRequest);
      window.removeEventListener(LEGACY_OPEN_EVENT, onOpenRequest);
    };
  }, [launch]);

  // Warm the panel's chunk the first time a pointer rests on, or focus
  // reaches, a launcher, so the first open renders without a network wait. It
  // stays off the first load, and a failed warm-up is left to the open itself
  // to retry and report.
  useEffect(() => {
    const listening = new AbortController();
    const warm = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.closest(`[${ASSISTANT_LAUNCHER_ATTR}]`)) return;
      listening.abort();
      loadPanel().catch(() => undefined);
    };
    document.addEventListener("pointerover", warm, { passive: true, signal: listening.signal });
    document.addEventListener("focusin", warm, { signal: listening.signal });
    return () => listening.abort();
  }, []);

  return (
    <>
      <button
        {...{ [ASSISTANT_LAUNCHER_ATTR]: "" }}
        type="button"
        onClick={() => launch()}
        aria-expanded={open}
        aria-controls={open ? PANEL_ID : undefined}
        aria-label={ASSISTANT_COPY.trigger}
        aria-keyshortcuts="Control+K Meta+K"
        title={hint ? `${ASSISTANT_COPY.trigger} (${hint})` : ASSISTANT_COPY.trigger}
        className={className ? `${styles.trigger} ${className}` : styles.trigger}
      >
        <Sparkles size={16} strokeWidth={1.75} className={styles.icon} aria-hidden />
        <span className={styles.label}>{ASSISTANT_COPY.trigger}</span>
        <kbd aria-hidden className={styles.kbd}>
          {hint}
        </kbd>
      </button>
      {open ? (
        <Suspense fallback={null}>
          <AssistantPanel
            turns={turns}
            setTurns={setTurns}
            onClose={close}
            seed={seed}
            onSeedTaken={takeSeed}
          />
        </Suspense>
      ) : null}
    </>
  );
}
