import type { ReactNode } from "react";

/**
 * Callout — bg-subtle with a 3px left border. Variants set only the border
 * colour (note = accent, caution = warning, plain = ink). No required icon
 * (DESIGN §3). A11y: `role="note"`; caution uses text, never colour alone.
 */
type Variant = "note" | "caution" | "plain";

const BORDER: Record<Variant, string> = {
  note: "border-l-accent",
  caution: "border-l-warning",
  plain: "border-l-ink",
};

export function Callout({
  variant = "plain",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <div
      role="note"
      className={`rounded-[var(--radius-sm)] border-l-[3px] bg-bg-subtle px-4 py-3 text-ink-secondary ${BORDER[variant]}`}
    >
      {children}
    </div>
  );
}
