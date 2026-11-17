import { useEffect, useId, type MouseEvent, type RefObject } from "react";
import { ArrowUp, Check, LoaderCircle } from "lucide-react";
import { MAX_MESSAGE_CHARS } from "@/lib/ai/chat-contract";
import { ASSISTANT_COPY } from "./copy";
import styles from "./assistant.module.css";

/** The character counter appears once a question is this long. */
const COUNTER_FROM = Math.floor(MAX_MESSAGE_CHARS * 0.8);

/** Tallest the question field grows before it scrolls (7rem in the stylesheet). */
const MAX_FIELD_HEIGHT_PX = 112;

/** Grow the field with its text, up to MAX_FIELD_HEIGHT_PX. */
function fitHeight(field: HTMLTextAreaElement): void {
  field.style.height = "auto";
  field.style.height = `${Math.min(field.scrollHeight, MAX_FIELD_HEIGHT_PX)}px`;
}

type ComposerProps = {
  /** The question field; the panel focuses it on open, on send and on clear. */
  inputRef: RefObject<HTMLTextAreaElement | null>;
  draft: string;
  onDraftChange: (draft: string) => void;
  /** Send the draft. The panel ignores it while an answer is streaming. */
  onSubmit: () => void;
  /** An answer is streaming: the send button shows a spinner. */
  busy: boolean;
  /** An answer has just arrived: the empty send button shows a check for a moment. */
  answered: boolean;
  /** There is a draft and nothing is streaming. */
  canSend: boolean;
};

/**
 * Composer — the question field with its send button inside it.
 *
 * Enter sends and Shift+Enter starts a new line; an IME composition is never
 * cut short. The field grows with its text and collapses once it is cleared.
 * The send button swaps its arrow for a spinner while an answer streams, then
 * for a check as the answer lands, then back to the arrow (once typing starts,
 * or after a moment).
 *
 * A11y: the field's description is a short hint (plus the counter near the
 * limit), never the transcript. **Ask** reports its state with `aria-disabled`,
 * not `disabled`: a focused button that becomes disabled drops focus to
 * <body>. Typing focus rings the whole field, not the bare textarea.
 */
export function Composer({
  inputRef,
  draft,
  onDraftChange,
  onSubmit,
  busy,
  answered,
  canSend,
}: ComposerProps) {
  const hintId = useId();
  const counterId = useId();
  const showCounter = draft.length >= COUNTER_FROM;

  // Collapse the field back to one line once it's cleared (after send).
  useEffect(() => {
    if (draft === "" && inputRef.current) inputRef.current.style.height = "auto";
  }, [draft, inputRef]);

  // A press on the field's padding still lands in the field.
  const focusFromPadding = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        aria-label={ASSISTANT_COPY.formLabel}
        className={styles.composer}
      >
        <div className={styles.field} onMouseDown={focusFromPadding}>
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={MAX_MESSAGE_CHARS}
            onChange={(event) => {
              onDraftChange(event.target.value);
              fitHeight(event.target);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                onSubmit();
              }
            }}
            placeholder={ASSISTANT_COPY.placeholder}
            aria-describedby={showCounter ? `${hintId} ${counterId}` : hintId}
            aria-label={ASSISTANT_COPY.fieldLabel}
            className={styles.textarea}
          />
          <button
            type="submit"
            aria-label={ASSISTANT_COPY.send}
            aria-disabled={!canSend || undefined}
            data-state={busy ? "busy" : answered && !canSend ? "done" : undefined}
            className={styles.send}
          >
            <span className={`${styles.sendIcon} ${styles.arrow}`} aria-hidden>
              <ArrowUp size={17} strokeWidth={2.25} />
            </span>
            <span className={`${styles.sendIcon} ${styles.spinner}`} aria-hidden>
              <LoaderCircle size={17} strokeWidth={2.25} />
            </span>
            <span className={`${styles.sendIcon} ${styles.check}`} aria-hidden>
              <Check size={17} strokeWidth={2.25} />
            </span>
          </button>
        </div>
      </form>
      <p id={hintId} className="sr-only">
        Enter to send, Shift+Enter for a new line. Up to {MAX_MESSAGE_CHARS.toLocaleString("en")}{" "}
        characters.
      </p>
      {showCounter ? (
        <p id={counterId} className={styles.counter}>
          {draft.length.toLocaleString("en")} / {MAX_MESSAGE_CHARS.toLocaleString("en")} characters
        </p>
      ) : null}
    </>
  );
}
