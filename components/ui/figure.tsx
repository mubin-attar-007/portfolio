import type { ReactNode } from "react";
import { EVIDENCE_FRAME, EVIDENCE_SPACING } from "@/components/mdx/prose";

/**
 * Figure — framed evidence (diagram, screenshot, table, video) with a caption.
 *
 * Shares its frame and its vertical rhythm with CodeBlock via the EVIDENCE_*
 * constants, so a diagram and a code sample sitting in the same article read as
 * two instances of one device rather than two different boxes. Previously the
 * figure had no shadow while the code block did, which made the two look like
 * they belonged to different pages.
 *
 * Props: `children` (the framed content), `caption` (optional, ReactNode so a
 * caption can carry a link).
 *
 * A11y: real `<figure>`/`<figcaption>` so the caption is programmatically the
 * figure's description; images inside must carry meaningful `alt`, and video
 * must carry captions — this component frames, it does not describe.
 *
 * Performance: pure presentation, no client boundary and nothing animated.
 */
export function Figure({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className={EVIDENCE_SPACING}>
      <div className={EVIDENCE_FRAME}>{children}</div>
      {caption ? (
        <figcaption className="mt-3 max-w-[var(--width-prose)] text-sm text-ink-tertiary">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
