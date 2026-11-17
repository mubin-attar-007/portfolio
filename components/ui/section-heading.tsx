import type { ReactNode } from "react";
import { CaretLink } from "./caret-link";
import { SectionHeader } from "./section-header";

/**
 * @deprecated Use `SectionHeader`. This keeps the previous API working while
 * the pages that use it are rebuilt: `sub` becomes the lead, `size="compact"`
 * the small h2, and `link` a `CaretLink`.
 *
 * Props: `kicker`, `as`, `id`, `align`, `size` (`display` | `compact`), `sub`,
 * `link` ({ href, label, external }), `children` (the heading text).
 * A11y: as `SectionHeader` — a real heading; external links are announced.
 */
export function SectionHeading({
  kicker,
  as = "h2",
  id,
  align = "start",
  size = "display",
  sub,
  link,
  children,
}: {
  kicker?: string;
  as?: "h2" | "h3";
  id?: string;
  align?: "start" | "center";
  size?: "display" | "compact";
  sub?: ReactNode;
  link?: { href: string; label: string; external?: boolean };
  children: ReactNode;
}) {
  return (
    <SectionHeader
      kicker={kicker}
      as={as}
      id={id}
      align={align}
      size={size === "compact" || as === "h3" ? "sm" : "lg"}
      lead={sub}
      title={children}
    >
      {link ? (
        <CaretLink href={link.href} size="md" newTab={link.external}>
          {link.label}
        </CaretLink>
      ) : null}
    </SectionHeader>
  );
}
