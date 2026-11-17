"use client";

import { openAssistant } from "@/components/assistant/open-assistant";
import { Caret } from "@/components/ui/caret-link";
import { useCopyPrompt } from "./use-copy-prompt";
import styles from "./sections.module.css";

/**
 * "Open the assistant": opens the site's assistant panel. A launcher
 * (`data-assistant-launcher`), so closing the panel returns focus here.
 */
export function OpenAssistantAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={styles.action}
      data-assistant-launcher=""
      aria-haspopup="dialog"
      onClick={() => openAssistant()}
    >
      <span>{label}</span>
      <Caret />
    </button>
  );
}

/**
 * "Copy the prompt": copies the llms.txt prompt; the label says "Copied" (or
 * "Copy failed") for a moment, and a live region announces it.
 */
export function CopyPromptAction({
  prompt,
  label,
  copied,
  failed,
  copiedMessage,
  failedMessage,
}: {
  prompt: string;
  label: string;
  copied: string;
  failed: string;
  copiedMessage: string;
  failedMessage: string;
}) {
  const { state, copy } = useCopyPrompt(prompt);
  const text = state === "copied" ? copied : state === "failed" ? failed : label;
  const message = state === "copied" ? copiedMessage : state === "failed" ? failedMessage : "";
  return (
    <>
      <button type="button" className={styles.action} onClick={copy}>
        <span>{text}</span>
        <Caret />
      </button>
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
    </>
  );
}
