"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * AssistantPanel — a grounded, cited assistant over this site's content
 * (AI_ASSISTANT.md §5). Calm slide-over (desktop) / bottom sheet (mobile), the
 * one place a shadow is allowed. Streams from /api/chat over SSE; degrades to
 * the server's cited fallback on quota/error. A11y: modal dialog, focus trap,
 * Escape to close, focus restore, aria-live on the streamed answer.
 */

const STARTERS = [
  "What has Mubin shipped in production?",
  "Why a deterministic SQL validator instead of trusting the LLM?",
  "How does TradePulse avoid look-ahead bias?",
  "What real production bugs has he found and fixed?",
];

type Source = { source: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  mode?: "live" | "fallback" | "refusal";
  note?: string | null;
  streaming?: boolean;
};

/**
 * A short, honest label for a non-live turn — so the UI never dresses a
 * rate-limit or input prompt as a retrieved answer. Live answers get none.
 * "from site search" is shown only when the turn actually carries retrieved
 * citations (the graceful FAQ fallback), keyed off real sources, not a guess.
 */
function turnLabel(m: Msg): string | null {
  if (m.mode === "refusal") return "declined — out of scope";
  if (m.mode !== "fallback") return null;
  if (m.note === "rate-limited") return "one at a time — give it a second";
  if (m.sources && m.sources.length > 0) return "from site search";
  return null; // input prompts ("too long", "no question") speak for themselves
}

/** HTTP status /api/chat answers with when the per-IP window is exhausted. */
const RATE_LIMITED = 429;

const MODES = ["live", "fallback", "refusal"] as const;

/** Narrow an untrusted `mode` field to the union the UI renders. */
function asMode(value: unknown): Msg["mode"] {
  return (MODES as readonly string[]).includes(value as string)
    ? (value as Msg["mode"])
    : undefined;
}

/** Keep only well-formed citations; a malformed one must not blank the list. */
function asSources(value: unknown): Source[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Source => typeof (item as Source | undefined)?.source === "string",
  );
}

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

export function AssistantPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Msg[]>([]);
  const mountedRef = useRef(true);
  const dialogTitleId = useId();
  const dialogDescId = useId();
  const chatLogId = useId();
  const streamingIndexRef = useRef<number | null>(null);
  const streamingTextRef = useRef("");
  const streamFrameRef = useRef<number | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  const updateStreamingMessage = useCallback((patch: Partial<Msg>) => {
    const idx = streamingIndexRef.current;
    if (idx === null) return;
    setMessages((prev) => {
      const next = [...prev];
      const message = next[idx];
      if (!message) return prev;
      next[idx] = { ...message, ...patch };
      return next;
    });
  }, []);

  const flushStreamingMessage = useCallback(
    (patch: Partial<Msg> = {}) => {
      if (streamFrameRef.current !== null) {
        cancelAnimationFrame(streamFrameRef.current);
        streamFrameRef.current = null;
      }
      updateStreamingMessage({
        content: streamingTextRef.current,
        ...patch,
      });
    },
    [updateStreamingMessage],
  );

  const scheduleStreamingMessage = useCallback(() => {
    if (streamFrameRef.current !== null) {
      return;
    }
    streamFrameRef.current = requestAnimationFrame(() => {
      streamFrameRef.current = null;
      if (!mountedRef.current) return;
      updateStreamingMessage({ content: streamingTextRef.current });
    });
  }, [updateStreamingMessage]);

  // Single close path: Escape, the X button, and the backdrop all call the
  // owner's `onClose`, which unmounts the panel AND restores focus to a visible
  // launcher (WCAG 2.4.3). The panel can't pick that target itself — which
  // launcher is visible depends on the breakpoint.
  //
  // focus the input on open; trap focus + Escape while open
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        // The assistant changes its interactive controls as a conversation
        // starts and the submit button enables/disables. Recompute the live
        // tab order instead of trapping focus against detached controls.
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
      if (streamFrameRef.current) {
        cancelAnimationFrame(streamFrameRef.current);
        streamFrameRef.current = null;
      }
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // autoscroll the transcript as tokens arrive (not on the empty state, which
  // would shove the starter questions out of view)
  useEffect(() => {
    messagesRef.current = messages;
    if (messages.length === 0) return;
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(
    () => () => {
      mountedRef.current = false;
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
      if (streamFrameRef.current) {
        cancelAnimationFrame(streamFrameRef.current);
        streamFrameRef.current = null;
      }
      streamingIndexRef.current = null;
      streamingTextRef.current = "";
    },
    [],
  );

  // collapse the input back to one line once it's cleared (after send)
  useEffect(() => {
    if (draft === "" && inputRef.current) inputRef.current.style.height = "auto";
  }, [draft]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;

      const history: Msg[] = [...messagesRef.current, { role: "user", content: q }];
      setMessages((prev) => {
        const next: Msg[] = [
          ...prev,
          { role: "user", content: q },
          { role: "assistant", content: "", streaming: true },
        ];
        streamingIndexRef.current = next.length - 1;
        streamingTextRef.current = "";
        return next;
      });
      setBusy(true);

      const update = (patch: Partial<Msg>) => updateStreamingMessage({ ...patch });
      const controller = new AbortController();
      activeRequestRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });
        // The rate limiter answers 429 + Retry-After, not a stream — surface the
        // real wait instead of letting the body reader fail into the generic
        // "assistant is resting" copy.
        if (res.status === RATE_LIMITED) {
          update({
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
        streamingTextRef.current = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const raw of events) {
            const frame = parseFrame(raw);
            if (!frame) continue; // unreadable frame — drop it, keep the answer
            const { event, data } = frame;
            if (event === "meta") {
              update({
                mode: asMode(data.mode),
                note: typeof data.note === "string" ? data.note : null,
              });
            } else if (event === "token") {
              if (typeof data.text === "string") {
                streamingTextRef.current = `${streamingTextRef.current}${data.text}`;
                scheduleStreamingMessage();
              }
            } else if (event === "sources") {
              update({ sources: asSources(data.citations) });
            } else if (event === "done") {
              flushStreamingMessage();
              update({ streaming: false });
            }
          }
        }
        flushStreamingMessage({ streaming: false });
      } catch (error) {
        if (!mountedRef.current) return;
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        flushStreamingMessage();
        update({
          content:
            "The assistant is resting. Everything it would say is on the page — try the work and writing.",
          streaming: false,
          mode: "fallback",
        });
      } finally {
        if (streamFrameRef.current) {
          cancelAnimationFrame(streamFrameRef.current);
          streamFrameRef.current = null;
        }
        if (activeRequestRef.current === controller) {
          activeRequestRef.current = null;
        }
        streamingIndexRef.current = null;
        streamingTextRef.current = "";
        if (mountedRef.current) {
          setBusy(false);
        }
      }
    },
    [busy, flushStreamingMessage, scheduleStreamingMessage, updateStreamingMessage],
  );

  const empty = messages.length === 0;
  const statusText = busy
    ? "Searching the site and generating a cited answer."
    : "Ready to search this site.";

  // Portal to <body>: the header pill has backdrop-filter, which would otherwise
  // make it the containing block for this fixed panel and mis-anchor it.
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 bg-[var(--scrim)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="assistant-panel-dialog"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescId}
        className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-overlay)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(38rem,calc(100dvh-6rem))] sm:w-[408px] sm:rounded-[var(--radius-lg)]"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <div>
            <p id={dialogTitleId} className="text-sm font-medium text-ink">
              Ask about my work
            </p>
            <p className="font-mono text-xs text-ink-tertiary">
              BM25 keyword search over my case studies, writing &amp; résumé
            </p>
            <p id={dialogDescId} className="sr-only">
              Use this panel to ask questions about case studies, writing, and résumé details. Press Escape
              to close.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-ink-secondary hover:text-ink"
          >
            <X size={18} strokeWidth={1.5} aria-hidden />
          </button>
        </header>

        <div
          ref={logRef}
          id={chatLogId}
          className="flex-1 overflow-y-auto px-5 py-4"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-atomic="true"
        >
          {empty ? (
            <div>
              <p className="text-sm leading-relaxed text-ink-secondary">
                Ask about Mubin&apos;s work. Every answer is pulled straight from this
                site — case studies, writing, and résumé — and cited to the page. It
                won&apos;t tell you anything that isn&apos;t already here.
              </p>
              <p className="mt-5 font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                Try one, or ask your own
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {STARTERS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => ask(s)}
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
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <p key={i} className="self-end rounded-[var(--radius-md)] bg-bg-subtle px-3 py-2 text-sm text-ink">
                    {m.content}
                  </p>
                ) : (
                  <div key={i}>
                    {turnLabel(m) ? (
                      <p className="mb-1 font-mono text-xs text-ink-tertiary">{turnLabel(m)}</p>
                    ) : null}
                    <div
                      className="whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary"
                      aria-busy={m.streaming || undefined}
                    >
                      {m.content}
                      {m.streaming && !m.content ? (
                        <span className="font-mono text-xs text-ink-tertiary">
                          searching<span className="motion-safe:animate-pulse">…</span>
                        </span>
                      ) : null}
                    </div>
                    {m.sources && m.sources.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.sources.map((s, si) => (
                          <span
                            key={si}
                            className="rounded-[var(--radius-xs)] border border-border px-2 py-0.5 font-mono text-xs text-ink-tertiary"
                          >
                            {s.source}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
                setDraft("");
              }}
              aria-label="Ask this site a question"
              className="flex items-end gap-2 border-t border-border px-5 py-3"
            >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={400}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(draft);
                setDraft("");
              }
            }}
            placeholder="Ask about a project or a decision…"
            aria-describedby={`${chatLogId} ${dialogDescId}`}
            aria-label="Your question"
            className="max-h-28 flex-1 resize-none overflow-y-auto rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-ink focus-visible:border-border-strong"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            Ask
          </button>
        </form>
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {statusText}
        </span>
        <p className="px-5 pb-3 font-mono text-xs text-ink-tertiary">Cited · may be imperfect · not stored.</p>
      </div>
    </>,
    document.body,
  );
}
