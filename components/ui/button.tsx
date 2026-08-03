import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

/**
 * Button — primary / secondary / ghost. design-system.md §7.
 * - primary: accent fill + the one tactile shadow (--shadow-btn). ONE per viewport.
 * - secondary: transparent fill + hairline border.
 * - ghost: text + underline-on-hover
 * Sizes are the site's control heights: 32 / 36 / 44px.
 * Focus ring is the global :focus-visible token. For link-buttons, spread
 * `buttonVariants(...)` onto a `next/link` `<Link className>`.
 * A11y: renders a real <button>; provide an accessible label via children/aria.
 * The five states — default / hover / active / focus-visible / disabled — plus a
 * `loading` prop (aria-busy + spinner, also disables the control).
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent shadow-[var(--shadow-btn)] hover:bg-accent-hover",
  secondary:
    "border border-border-strong bg-transparent text-ink hover:border-ink",
  ghost: "text-ink underline decoration-transparent underline-offset-4 hover:decoration-current",
};

export function buttonVariants(variant: Variant = "primary", size: Size = "md"): string {
  // Tactile: all state changes on the one ease-out curve; a small press on :active.
  return `inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-[color,background-color,border-color,box-shadow,translate,opacity] duration-base ease-[var(--ease-out)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]}`;
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
