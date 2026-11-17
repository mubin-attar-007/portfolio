"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { Sparkles, Square, X } from "lucide-react";
import { Composer } from "@/components/assistant/composer";
import { ASSISTANT_COPY } from "@/components/assistant/copy";
import { EmptyState } from "@/components/assistant/empty-state";
import { Turn } from "@/components/assistant/turn";
import { isFailedTurn } from "@/components/assistant/turn-status";
import styles from "@/components/assistant/assistant.module.css";
import {
  historyForRequest,
  type AnswerMode,
  type AnswerNote,
  type ChatTurn,
} from "@/lib/ai/chat-contract";
import { readCitations } from "@/lib/ai/citation-links";
import { useInertBackground } from "@/lib/use-inert-background";

/**
 * AssistantPanel — a grounded, cited assistant over this site's content
 * (AI_ASSISTANT.md §5). A bottom sheet on phones and an inset drawer from `sm`,
 * the one place a large shadow is allowed. Streams from /api/chat over SSE and
 * renders the answer's small markdown subset as React elements (never as HTML).
 *
 * The conversation itself belongs to the launcher (`Assistant`), which stays
 * mounted in the header across page changes: closing the panel, or opening a
 * cited page, keeps the transcript. Closing during an answer stops it.
 *
 * A11y: modal dialog with a focus trap, Escape to close, focus restore (owned
 * by the launcher), a polite log for answers. Focus never drops to <body>:
 * sending moves it to the question field, and a control that disappears (a
 * starter, Stop, Clear, a retry) hands it back to the field first. The
 * transcript is a tab stop, so a long answer can be scrolled from the keyboard.
 */

/** A question handed to the panel by an `assistant:open` request. */
export type SeedQuestion = { id: number; question: string };

type Props = {
  turns: ChatTurn[];
  setTurns: Dispatch<SetStateAction<ChatTurn[]>>;
  onClose: () => void;
  /** A question to send as soon as the panel is open, or null. */
  seed: SeedQuestion | null;
  /** Called when the panel takes the seed, so it is sent once. */
  onSeedTaken: (id: number) => void;
};

/** HTTP status /api/chat answers with when the per-client window is exhausted. */
const RATE_LIMITED = 429;

/** Longer than the route's own 20 s answer timeout, so the server's fallback normally wins. */
const CLIENT_TIMEOUT_MS = 30_000;

const UNAVAILABLE =
  "The assistant is unavailable right now. You can still explore the case studies and résumé.";
const TIMED_OUT = "That answer took too long, so I stopped waiting. Try again in a moment.";

const MODES: readonly AnswerMode[] = ["live", "fallback", "refusal"];
const NOTES: readonly AnswerNote[] = [
  "injection-screened",
  "not-covered",
  "too-long",
  "live-unavailable",
  "daily-budget-reached",
  "client-allowance-reached",
];

/** Narrow an untrusted `mode` field to the union the UI renders. */
const asMode = (value: unknown): AnswerMode | undefined =>
  MODES.find((mode) => mode === value);

/** Narrow an untrusted `note` field to a note the route sends. */
const asNote = (value: unknown): AnswerNote | null => NOTES.find((note) => note === value) ?? null;

/**
 * Parse one SSE frame into its event name and JSON payload, or null if the
 * frame is unreadable.
 *
 * Returning null rather than throwing is the point: a single truncated or
 * malformed frame must not tear down the read loop and erase the answer the
 * visitor is already reading. The caller skips it and keeps streaming.
 */
function parseFrame(raw: string): { event: string; data: Record<string, unknown> } | null {
  const event = raw.match(/^event: (.*)$/m)?.[1];
  const payload = raw.match(/^data: (.*)$/m)?.[1];
  if (!event || !payload) return null;
  try {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed !== "object" || parsed === null) return null;
    return { event, data: parsed as Record<string, unknown> };
  } catch {
    return null;
  }
}

/**
 * Honest copy for a 429. Uses the server's Retry-After when it is a usable
 * number, and stays vague rather than inventing a wait when it is not.
 */
function rateLimitMessage(retryAfterSec: number): string {
  const wait =
    Number.isFinite(retryAfterSec) && retryAfterSec > 0
      ? `${retryAfterSec} second${retryAfterSec === 1 ? "" : "s"}`
      : "a few seconds";
  return `That's more questions than I can take at once. Try again in ${wait}.`;
}

function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.getClientRects().length > 0);
}

/** Unique across panel mounts: the turns outlive the panel that created them. */
function newId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

type ActiveRequest = {
  id: string;
  controller: AbortController;
  /** Why the visitor's side ended it, when it did. */
  reason: "stopped" | "timed-out" | null;
};

export function AssistantPanel({ turns, setTurns, onClose, seed, onSeedTaken }: Props) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  // Turns already in the transcript when the panel opened stay still; only
  // turns added while it is open rise into place.
  const [initialTurnIds] = useState(() => new Set(turns.map((turn) => turn.id)));
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stopRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const turnsRef = useRef(turns);
  const activeRef = useRef<ActiveRequest | null>(null);
  const mountedRef = useRef(true);
  const streamFrameRef = useRef<number | null>(null);
  const followTranscriptRef = useRef(true);
  const dialogTitleId = useId();
  const dialogDescId = useId();

  // The panel only exists while it is open, so the boundary is unconditional:
  // everything behind it is inert for exactly as long as this component lives.
  useInertBackground(true);

  const patchTurn = useCallback(
    (id: string, patch: Partial<ChatTurn>) => {
      setTurns((prev) => prev.map((turn) => (turn.id === id ? { ...turn, ...patch } : turn)));
    },
    [setTurns],
  );

  /** End the active request; the read loop records why. */
  const stop = useCallback((reason: "stopped" | "timed-out") => {
    const active = activeRef.current;
    if (!active) return;
    active.reason = reason;
    active.controller.abort();
  }, []);

  const focusField = useCallback(() => inputRef.current?.focus(), []);

  // Focus the question field on open; trap focus and handle Escape while open.
  // Every close path calls the launcher's `onClose`, which unmounts the panel
  // and restores focus to a visible launcher (WCAG 2.4.3) — which launcher is
  // visible depends on the breakpoint, so the panel can't pick it itself.
  useEffect(() => {
    const raf = requestAnimationFrame(focusField);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        // The controls change as a conversation starts and answers stream, so
        // the live tab order is recomputed instead of trapping against
        // detached controls.
        const items = tabbables(panelRef.current);
        if (items.length === 0) return;
        const first = items[0]!;
        const last = items[items.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, focusField]);

  // Closing the panel during an answer stops it: Gemini stops generating
  // instead of running on against a socket nobody reads. The partial answer
  // stays in the transcript, marked stopped.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop("stopped");
    };
  }, [stop]);

  // Follow new tokens only while the reader is at the bottom of the transcript.
  // Scrolling back to an earlier answer must not fight the incoming stream.
  useEffect(() => {
    turnsRef.current = turns;
    const el = logRef.current;
    if (el && turns.length > 0 && followTranscriptRef.current) el.scrollTop = el.scrollHeight;
  }, [turns]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || activeRef.current) return;

      const history = historyForRequest(turnsRef.current, q);
      const id = newId();
      setTurns((prev) => [
        ...prev,
        { id: newId(), role: "user", content: q },
        { id, role: "assistant", content: "", streaming: true },
      ]);
      // Only an accepted request consumes the draft. Enter during a response
      // leaves a visitor's next question intact, ready to submit afterwards.
      setDraft("");
      setBusy(true);
      followTranscriptRef.current = true;
      // A starter button unmounts with the empty state; keep focus in the
      // dialog, on the field the next question goes into (WCAG 2.4.3).
      focusField();

      const active: ActiveRequest = { id, controller: new AbortController(), reason: null };
      activeRef.current = active;
      const timer = setTimeout(() => stop("timed-out"), CLIENT_TIMEOUT_MS);
      let text = "";
      const flush = () => {
        if (streamFrameRef.current !== null) cancelAnimationFrame(streamFrameRef.current);
        streamFrameRef.current = null;
        patchTurn(id, { content: text });
      };
      const schedule = () => {
        if (streamFrameRef.current !== null) return;
        streamFrameRef.current = requestAnimationFrame(() => {
          streamFrameRef.current = null;
          patchTurn(id, { content: text });
        });
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: active.controller.signal,
        });
        // The rate limiter answers 429 + Retry-After, not a stream — surface the
        // real wait instead of letting the body reader fail into the generic
        // "unavailable" copy.
        if (res.status === RATE_LIMITED) {
          patchTurn(id, {
            content: rateLimitMessage(Number(res.headers.get("Retry-After"))),
            streaming: false,
            mode: "fallback",
            note: "rate-limited",
          });
          return;
        }

        const reader = res.ok ? res.body?.getReader() : null;
        if (!reader) throw new Error("no stream");
        const decoder = new TextDecoder();
        let buffer = "";
        let incomplete = false;
        let finished = false;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const raw of frames) {
            const frame = parseFrame(raw);
            if (!frame) continue; // unreadable frame — drop it, keep the answer
            const { event, data } = frame;
            if (event === "meta") {
              // A second meta replaces the first: a live call that failed
              // before its first token becomes a fallback with new text.
              text = "";
              patchTurn(id, { mode: asMode(data.mode), note: asNote(data.note), content: "" });
            } else if (event === "token" && typeof data.text === "string") {
              text += data.text;
              schedule();
            } else if (event === "sources") {
              patchTurn(id, { sources: readCitations(data.citations) });
            } else if (event === "done") {
              finished = true;
              incomplete = data.incomplete === true;
            }
          }
        }
        flush();
        // A stream that ends without `done` was cut off on the way here.
        const cut = incomplete || (!finished && text.length > 0);
        patchTurn(id, { streaming: false, incomplete: cut || undefined });
      } catch {
        flush();
        if (active.reason) {
          patchTurn(id, {
            content: text || (active.reason === "timed-out" ? TIMED_OUT : ""),
            streaming: false,
            note: active.reason,
            incomplete: text ? true : undefined,
          });
        } else if (text) {
          // The connection failed part-way: keep what arrived, marked cut short.
          patchTurn(id, { streaming: false, incomplete: true });
        } else {
          patchTurn(id, { content: UNAVAILABLE, streaming: false, mode: "fallback", note: "unavailable", sources: [] });
        }
      } finally {
        clearTimeout(timer);
        if (streamFrameRef.current !== null) cancelAnimationFrame(streamFrameRef.current);
        streamFrameRef.current = null;
        if (activeRef.current === active) activeRef.current = null;
        if (mountedRef.current) {
          // Stop is about to disappear; never let focus fall with it.
          if (document.activeElement === stopRef.current) focusField();
          setBusy(false);
        }
      }
    },
    [focusField, patchTurn, setTurns, stop],
  );

  const clear = useCallback(() => {
    stop("stopped");
    setTurns([]);
    focusField();
  }, [focusField, setTurns, stop]);

  /** Ask the latest question again after it failed. */
  const retry = useCallback(() => {
    const question = turnsRef.current.at(-2);
    if (question?.role === "user") void ask(question.content);
  }, [ask]);

  const submitDraft = useCallback(() => void ask(draft), [ask, draft]);

  // A question handed over by an `assistant:open` request is sent as if typed.
  // Deferred a frame, like the focus above, so a remount cancels it rather
  // than sending it twice. While an answer streams it waits in the field.
  useEffect(() => {
    if (!seed) return;
    const frame = requestAnimationFrame(() => {
      onSeedTaken(seed.id);
      if (activeRef.current) setDraft(seed.question);
      else void ask(seed.question);
    });
    return () => cancelAnimationFrame(frame);
  }, [seed, ask, onSeedTaken]);

  const empty = turns.length === 0;
  const canSend = !busy && draft.trim().length > 0;
  const lastTurn = turns.at(-1);
  const retryable = lastTurn !== undefined && isFailedTurn(lastTurn);
  const statusText = busy
    ? "Searching the site and generating a cited answer."
    : "Ready to search this site.";

  // Portal to <body>: the header pill has backdrop-filter, which would otherwise
  // make it the containing block for this fixed panel and mis-anchor it.
  return createPortal(
    <>
      <div data-modal-root className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <div
        data-modal-root
        id="assistant-panel-dialog"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescId}
        className={styles.dialog}
      >
        {/* A div, not <header>: under <body> a header is a second banner landmark. */}
        <div className={styles.header}>
          <span className={styles.mark} aria-hidden>
            <Sparkles size={17} strokeWidth={1.75} />
          </span>
          <div className={styles.titles}>
            <h2 id={dialogTitleId} className={styles.title}>
              {ASSISTANT_COPY.title}
            </h2>
            <p className={styles.subtitle}>{ASSISTANT_COPY.subtitle}</p>
            <p id={dialogDescId} className="sr-only">
              {ASSISTANT_COPY.description}
            </p>
          </div>
          <div className={styles.actions}>
            {empty ? null : (
              <button
                type="button"
                onClick={clear}
                aria-label={ASSISTANT_COPY.clearLabel}
                className={styles.ghost}
              >
                {ASSISTANT_COPY.clear}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={ASSISTANT_COPY.close}
              className={`${styles.ghost} ${styles.close}`}
            >
              <X size={18} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={logRef}
          className={styles.log}
          onScroll={(event) => {
            const el = event.currentTarget;
            followTranscriptRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
          }}
          role="log"
          aria-label={ASSISTANT_COPY.conversation}
          aria-live="polite"
          aria-relevant="additions text"
          aria-atomic="false"
          aria-busy={busy}
          tabIndex={0}
        >
          {empty ? (
            <EmptyState onAsk={(question) => void ask(question)} />
          ) : (
            <div className={styles.transcript}>
              {turns.map((turn) => (
                <Turn
                  key={turn.id}
                  turn={turn}
                  onNavigate={onClose}
                  animate={!initialTurnIds.has(turn.id)}
                  onRetry={retryable && turn === lastTurn ? retry : undefined}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {busy ? (
            <div className={styles.stopRow}>
              <button
                ref={stopRef}
                type="button"
                onClick={() => {
                  stop("stopped");
                  focusField();
                }}
                className={`${styles.ghost} ${styles.stop}`}
              >
                <Square size={9} strokeWidth={0} fill="currentColor" aria-hidden />
                {ASSISTANT_COPY.stop}
              </button>
            </div>
          ) : null}
          <Composer
            inputRef={inputRef}
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={submitDraft}
            busy={busy}
            canSend={canSend}
          />
          <p className={styles.privacy}>{ASSISTANT_COPY.privacy}</p>
        </div>
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {statusText}
        </span>
      </div>
    </>,
    document.body,
  );
}
