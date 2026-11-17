import type { ReactNode } from "react";
import { Chip } from "./chip";
import { Kicker } from "./kicker";

/**
 * @deprecated Use `Kicker` (the `text` register) or `Chip` (the `pill`). Kept
 * so pages written before the redesign keep rendering while they are rebuilt.
 *
 * `text` (default) is the violet kicker line; `pill` a raised chip with an
 * accent dot. A11y: presentational text; the heading it introduces carries
 * the outline.
 */
export function EyebrowChip({
  variant = "text",
  children,
}: {
  variant?: "pill" | "text";
  children: ReactNode;
}) {
  if (variant === "pill") {
    return (
      <Chip variant="raised" dot>
        {children}
      </Chip>
    );
  }
  return <Kicker>{children}</Kicker>;
}
