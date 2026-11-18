"use client";

import { Caret } from "@/components/ui/caret-link";
import { openAssistant } from "@/components/assistant/open-assistant";
import styles from "./contact.module.css";

/**
 * Opens the site assistant (the `assistant:open` event) from the contact page.
 * A real `<button>`: it performs an action rather than navigating. Styled as
 * the caret link so it sits beside the other sub-card links as their peer.
 * A launcher (`data-assistant-launcher`), so closing the panel returns focus here.
 */
export function AssistantOpener({ children }: { children: string }) {
  return (
    <button
      type="button"
      className={styles.opener}
      data-assistant-launcher=""
      aria-haspopup="dialog"
      onClick={() => openAssistant()}
    >
      <span>{children}</span>
      <Caret />
    </button>
  );
}
