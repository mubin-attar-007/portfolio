"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { ArrowDown, Sparkles, Square, X } from "lucide-react";
import { Composer } from "@/components/assistant/composer";
import { ASSISTANT_COPY } from "@/components/assistant/copy";
import { EmptyState } from "@/components/assistant/empty-state";
import { CLIENT_TIMEOUT_MS, slowAnswerCue } from "@/components/assistant/pending";
import { Turn } from "@/components/assistant/turn";
import { isFailedTurn } from "@/components/assistant/turn-status";
import { useKeyboardInset } from "@/components/assistant/viewport";
import styles from "@/components/assistant/assistant.module.css";
import { readActions } from "@/lib/ai/actions";
import {
  askedQuestions,
  historyForRequest,
  type AnswerMode,
  type AnswerNote,
  type ChatRequest,
  type ChatTurn,
} from "@/lib/ai/chat-contract";
import { readCitations } from "@/lib/ai/citation-links";
import { readFollowUps } from "@/lib/ai/follow-ups";
import { STARTERS, startersFor } from "@/lib/ai/starters";
import { useInertBackground } from "@/lib/use-inert-background";

/**
 * AssistantPanel — a grounded, cited assistant over this site's content
 * (AI_ASSISTANT.md §5). A bottom sheet on phones, kept above the on-screen
 * keyboard, and an inset drawer from `sm`, the one place a large shadow is
 * allowed. Streams from /api/chat over SSE and renders the answer's small
 * markdown subset as React elements (never as HTML).
 *
 * The conversation itself belongs to the launcher (`Assistant`), which stays
 * mounted in the header across page changes: closing the panel, or opening a
 * cited page, keeps the transcript. Closing during an answer stops it.
 *
 * Page-aware: on a case study or an article the starters are that page's, and
 * every question carries the page, which retrieval uses as a mild prior.
 *
 * A11y: modal dialog with a focus trap, Escape to close, focus restore (owned
 * by the launcher), a polite log for answers and a polite status line for
 * what the panel does (searching, ready, copied). Focus never drops to
 * <body>: sending moves it to the question field, and a control that
 * disappears (a starter, a follow-up, Stop, Clear, a retry, Jump to latest)
 * hands it back to the field first. The transcript is a tab stop, so a long
 * answer can be scrolled from the keyboard.
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
  /** The page the panel is open on (the current pathname); the route ignores anything else. */
  page: string | null;
};

/** HTTP status /api/chat answers with when the per-client window is exhausted. */
const RATE_LIMITED = 429;

/** How long the send button shows its check after an answer lands. */
const ANSWERED_MS = 1_400;

/** How long a one-off announcement ("Answer copied") holds the status line. */
const ANNOUNCE_MS = 2_500;

/** Within this distance of the bottom, the transcript follows new text. */
const FOLLOW_SLACK_PX = 48;

const UNAVAILABLE =
  "The assistant is unavailable right now. You can still explore the case studies and résumé.";
const TIMED_OUT = "That answer took too long, so I stopped waiting. Try again in a moment.";

const MODES: readonly AnswerMode[] = ["live", "fallback", "refusal"];
const NOTES: readonly AnswerNote[] = [
  "injection-screened",
  "not-covered",
  "small-talk",
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

/** True when the visitor prefers reduced motion: the transcript jumps instead of gliding. */
const prefersReducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type ActiveRequest = {
  id: string;
  controller: AbortController;
  /** Why the visitor's side ended it, when it did. */
  reason: "stopped" | "timed-out" | null;
};

export function AssistantPanel({ turns, setTurns, onClose, seed, onSeedTaken, page }: Props) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [answered, setAnswered] = useState(false);
  // The pending answer has sent no text for SLOW_AFTER_MS: say so, once.
  const [slow, setSlow] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  // The visitor scrolled up from the latest text: offer the way back down.
  const [behind, setBehind] = useState(false);
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
  // The transcript's last scroll position, so a scroll can tell up from down.
  const lastScrollTopRef = useRef(0);
  const answeredTimer = useRef<number | null>(null);
  const announceTimer = useRef<number | null>(null);
  const dialogTitleId = useId();
  const dialogDescId = useId();

  // The panel only exists while it is open, so the boundary is unconditional:
  // everything behind it is inert for exactly as long as this component lives.
  useInertBackground(true);
  useKeyboardInset(panelRef);

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

  /** Say something once through the status line, then return it to the panel's state. */
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    if (announceTimer.current !== null) window.clearTimeout(announceTimer.current);
    announceTimer.current = window.setTimeout(() => setAnnouncement(null), ANNOUNCE_MS);
  }, []);

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
      if (answeredTimer.current !== null) window.clearTimeout(answeredTimer.current);
      if (announceTimer.current !== null) window.clearTimeout(announceTimer.current);
    };
  }, [stop]);

  // Follow new text only while the reader is at the bottom of the transcript.
  // Scrolling back to an earlier answer must not fight the incoming stream:
  // "Jump to latest" appears instead.
  useEffect(() => {
    turnsRef.current = turns;
    const el = logRef.current;
    if (!el || turns.length === 0) return;
    if (followTranscriptRef.current) el.scrollTop = el.scrollHeight;
    else setBehind(true);
  }, [turns]);

  /** The send button's moment of confirmation once an answer has landed. */
  const markAnswered = useCallback(() => {
    setAnswered(true);
    if (answeredTimer.current !== null) window.clearTimeout(answeredTimer.current);
    answeredTimer.current = window.setTimeout(() => setAnswered(false), ANSWERED_MS);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || activeRef.current) return;

      const history = historyForRequest(turnsRef.current, q);
      const asked = [...askedQuestions(turnsRef.current), q];
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
      setSlow(false);
      setAnswered(false);
      setBehind(false);
      followTranscriptRef.current = true;
      // A starter or follow-up button unmounts as the conversation moves on;
      // keep focus in the dialog, on the field the next question goes into
      // (WCAG 2.4.3).
      focusField();

      const active: ActiveRequest = { id, controller: new AbortController(), reason: null };
      activeRef.current = active;
      const timer = setTimeout(() => stop("timed-out"), CLIENT_TIMEOUT_MS);
      const cue = slowAnswerCue(() => {
        if (mountedRef.current && activeRef.current === active) setSlow(true);
      });
      let text = "";
      let landed = false;
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
        const body: ChatRequest = { messages: history, ...(page ? { page } : {}) };
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
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
              cue.arrived();
              schedule();
            } else if (event === "sources") {
              patchTurn(id, { sources: readCitations(data.citations) });
            } else if (event === "actions") {
              patchTurn(id, { actions: readActions(data.actions) });
            } else if (event === "followups") {
              patchTurn(id, { followups: readFollowUps(data.questions, asked) });
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
        landed = finished && !cut;
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
        cue.cancel();
        if (streamFrameRef.current !== null) cancelAnimationFrame(streamFrameRef.current);
        streamFrameRef.current = null;
        if (activeRef.current === active) activeRef.current = null;
        if (mountedRef.current) {
          // Stop is about to disappear; never let focus fall with it.
          if (document.activeElement === stopRef.current) focusField();
          setBusy(false);
          setSlow(false);
          if (landed) markAnswered();
        }
      }
    },
    [focusField, markAnswered, page, patchTurn, setTurns, stop],
  );

  const clear = useCallback(() => {
    stop("stopped");
    setTurns([]);
    setBehind(false);
    focusField();
  }, [focusField, setTurns, stop]);

  /** Ask the latest question again after it failed. */
  const retry = useCallback(() => {
    const question = turnsRef.current.at(-2);
    if (question?.role === "user") void ask(question.content);
  }, [ask]);

  const askQuestion = useCallback((question: string) => void ask(question), [ask]);

  const submitDraft = useCallback(() => void ask(draft), [ask, draft]);

  /** Back to the newest text, following it again; the button goes, so focus goes to the field. */
  const jumpToLatest = useCallback(() => {
    const el = logRef.current;
    followTranscriptRef.current = true;
    setBehind(false);
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    focusField();
  }, [focusField]);

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

  const starters = useMemo(() => startersFor(page), [page]);
  const empty = turns.length === 0;
  const canSend = !busy && draft.trim().length > 0;
  const lastTurn = turns.at(-1);
  const retryable = lastTurn !== undefined && isFailedTurn(lastTurn);
  // A polite status line: one change when an answer starts, at most one when it is slow
  // (kept until it ends, so it is read once), and one when it ends.
  const statusText =
    announcement ??
    (busy ? (slow ? ASSISTANT_COPY.statusSlow : ASSISTANT_COPY.statusSearching) : ASSISTANT_COPY.statusReady);

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
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < FOLLOW_SLACK_PX;
            const up = el.scrollTop < lastScrollTopRef.current;
            lastScrollTopRef.current = el.scrollTop;
            // Only the reader scrolling back up pauses the follow; reaching the
            // end resumes it. A glide down (Jump to latest, or the follow
            // itself) passes through "not at the end" on every frame, and must
            // not bring the button back on its way.
            if (atBottom) {
              followTranscriptRef.current = true;
              setBehind(false);
            } else if (up) {
              followTranscriptRef.current = false;
              setBehind(true);
            }
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
            <EmptyState starters={starters} onPage={starters !== STARTERS} onAsk={askQuestion} />
          ) : (
            <div className={styles.transcript}>
              {turns.map((turn) => {
                const latest = turn === lastTurn;
                return (
                  <Turn
                    key={turn.id}
                    turn={turn}
                    slow={latest && slow}
                    onNavigate={onClose}
                    animate={!initialTurnIds.has(turn.id)}
                    onRetry={retryable && latest ? retry : undefined}
                    onAsk={latest && !busy ? askQuestion : undefined}
                    followUps={latest ? turn.followups : undefined}
                    onAnnounce={announce}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {behind && !empty ? (
            <button type="button" onClick={jumpToLatest} className={`${styles.ghost} ${styles.jump}`}>
              <ArrowDown size={13} strokeWidth={2} aria-hidden />
              {ASSISTANT_COPY.jump}
            </button>
          ) : null}
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
            answered={answered}
            canSend={canSend}
          />
          <p className={styles.privacy}>
            {ASSISTANT_COPY.disclosure} {ASSISTANT_COPY.privacy}
          </p>
        </div>
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {statusText}
        </span>
      </div>
    </>,
    document.body,
  );
}
