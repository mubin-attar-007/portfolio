import type { ButtonHTMLAttributes } from "react";

/**
 * Button — primary / secondary / ghost. DESIGN §3.
 * - primary: accent fill, moulded shadow (--shadow-btn carries the inset top
 *   highlight), optional leading glyph. ONE primary per viewport.
 * - secondary: surface fill + hairline border + --shadow-sm — a real raised
 *   control, not an outline. (Clerk's secondary reads as a white key, not a
 *   ghost; a transparent fill loses the pairing when it sits beside a primary.)
 * - ghost: text + underline-on-hover
 * Sizes are Clerk's measured control heights: 32 / 36 / 44px.
 * Focus ring is the global :focus-visible token. For link-buttons, spread
 * `buttonVariants(...)` onto a `next/link` `<Link className>` — and drop in
 * `<ButtonGlyph />` as the first child if the CTA wants the glyph.
 * A11y: renders a real <button>; provide an accessible label via children/aria.
 * The glyph is decorative and hidden from assistive tech.
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

const VARIANTS: Record<Variant, string> = {
  // `sheen` sends one highlight pass across the fill on hover (globals.css) —
  // material catching light, not a loop. Motion-gated there, so reduced-motion
  // users get the colour change alone.
  primary: "sheen bg-accent text-on-accent shadow-[var(--shadow-btn)] hover:bg-accent-hover",
  // border + shadow-sm deliberately stack: --shadow-sm's 0.5px ring sits OUTSIDE
  // the hairline, which is the layered edge that makes the key look pressed out
  // of the page rather than drawn on it.
  secondary:
    "border border-border bg-surface text-ink shadow-[var(--shadow-sm)] hover:border-border-strong hover:bg-bg-subtle",
  ghost: "text-ink underline decoration-transparent underline-offset-4 hover:decoration-current",
};

export function buttonVariants(variant: Variant = "primary", size: Size = "md"): string {
  // Tactile: all state changes on Clerk's curve; a small press on :active.
  return `inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-[color,background-color,border-color,box-shadow,translate,opacity] duration-base ease-[var(--ease-out)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]}`;
}

/**
 * ButtonGlyph — the small solid play-triangle Clerk puts ahead of a primary CTA
 * label. Decorative only (aria-hidden): it adds forward momentum, it never
 * carries meaning, so it is safe to omit. Sized in the spacing scale and filled
 * with `currentColor`, so it inherits the button's text colour in every tone.
 */
export function ButtonGlyph() {
  return (
    <svg
      viewBox="0 0 8 10"
      fill="currentColor"
      className="size-2 shrink-0"
      aria-hidden
      focusable="false"
    >
      <path d="M0 0l8 5-8 5z" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  glyph = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Show the leading play-glyph. Primary only — it reads as noise on a key that isn't leading. */
  glyph?: boolean;
}) {
  return (
    <button className={`${buttonVariants(variant, size)} ${className}`} {...props}>
      {glyph && variant === "primary" ? <ButtonGlyph /> : null}
      {children}
    </button>
  );
}
