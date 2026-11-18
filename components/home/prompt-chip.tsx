"use client";

import { Check, Copy } from "lucide-react";
import { cx } from "@/components/ui/cx";
import { useCopyPrompt } from "./use-copy-prompt";
import styles from "./hero.module.css";

/** The three agent marks stacked in the chip (decorative glyphs). */
const AGENT_GLYPHS = ["✦", "›_", "◎"] as const;

/**
 * PromptChip — the hero's "Copy prompt" pill. On hover or focus the agent
 * stack folds into one, the prompt slides in (mono, ellipsis) and the label
 * folds into a copy icon; a copy shows a tick and the live region says what
 * happened. The visible preview is decorative: the button's name and the live
 * region carry the meaning.
 */
export function PromptChip({
  prompt,
  preview,
  label,
  hint,
  copied,
  failed,
}: {
  prompt: string;
  preview: string;
  label: string;
  hint: string;
  copied: string;
  failed: string;
}) {
  const { state, copy } = useCopyPrompt(prompt);
  const message = state === "copied" ? copied : state === "failed" ? failed : hint;

  return (
    <div className={styles.promptWrap}>
      {/* The whole pill copies. On hover the button folds to an icon at the
          end, so the point a visitor aimed at becomes the prompt preview; a
          click there must still copy. The button stays the one keyboard and
          screen-reader control, and its click bubbles up to this handler. */}
      <div className={cx(styles.chip, state === "copied" && styles.copied)} onClick={copy}>
        <span className={styles.agents} aria-hidden="true">
          {AGENT_GLYPHS.map((glyph) => (
            <span key={glyph}>{glyph}</span>
          ))}
        </span>
        <span className={styles.promptText} aria-hidden="true">
          {preview}
        </span>
        <button type="button" className={styles.copyBtn} aria-label={label}>
          <span className={styles.copyLabel}>{label}</span>
          <Copy className={styles.iconCopy} strokeWidth={1.8} aria-hidden />
          <Check className={styles.iconCheck} strokeWidth={2.2} aria-hidden />
        </button>
      </div>
      <small className={styles.status} aria-live="polite">
        {message}
      </small>
    </div>
  );
}
