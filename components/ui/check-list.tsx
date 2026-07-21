import { CircleCheck } from "lucide-react";

/**
 * One checklist row: a short affirmative label, and optionally the sentence of
 * substance that backs it. The body is what keeps this from being a badge wall
 * (DESIGN §9) — a claim with its mechanism attached is evidence; a claim on its
 * own is decoration.
 */
export type CheckListItem = { label: string; body?: string };

/**
 * CheckList — the checklist that sits under the copy in a split feature: a small
 * circled check per row, a bold label, and an optional muted line beneath it.
 *
 * Props:
 * - `items` — the rows. `label` is the guarantee; `body` (optional) is the one
 *   sentence that says how it is actually enforced.
 * - `className` — layout only (margins); never colour or type.
 *
 * A11y: a real `<ul>`/`<li>`, so the count and the boundaries are announced
 * without help. The icons are therefore `aria-hidden` — the list semantics
 * already carry "this is a set of items", and a screen reader announcing
 * "circle check" three times would be pure noise. Nothing here depends on colour
 * to be understood: the label is the meaning, the icon is a bullet with a shape.
 *
 * Colour: the icon is deliberately NOT accent. On the bands this device runs in,
 * the accent budget (DESIGN §9 — at most two accent elements per viewport) is
 * already spent by the kicker and the forward link, and three more accent marks
 * would push the band into marketing. The check reads as a bullet glyph, which
 * is all it needs to be.
 *
 * Performance: pure server component, no state, nothing animated.
 */
export function CheckList({
  items,
  className = "",
}: {
  items: readonly CheckListItem[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-col gap-5 ${className}`}>
      {items.map((item) => (
        // A two-track grid rather than a flex row: the icon column stays a fixed
        // width, so every label starts on the same optical line even when a row
        // wraps to two lines.
        <li key={item.label} className="grid grid-cols-[auto_1fr] gap-x-3">
          <CircleCheck
            size={18}
            strokeWidth={1.75}
            aria-hidden
            // `mt-px` optically seats the circle on the label's cap height —
            // baseline-aligning an icon to text leaves it looking high.
            className="mt-px shrink-0 text-ink-tertiary"
          />
          <div>
            <p className="text-base font-medium text-ink">{item.label}</p>
            {item.body ? <p className="mt-1.5 text-sm text-ink-secondary">{item.body}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
