import type { ButtonHTMLAttributes } from "react";

/**
 * Button — primary / secondary / ghost. DESIGN §3.
 * - primary: accent bg, white text, no shadow (ONE primary per viewport)
 * - secondary: transparent, 1px border-strong, ink text
 * - ghost: text + underline-on-hover
 * Focus ring is the global :focus-visible token. For link-buttons, spread
 * `buttonVariants(...)` onto a `next/link` `<Link className>`.
 * A11y: renders a real <button>; provide an accessible label via children/aria.
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent shadow-[var(--shadow-btn)] hover:bg-accent-hover",
  secondary: "border border-border-strong text-ink hover:border-ink",
  ghost: "text-ink underline decoration-transparent underline-offset-4 hover:decoration-current",
};

export function buttonVariants(variant: Variant = "primary", size: Size = "md"): string {
  // Tactile: all state changes on Clerk's curve; a small press on :active.
  return `inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-[color,background-color,border-color,box-shadow,translate,opacity] duration-200 ease-[var(--ease-out)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={`${buttonVariants(variant, size)} ${className}`} {...props} />;
}
