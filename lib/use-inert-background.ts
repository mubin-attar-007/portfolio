"use client";

import { useEffect } from "react";

/**
 * useInertBackground — marks the page behind an open modal as `inert`.
 *
 * A dialog that traps focus still leaves the rest of the page in the
 * accessibility tree: a screen-reader user can navigate out of the modal by
 * virtual cursor, and automated audits keep evaluating content the modal has
 * visually dimmed. `inert` is the platform's answer — it removes the subtree
 * from the accessibility tree, from focus order, and from pointer events in one
 * attribute, and it is what makes the scrim a real modal boundary rather than
 * a dark rectangle.
 *
 * It also fixed a measured defect: the 20% scrim drags 11px mono labels behind
 * the panel from 4.96:1 to 4.34:1, and the accessibility gate correctly flagged
 * them. Recolouring the page to survive being dimmed would have been the wrong
 * fix — content behind a modal is not meant to be read.
 *
 * Targets the layout's own landmarks rather than "every body child", so the
 * portalled dialog (a sibling appended to <body>) is never inerted by accident.
 *
 * Older engines without `inert` fall back to `aria-hidden`, which covers the
 * screen-reader half; those engines keep the focus trap the dialog already
 * implements.
 */
const LANDMARKS = ["header", "main", "footer"] as const;

export function useInertBackground(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const nodes = LANDMARKS.flatMap((sel) =>
      Array.from(document.querySelectorAll<HTMLElement>(`body > ${sel}`)),
    );
    const supportsInert = "inert" in HTMLElement.prototype;

    for (const node of nodes) {
      if (supportsInert) node.inert = true;
      else node.setAttribute("aria-hidden", "true");
    }

    return () => {
      for (const node of nodes) {
        if (supportsInert) node.inert = false;
        else node.removeAttribute("aria-hidden");
      }
    };
  }, [active]);
}
