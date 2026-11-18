"use client";

import { Sparkles } from "lucide-react";
import { openAssistant } from "@/components/assistant/open-assistant";
import styles from "./chrome.module.css";

/**
 * AskLauncher — the floating bottom-right "Ask AI" bubble (prototype
 * `.ask-bubble`); icon-only on phones, where the label stays for screen
 * readers; its accessible name starts with the assistant trigger's label
 * ("Ask this site", WCAG 2.5.3) and contains the visible "Ask AI". Opens the assistant through `openAssistant()`; it is a
 * `data-assistant-launcher`, so focus can return to it when the panel closes.
 * Motion: lifts and turns its sparkle on hover (instant under reduced motion).
 */
export function AskLauncher({ label, name }: { label: string; name: string }) {
  return (
    <button
      type="button"
      className={styles.launcher}
      aria-label={name}
      data-assistant-launcher=""
      data-chrome=""
      data-print="hide"
      onClick={() => openAssistant()}
    >
      <Sparkles size={18} strokeWidth={1.6} aria-hidden className={styles.launcherIcon} />
      <span className={styles.launcherText}>{label}</span>
    </button>
  );
}
