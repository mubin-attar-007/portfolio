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
 * Includes all page chrome, including the skip link and availability strip.
 * Portalled overlays mark their body children with `data-modal-root` so the
 * dialog remains reachable. Each modal also locks background scrolling.
 *
 * Older engines without `inert` fall back to `aria-hidden`, which covers the
 * screen-reader half; those engines keep the focus trap the dialog already
 * implements.
 */
export function useInertBackground(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const nodes = Array.from(document.body.children).filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement &&
        !node.matches("[data-modal-root], script, style, link"),
    );
    const supportsInert = "inert" in HTMLElement.prototype;
    const previous = nodes.map((node) => ({
      node,
      inert: node.inert,
      hidden: node.getAttribute("aria-hidden"),
    }));
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    for (const node of nodes) {
      if (supportsInert) node.inert = true;
      else node.setAttribute("aria-hidden", "true");
    }

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      for (const { node, inert, hidden } of previous) {
        if (supportsInert) node.inert = inert;
        else if (hidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", hidden);
      }
    };
  }, [active]);
}
