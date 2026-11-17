import { memo, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Check, CircleAlert, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Caret } from "@/components/ui/caret-link";
import { toPlainText } from "@/lib/ai/answer-format";
import type { AssistantAction, ChatTurn } from "@/lib/ai/chat-contract";
import { AnswerText } from "./answer-text";
import { ASSISTANT_COPY } from "./copy";
import { pendingLine } from "./pending";
import { isFailedTurn, labelTone, turnLabel } from "./turn-status";
import styles from "./assistant.module.css";

/** How long the copy button shows its tick. */
const COPIED_MS = 2_000;

type TurnProps = {
  turn: ChatTurn;
  /** The pending answer has sent no text for a while: its line says so (no new motion). */
  slow?: boolean;
  /** Called when a page of this site is opened from the turn: the panel closes as the page loads. */
  onNavigate: () => void;
  /** Rise into place. True only for turns added while the panel is open. */
  animate: boolean;
  /**
   * Present on the latest turn when it failed: asks the same question again.
   * Never present while an answer streams, because asking appends a new turn.
   */
  onRetry?: () => void;
  /** Present on the latest settled answer: asks one of its follow-up questions. */
  onAsk?: (question: string) => void;
  /** The follow-up questions to offer, already filtered against the conversation. */
  followUps?: readonly string[];
  /** Says something through the panel's live region ("Answer copied"). */
  onAnnounce: (message: string) => void;
};

/** True for an action that opens a page of this site in this tab: the panel closes for it. */
const opensHere = (action: AssistantAction): boolean => action.href.startsWith("/") && action.kind !== "resume-pdf";

/**
 * The copy button of an answer: copies it as plain text, shows a tick for a
 * moment and has the panel announce it. A refused clipboard is announced too.
 */
function CopyAnswer({ text, onAnnounce }: { text: string; onAnnounce: (message: string) => void }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(text));
      setCopied(true);
      onAnnounce(ASSISTANT_COPY.copied);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      onAnnounce(ASSISTANT_COPY.copyFailed);
    }
  };
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={ASSISTANT_COPY.copy}
      data-state={copied ? "done" : undefined}
      className={`${styles.ghost} ${styles.copy}`}
    >
      <span className={`${styles.copyIcon} ${styles.copyIdle}`} aria-hidden>
        <Copy size={14} strokeWidth={1.75} />
      </span>
      <span className={`${styles.copyIcon} ${styles.copyDone}`} aria-hidden>
        <Check size={14} strokeWidth={2} />
      </span>
    </button>
  );
}

/** The curated questions under the latest answer, as chips that ask them. */
function FollowUps({ questions, onAsk }: { questions: readonly string[]; onAsk: (question: string) => void }) {
  const labelId = useId();
  return (
    <div className={styles.followUps}>
      <p id={labelId} className={styles.label}>
        {ASSISTANT_COPY.followUps}
      </p>
      <ul className={styles.chips} aria-labelledby={labelId}>
        {questions.map((question) => (
          <li key={question}>
            <button type="button" onClick={() => onAsk(question)} className={styles.chip}>
              {question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Turn — one message of the transcript. The visitor's question is a dark
 * bubble on the right; an answer is a light bubble on the left, with its label
 * (when it is not a complete live answer) above it, the pages it cites and a
 * copy button inside it, and its next steps and follow-up questions below it.
 * A failure is a calm card with a retry on the latest turn.
 *
 * A11y: each message starts with a visually hidden speaker ("You asked:",
 * "Answer:") so the transcript reads in order by virtual cursor. The answer
 * body carries `aria-busy` while it streams. Cited pages are a named list of
 * same-site links that open in this tab, with the decorative arrow-swap caret;
 * the next steps are a named group of the site's buttons, an outside link
 * marked ↗ and announced as opening a new tab. A caution label pairs its
 * colour with words, never colour alone.
 *
 * Performance: memoized, so only the streaming turn re-renders per frame.
 */
export const Turn = memo(function Turn({ turn, slow = false, onNavigate, animate, onRetry, onAsk, followUps, onAnnounce }: TurnProps) {
  const rise = animate ? ` ${styles.rise}` : "";

  if (turn.role === "user") {
    return (
      <div className={`${styles.userTurn}${rise}`}>
        <span className="sr-only">{ASSISTANT_COPY.you} </span>
        <p className={styles.userBubble}>{turn.content}</p>
      </div>
    );
  }

  const label = turnLabel(turn);
  const sources = turn.sources ?? [];
  const actions = turn.actions ?? [];
  const failed = isFailedTurn(turn);
  const settled = !turn.streaming;
  const pending = pendingLine(turn, slow);
  // A stop before the first token leaves nothing to show but its label.
  const hasBody = Boolean(turn.content) || turn.streaming === true;

  return (
    <div className={`${styles.assistantTurn}${rise}`}>
      <span className="sr-only">{ASSISTANT_COPY.answer} </span>
      {label ? (
        <p className={styles.note} data-tone={labelTone(turn)}>
          {label}
        </p>
      ) : null}
      {failed ? (
        <div className={styles.bubble} data-tone="error">
          <CircleAlert size={16} strokeWidth={1.75} className={styles.errorIcon} aria-hidden />
          <div>
            <AnswerText text={turn.content} />
            {onRetry ? (
              <button type="button" onClick={onRetry} className={`${styles.ghost} ${styles.retry}`}>
                <RotateCcw size={13} strokeWidth={2} aria-hidden />
                {ASSISTANT_COPY.retry}
              </button>
            ) : null}
          </div>
        </div>
      ) : hasBody ? (
        <div className={styles.bubble} aria-busy={turn.streaming || undefined}>
          {turn.content ? <AnswerText text={turn.content} streaming={turn.streaming === true} /> : null}
          {pending ? (
            // The bubble is aria-busy, so this line is not read; the panel's status line says it once.
            <span className={styles.searching}>{pending}</span>
          ) : null}
          {settled && turn.content && sources.length > 0 ? (
            // Only an answer that cites pages has something worth checking and copying.
            <div className={styles.answerFooter}>
              <div className={styles.sources}>
                <span className={styles.sourcesLabel} aria-hidden>
                  {ASSISTANT_COPY.sources}
                </span>
                <ul className={styles.sourceList} aria-label={ASSISTANT_COPY.sources}>
                  {sources.map((page) => (
                    <li key={page.href}>
                      <Link href={page.href} prefetch={false} onNavigate={onNavigate} className={styles.sourceChip}>
                        {page.label}
                        <Caret />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <CopyAnswer text={turn.content} onAnnounce={onAnnounce} />
            </div>
          ) : null}
        </div>
      ) : null}
      {settled && actions.length > 0 ? (
        <div className={styles.actionsRow} role="group" aria-label={ASSISTANT_COPY.actions}>
          {actions.map((action, i) => (
            <Button
              key={action.href}
              href={action.href}
              size="sm"
              variant={i === 0 ? "dark" : "light"}
              caret={opensHere(action)}
              download={action.kind === "resume-pdf" ? "" : undefined}
              onClick={opensHere(action) ? onNavigate : undefined}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
      {settled && onAsk && followUps && followUps.length > 0 ? <FollowUps questions={followUps} onAsk={onAsk} /> : null}
    </div>
  );
});
