import { useId } from "react";
import { STARTERS } from "@/lib/ai/starters";
import { ASSISTANT_COPY } from "./copy";
import styles from "./assistant.module.css";

/**
 * EmptyState — the panel before the first question: one line of scope, then
 * the starter questions as chips. A chip sends its question.
 *
 * The starters are `lib/ai/starters.ts`, shared with the grounding test, so a
 * suggested question always has an answer on the site.
 *
 * A11y: the chips are a list of buttons named by the label above them. A
 * chip's text is exactly its question (its chevron is drawn in CSS), so the
 * question it sends reads the same in the transcript.
 *
 * @param onAsk Sends a question; the panel moves focus to the field first,
 *   because the chip unmounts with the empty state.
 */
export function EmptyState({ onAsk }: { onAsk: (question: string) => void }) {
  const labelId = useId();
  return (
    <div>
      <p className={styles.intro}>{ASSISTANT_COPY.intro}</p>
      <p id={labelId} className={styles.label}>
        {ASSISTANT_COPY.startersLabel}
      </p>
      <ul className={styles.chips} aria-labelledby={labelId}>
        {STARTERS.map((question) => (
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
