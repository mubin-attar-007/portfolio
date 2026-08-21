import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

/**
 * Button — the site's four control treatments.
 *
 * - `primary`   accent fill, an inset top highlight and a close contact shadow.
 *               ONE per viewport. The highlight is what makes a flat fill read
 *               as a raised, pressable plane rather than a coloured rectangle.
 * - `secondary` white surface, hairline ring, faint elevation. The companion
 *               action — it must be clearly subordinate at a glance and still
 *               look like a real control, which an outline alone does not.
 * - `subtle`    a filled neutral chip for tertiary actions on a busy surface
 *               (toolbars, card footers) where a ring would add a third line.
 * - `ghost`     text with an underline that resolves on hover.
 *
 * Sizes are the site's control heights: 32 / 38 / 44px. `lg` is the 44px touch
 * minimum, so a primary action rendered at `lg` is always tappable.
 *
 * For link-buttons spread `buttonVariants(...)` onto a `next/link` className.
 *
 * A11y: renders a real `<button>` with the global `:focus-visible` accent ring.
 * `loading` sets `aria-busy` and disables the control, so a second submit cannot
 * race the first. Motion is colour/shadow/translate only — the press is a single
 * pixel, which reads as tactile without becoming a bounce.
 */
type Variant = "primary" | "secondary" | "subtle" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-[0.8125rem]",
  md: "h-[2.375rem] gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-[0.9375rem]",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    // The accent gradient under white text, with the sheen sweep on hover. The
    // flat `bg-accent` stays as the paint-order fallback beneath the image, so
    // an engine that drops the gradient still renders a filled control.
    "btn-sheen bg-accent bg-[image:var(--gradient-accent)] text-on-accent shadow-[var(--shadow-btn)] hover:brightness-[1.06]",
  secondary:
    "border border-border-strong bg-surface text-ink shadow-[var(--shadow-sm)] hover:border-ink/25 hover:bg-surface-raised",
  subtle:
    "bg-bg-subtle text-ink hover:bg-border",
  ghost:
    "text-ink underline decoration-transparent underline-offset-[5px] hover:decoration-current",
};

export function buttonVariants(variant: Variant = "primary", size: Size = "md"): string {
  return [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] font-medium",
    "transition-[color,background-color,border-color,box-shadow,translate,opacity] duration-fast ease-[var(--ease-out)]",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    SIZES[size],
    VARIANTS[variant],
  ].join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      className={`${buttonVariants(variant, size)} ${className}`}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
