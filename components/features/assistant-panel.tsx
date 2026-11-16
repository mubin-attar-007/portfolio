"use client";

import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Square, X } from "lucide-react";
import { PROSE } from "@/components/mdx/prose";
import { parseAnswer, type Inline } from "@/lib/ai/answer-format";
import {
  historyForRequest,
  MAX_MESSAGE_CHARS,
  type AnswerMode,
  type AnswerNote,
  type ChatTurn,
} from "@/lib/ai/chat-contract";
import { readCitations } from "@/lib/ai/citation-links";
import { STARTERS } from "@/lib/ai/starters";
import { useInertBackground } from "@/lib/use-inert-background";

/**
 * AssistantPanel — a grounded, cited assistant over this site's content
 * (AI_ASSISTANT.md §5). Calm slide-over (desktop) / bottom sheet (mobile), the
 * one place a shadow is allowed. Streams from /api/chat over SSE and renders
 * the answer's small markdown subset as React elements (never as HTML).
 *
 * The conversation itself belongs to the launcher (`Assistant`), which stays
 * mounted in the header across page changes: closing the panel, or opening a
 * cited page, keeps the transcript. Closing during an answer stops it.
 *
 * A11y: modal dialog with a focus trap, Escape to close, focus restore (owned
 * by the launcher), a polite log for answers. Focus never drops to <body>:
 * sending moves it to the question field, and a control that disappears (a
 * starter, Stop, Clear) hands it back to the field first.
 */

type Props = {
  turns: ChatTurn[];
  setTurns: Dispatch<SetStateAction<ChatTurn[]>>;
  onClose: () => void;
};

/** HTTP status /api/chat answers with when the per-client window is exhausted. */
const RATE_LIMITED = 429;

/** Longer than the route's own 20 s answer timeout, so the server's fallback normally wins. */
const CLIENT_TIMEOUT_MS = 30_000;

/** The character counter appears once a question is this long. */
const COUNTER_FROM = Math.floor(MAX_MESSAGE_CHARS * 0.8);

/** Tallest the question field grows before it scrolls. */
const MAX_FIELD_HEIGHT_PX = 112;

const UNAVAILABLE =
  "The assistant is unavailable right now. You can still explore the case studies and résumé.";
const TIMED_OUT = "That answer took too long, so I stopped waiting. Try again in a moment.";

/**
 * A short, honest label for a turn that is not a complete live answer — so the
 * UI never dresses a rate-limit notice, a stopped answer or site search up as
 * a live answer. Notes whose text already says it all carry no label.
 */
const NOTE_LABEL: Partial<Record<AnswerNote, string>> = {
  "injection-screened": "declined — out of scope",
  "live-unavailable": "live answers unavailable — site search only",
  "daily-budget-reached": "live answers paused for today — site search only",
  "client-allowance-reached": "live answers paused for today — site search only",
  "rate-limited": "rate limited",
  stopped: "stopped",
  "timed-out": "timed out",
};

function turnLabel(turn: ChatTurn): string | null {
  const byNote = turn.note ? NOTE_LABEL[turn.note] : undefined;
  if (byNote) return byNote;
  if (turn.mode === "refusal") return "declined — out of scope";
  if (turn.incomplete) return "cut short";
  if (turn.mode === "fallback" && turn.sources && turn.sources.length > 0) return "from site search";
  return null;
}

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

// ---- Answer text -------------------------------------------------------------

/** Text with its single line breaks kept. */
function withBreaks(text: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

function InlineText({ inlines }: { inlines: Inline[] }) {
  return inlines.map((inline, i) => {
    switch (inline.kind) {
      case "text":
        return <Fragment key={i}>{withBreaks(inline.text)}</Fragment>;
      case "code":
        return (
          <code key={i} className={PROSE.code}>
            {inline.text}
          </code>
        );
      case "strong":
        return (
          <strong key={i} className={PROSE.strong}>
            <InlineText inlines={inline.children} />
          </strong>
        );
      case "em":
        return (
          <em key={i}>
            <InlineText inlines={inline.children} />
          </em>
        );
    }
  });
}

/**
 * An answer, rendered from the parsed markdown subset. Every string reaches
 * the DOM as a React text node, so model output can never become markup.
 */
function AnswerText({ text }: { text: string }) {
  const blocks = useMemo(() => parseAnswer(text), [text]);
  return blocks.map((block, i) => {
    switch (block.kind) {
      case "paragraph":
        return (
          <p key={i} className="mt-2 first:mt-0">
            <InlineText inlines={block.inlines} />
          </p>
        );
      case "heading":
        return (
          <p key={i} className="mt-3 font-medium text-ink first:mt-0">
            <InlineText inlines={block.inlines} />
          </p>
        );
      case "list": {
        const List = block.ordered ? "ol" : "ul";
        return (
          <List
            key={i}
            className={`mt-2 space-y-1 pl-5 marker:text-ink-tertiary first:mt-0 ${block.ordered ? "list-decimal" : "list-disc"}`}
          >
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">
                <InlineText inlines={item} />
              </li>
            ))}
          </List>
        );
      }
      case "code":
        return (
          <pre
            key={i}
            className="mt-2 overflow-x-auto rounded-[var(--radius-sm)] bg-bg-subtle px-3 py-2 font-mono text-xs leading-relaxed text-ink first:mt-0"
          >
            <code>{block.text}</code>
          </pre>
        );
    }
  });
}

/** One turn of the transcript. Memoized: only the streaming turn re-renders per frame. */
const Turn = memo(function Turn({ turn, onNavigate }: { turn: ChatTurn; onNavigate: () => void }) {
  if (turn.role === "user") {
    return (
      <p className="self-end whitespace-pre-wrap break-words rounded-[var(--radius-md)] bg-bg-subtle px-3 py-2 text-sm text-ink">
        {turn.content}
      </p>
    );
  }
  const label = turnLabel(turn);
  const sources = turn.sources ?? [];
  return (
    <div>
      {label ? <p className="mb-1 font-mono text-xs text-ink-tertiary">{label}</p> : null}
      <div className="break-words text-sm leading-relaxed text-ink-secondary" aria-busy={turn.streaming || undefined}>
        {turn.content ? <AnswerText text={turn.content} /> : null}
        {turn.streaming && !turn.content ? (
          <span className="font-mono text-xs text-ink-tertiary">
            searching<span className="motion-safe:animate-pulse">…</span>
          </span>
        ) : null}
      </div>
      {sources.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2" aria-label="Answer sources">
          {sources.map((citation, i) => (
            <div key={i} className="text-xs">
              <p className="break-words leading-relaxed text-ink-tertiary">{citation.source}</p>
              {citation.links.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {citation.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
                      onNavigate={onNavigate}
                      className="inline-flex min-h-6 items-center gap-1 text-ink underline decoration-border-strong underline-offset-4 hover:decoration-ink"
                    >
                      {link.label}
                      {/* → : a page of this site, same tab. ↗ is reserved for a new tab or mail (design-system §11.5). */}
                      <span aria-hidden>→</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
});

// ---- Panel -------------------------------------------------------------------

type ActiveRequest = {
  id: string;
  controller: AbortController;
  /** Why the visitor's side ended it, when it did. */
  reason: "stopped" | "timed-out" | null;
};

export function AssistantPanel({ turns, setTurns, onClose }: Props) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
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
  const hintId = useId();
  const counterId = useId();

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

  // Collapse the field back to one line once it's cleared (after send).
  useEffect(() => {
    if (draft === "" && inputRef.current) inputRef.current.style.height = "auto";
  }, [draft]);

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

  const empty = turns.length === 0;
  const canSend = !busy && draft.trim().length > 0;
  const showCounter = draft.length >= COUNTER_FROM;
  const statusText = busy
    ? "Searching the site and generating a cited answer."
    : "Ready to search this site.";

  // Portal to <body>: the header pill has backdrop-filter, which would otherwise
  // make it the containing block for this fixed panel and mis-anchor it.
  return createPortal(
    <>
      <div
        data-modal-root
        className="fixed inset-0 z-50 bg-[var(--scrim)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        data-modal-root
        id="assistant-panel-dialog"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescId}
        className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-overlay)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(38rem,calc(100dvh-6rem))] sm:w-[408px] sm:rounded-[var(--radius-lg)]"
      >
        <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
          <div className="min-w-0">
            <p id={dialogTitleId} className="text-sm font-medium text-ink">
              Ask about my work
            </p>
            <p className="font-mono text-xs text-ink-tertiary">
              Projects, experience, and the decisions behind them
            </p>
            <p id={dialogDescId} className="sr-only">
              Ask about Mubin&apos;s projects, experience and writing. Answers link the pages they
              come from. Press Escape to close.
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            {empty ? null : (
              <button
                type="button"
                onClick={clear}
                aria-label="Clear conversation"
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] px-3 text-xs text-ink-secondary hover:text-ink"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-ink-secondary hover:text-ink"
            >
              <X size={18} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </header>

        <div
          ref={logRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
          onScroll={(event) => {
            const el = event.currentTarget;
            followTranscriptRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
          }}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-atomic="false"
          aria-busy={busy}
        >
          {empty ? (
            <div>
              <p className="text-sm leading-relaxed text-ink-secondary">
                Ask about Mubin&apos;s projects, experience and writing. Answers come from the
                site&apos;s case studies, essays, notes, evaluations and résumé, and link the page
                each one comes from.
              </p>
              <p className="mt-5 font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                Try one, or ask your own
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {STARTERS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => void ask(s)}
                      className="min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg-subtle px-3 py-2 text-left text-sm text-ink transition-colors hover:border-border-strong"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {turns.map((turn) => (
                <Turn key={turn.id} turn={turn} onNavigate={onClose} />
              ))}
            </div>
          )}
        </div>

        {busy ? (
          <div className="flex justify-center border-t border-border px-5 py-2">
            <button
              ref={stopRef}
              type="button"
              onClick={() => {
                stop("stopped");
                focusField();
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border px-3 text-xs text-ink-secondary transition-colors hover:border-border-strong hover:text-ink"
            >
              <Square size={10} strokeWidth={2} aria-hidden />
              Stop answering
            </button>
          </div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(draft);
          }}
          aria-label="Ask this site a question"
          className="flex items-end gap-2 border-t border-border px-5 py-3"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={MAX_MESSAGE_CHARS}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, MAX_FIELD_HEIGHT_PX)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void ask(draft);
              }
            }}
            placeholder="Ask about a project or a decision…"
            aria-describedby={showCounter ? `${hintId} ${counterId}` : hintId}
            aria-label="Your question"
            className="max-h-28 flex-1 resize-none overflow-y-auto rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-ink focus-visible:border-border-strong"
          />
          {/* aria-disabled, not disabled: a focused button that becomes
              disabled drops focus to <body>. The submit handler ignores it. */}
          <button
            type="submit"
            aria-disabled={!canSend || undefined}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-accent"
          >
            Ask
          </button>
        </form>
        <p id={hintId} className="sr-only">
          Enter to send, Shift+Enter for a new line. Up to {MAX_MESSAGE_CHARS.toLocaleString("en")}{" "}
          characters.
        </p>
        {showCounter ? (
          <p id={counterId} className="px-5 font-mono text-xs tabular-nums text-ink-tertiary">
            {draft.length.toLocaleString("en")} / {MAX_MESSAGE_CHARS.toLocaleString("en")} characters
          </p>
        ) : null}
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {statusText}
        </span>
        <p className="px-5 pb-3 font-mono text-xs text-ink-tertiary">Cited · may be imperfect · not stored.</p>
      </div>
    </>,
    document.body,
  );
}
