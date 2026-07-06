import type { ReactNode } from "react";

/**
 * Figure — framed content (diagram, screenshot, table) with a caption.
 * DESIGN §3/§6: border, radius-lg, caption. A11y: <figure>/<figcaption>;
 * images inside must carry meaningful alt.
 */
export function Figure({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="my-6">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-ink-tertiary">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
