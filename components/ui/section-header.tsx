import type { ReactNode } from "react";
import { cx } from "./cx";
import { Kicker } from "./kicker";

/**
 * SectionHeader — a band's header (prototype `.head`): kicker → h2 → lead →
 * the band's forward link or actions, held to 640px.
 *
 * Props:
 * - `kicker`, `kickerTone` — the line above (`cyan` reads only on dark plates).
 * - `title` — the heading text. `as` picks `h2` (default) or `h3` by outline.
 * - `size` — `lg` (default, the 28 → 40px section h2) or `sm` (the 26 → 32px
 *   Careers-style h2, weight 600).
 * - `lead` — one supporting paragraph (17px, secondary ink).
 * - `align` — `start` (default) or `center` (the dark plates centre theirs).
 * - `id` — anchor on the heading, for `aria-labelledby` on the section.
 * - `children` — the forward affordance: a `CaretLink size="md"` or buttons.
 *
 * Every colour adapts on dark plates (violet kicker, plate inks).
 * A11y: a real heading at the level asked for; the kicker is plain text.
 */
export function SectionHeader({
  kicker,
  kickerTone = "accent",
  title,
  as: Tag = "h2",
  size = "lg",
  lead,
  align = "start",
  id,
  className,
  children,
}: {
  kicker?: string;
  kickerTone?: "accent" | "cyan" | "ink";
  title: ReactNode;
  as?: "h2" | "h3";
  size?: "lg" | "sm";
  lead?: ReactNode;
  align?: "start" | "center";
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={cx(
        "flex max-w-[var(--width-head)] flex-col",
        centered && "mx-auto items-center text-center",
        className,
      )}
    >
      {kicker ? (
        <Kicker tone={kickerTone} className="mb-4">
          {kicker}
        </Kicker>
      ) : null}
      <Tag id={id} className={cx(size === "lg" ? "text-section" : "text-sub", "text-ink")}>
        {title}
      </Tag>
      {lead ? <p className="mt-[18px] text-lead text-ink-secondary">{lead}</p> : null}
      {children ? (
        <div className={cx("mt-[22px] flex flex-wrap items-center gap-x-5 gap-y-3", centered && "justify-center")}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
