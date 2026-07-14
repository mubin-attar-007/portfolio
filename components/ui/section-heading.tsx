import type { ReactNode } from "react";

/**
 * SectionHeading — an xs mono kicker over a section heading (DESIGN §3).
 * Props: `kicker` (mono label), `as` (h2|h3, default h2), `id`, children.
 * A11y: renders a real heading element; the kicker is decorative text above it.
 */
export function SectionHeading({
  kicker,
  as: Tag = "h2",
  id,
  children,
}: {
  kicker?: string;
  as?: "h2" | "h3";
  id?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {kicker ? (
        <span className="font-mono text-xs uppercase text-ink-tertiary">{kicker}</span>
      ) : null}
      <Tag id={id} className={Tag === "h2" ? "text-4xl text-ink sm:text-5xl" : "text-2xl text-ink sm:text-3xl"}>
        {children}
      </Tag>
    </div>
  );
}
