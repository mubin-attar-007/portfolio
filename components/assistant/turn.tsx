import { memo } from "react";
import Link from "next/link";
import { CircleAlert, RotateCcw } from "lucide-react";
import { Caret } from "@/components/ui/caret-link";
import type { ChatTurn } from "@/lib/ai/chat-contract";
import { AnswerText } from "./answer-text";
import { ASSISTANT_COPY } from "./copy";
import { isFailedTurn, labelTone, turnLabel } from "./turn-status";
import styles from "./assistant.module.css";

type TurnProps = {
  turn: ChatTurn;
  /** Called when a cited page is opened: the panel closes as the page loads. */
  onNavigate: () => void;
  /** Rise into place. True only for turns added while the panel is open. */
  animate: boolean;
  /**
   * Present on the latest turn when it failed: asks the same question again.
   * Never present while an answer streams, because asking appends a new turn.
   */
  onRetry?: () => void;
};

/**
 * Turn — one message of the transcript. The visitor's question is a dark
 * bubble on the right; an answer is a light bubble on the left, with its label
 * (when it is not a complete live answer) above it and its cited pages inside
 * it. A failure is a calm card with a retry on the latest turn.
 *
 * A11y: each message starts with a visually hidden speaker ("You asked:",
 * "Answer:") so the transcript reads in order by virtual cursor. The answer
 * body carries `aria-busy` while it streams. Cited pages are a named list of
 * same-site links that open in this tab, with the decorative arrow-swap caret.
 * A caution label pairs its colour with words, never colour alone.
 *
 * Performance: memoized, so only the streaming turn re-renders per frame.
 */
export const Turn = memo(function Turn({ turn, onNavigate, animate, onRetry }: TurnProps) {
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
  const links = sources.flatMap((citation) => citation.links);
  const failed = isFailedTurn(turn);
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
          {turn.content ? <AnswerText text={turn.content} /> : null}
          {turn.streaming && !turn.content ? (
            <span className={styles.searching}>{ASSISTANT_COPY.searching}…</span>
          ) : null}
          {sources.length > 0 ? (
            <div className={styles.sources}>
              {links.length > 0 ? (
                <ul className={styles.sourceList} aria-label={ASSISTANT_COPY.sources}>
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        prefetch={false}
                        onNavigate={onNavigate}
                        className={styles.sourceChip}
                      >
                        {link.label}
                        <Caret />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className={styles.sourceNames}>
                {ASSISTANT_COPY.sourcesFrom} {sources.map((citation) => citation.source).join(" · ")}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
