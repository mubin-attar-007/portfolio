"use client";

import { useId } from "react";
import { Sparkles } from "lucide-react";
import { openAssistant } from "@/components/assistant/open-assistant";
import { Button, type ButtonVariant } from "@/components/ui/button";
import styles from "./ask-ai.module.css";

/**
 * AskAiButton — "Ask AI about <product>": opens the site's assistant, which
 * reads the page it is on and offers that case study's own starter questions
 * (spec/AI_ASSISTANT.md). It sends nothing: the visitor picks or types the
 * question, so an exploratory click never spends an answer.
 *
 * A11y: a native button that names the dialog it opens (`aria-haspopup`); a
 * launcher (`data-assistant-launcher`), so focus comes back to it when the
 * panel closes and the panel's code warms when it is hovered or focused.
 */
export function AskAiButton({ label, variant = "light" }: { label: string; variant?: ButtonVariant }) {
  return (
    <Button
      variant={variant}
      size="lg"
      caret
      data-assistant-launcher=""
      aria-haspopup="dialog"
      onClick={() => openAssistant()}
    >
      <Sparkles size={15} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </Button>
  );
}

/**
 * AskAiQuestions — the case study's starter questions as chips. Each chip shows
 * its question in full and sends exactly that once the panel opens.
 *
 * Props: `title` (names the group), `questions` (from `CASE_STUDY_STARTERS`,
 * passed in by the server page so the client bundle carries only these four),
 * `align` (`start`, or `center` under a centred band).
 *
 * A11y: a list of native buttons named by the title; each opens the dialog
 * (`aria-haspopup`) and is a launcher, so focus returns to the chip that was
 * pressed. Motion: the press squash and colour shifts, instant under reduced
 * motion.
 */
export function AskAiQuestions({
  title,
  questions,
  align = "start",
}: {
  title: string;
  questions: readonly string[];
  align?: "start" | "center";
}) {
  const titleId = useId();
  return (
    <div className={styles.questions} data-align={align}>
      <p id={titleId} className={styles.title}>
        <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" />
        {title}
      </p>
      <ul className={styles.chips} aria-labelledby={titleId}>
        {questions.map((question) => (
          <li key={question}>
            <button
              type="button"
              className={styles.chip}
              data-assistant-launcher=""
              aria-haspopup="dialog"
              onClick={() => openAssistant(question)}
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
