"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { openAssistant } from "@/components/assistant/open-assistant";
import { Caret } from "@/components/ui/caret-link";
import { Container } from "./container";
import styles from "./chrome.module.css";

/**
 * AnnouncementBar — the dark strip above the nav, on the home page only
 * (prototype `.announce`): the availability line (a link to the contact
 * funnel) and "Ask my AI assistant", which opens the assistant.
 *
 * Props are plain strings from config/site.ts (STATUS, ASK_AI), so no config
 * module ships to the browser. Below 640px only the status shows; below 380px
 * its short form.
 *
 * A11y: an `<aside>` named "Announcement", so its content sits in a landmark
 * like the rest of the page (axe `region`) and a screen reader can skip it.
 * The live dot is decorative; the words carry it. The ask button is a
 * launcher (`data-assistant-launcher`), so closing the panel returns focus to it.
 */
export function AnnouncementBar({
  status,
  askLabel,
}: {
  status: { text: string; short: string; href: string };
  askLabel: string;
}) {
  const pathname = usePathname();
  if (pathname !== "/" || !status.text) return null;
  return (
    <aside aria-label="Announcement" className={styles.bar} data-print="hide">
      <Container className={styles.barInner}>
        <Link href={status.href} prefetch={false} className={styles.status}>
          <span className={styles.full}>{status.text}</span>
          <span className={styles.short}>{status.short}</span>
        </Link>
        <span className={styles.sep} aria-hidden="true" />
        <button
          type="button"
          className={styles.ask}
          data-assistant-launcher=""
          aria-haspopup="dialog"
          onClick={() => openAssistant()}
        >
          {askLabel}
          <Caret />
        </button>
      </Container>
    </aside>
  );
}
