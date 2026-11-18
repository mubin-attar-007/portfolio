"use client";

import { Pause, Play } from "lucide-react";
import { cx } from "@/components/ui/cx";
import styles from "./pause-button.module.css";

/**
 * PauseButton — pause and play for a band that moves on its own (WCAG 2.2.2):
 * the facts strip, the writing wall, the agent questions, the falling lines. A
 * small round button whose name says what it will do next. Its place on the
 * page is the caller's (`className`); `tone="dark"` for a plate. Reduced
 * motion: hidden, since the bands it serves stand still.
 */
export function PauseButton({
  paused,
  onToggle,
  labels,
  tone = "light",
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  labels: { pause: string; play: string };
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cx(styles.button, tone === "dark" && styles.dark, className)}
      aria-label={paused ? labels.play : labels.pause}
      onClick={onToggle}
    >
      {paused ? <Play size={12} strokeWidth={2.2} aria-hidden /> : <Pause size={12} strokeWidth={2.2} aria-hidden />}
    </button>
  );
}
