import type { ReactNode } from "react";

/**
 * Callout — an aside inside prose: a white card with the card hairline and a
 * small mono label naming its kind. Variants set the label and the label's dot
 * colour (note = violet, caution = amber, plain = none). No icon
 * (design-system.md §11.4).
 *
 * A11y: `role="note"`; the kind is stated in text, so colour is never the only
 * signal.
 */
type Variant = "note" | "caution" | "plain";

const LABEL: Record<Variant, { text: string; dot: string } | null> = {
  note: { text: "Note", dot: "bg-accent" },
  caution: { text: "Caution", dot: "bg-warning" },
  plain: null,
};

export function Callout({
  variant = "plain",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  const label = LABEL[variant];
  return (
    <div
      role="note"
      className="my-8 max-w-[var(--width-prose)] rounded-[var(--radius-lg)] bg-surface px-5 py-4 text-ink-secondary shadow-[var(--shadow-card)] [&>p:first-of-type]:mt-0"
    >
      {label ? (
        <p className="mb-2 flex items-center gap-2 font-mono text-label uppercase text-ink">
          <span aria-hidden="true" className={`size-1.5 rounded-full ${label.dot}`} />
          {label.text}
        </p>
      ) : null}
      {children}
    </div>
  );
}
