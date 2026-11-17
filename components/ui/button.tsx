import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Caret } from "./caret-link";
import { cx } from "./cx";
import { SmartLink } from "./smart-link";
import styles from "./button.module.css";

export type ButtonVariant = "violet" | "dark" | "grey" | "light" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * The class string of a button, for an element `Button` cannot render itself
 * (a `<label>`, a third-party control). Prefer `<Button>`.
 */
export function buttonClassName(variant: ButtonVariant = "dark", size: ButtonSize = "md"): string {
  return cx(styles.button, styles[variant], styles[size]);
}

type Common = {
  /** `violet` the one primary per view · `dark` the default action · `grey` secondary on dark plates · `light` white on any ground · `ghost` text that gains the pill on hover. */
  variant?: ButtonVariant;
  /** 28 · 32 · 40px tall. */
  size?: ButtonSize;
  /** Appends the arrow-swap caret (the "go" affordance). */
  caret?: boolean;
  className?: string;
  children: ReactNode;
};

type AsLink = Common &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children"> & {
    /** Renders a link: a route (`next/link`, no prefetch), a file, or another site. */
    href: string;
    /** Opens in a new tab (announced). */
    newTab?: boolean;
  };

type AsButton = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

export type ButtonProps = AsLink | AsButton;

/**
 * Button — the site's controls (prototype `.btn`): a lit gradient with a 1px
 * ring for `violet`, `dark` and `grey`, a white card for `light`, and the ghost
 * pill. A link when given `href`, otherwise a native `<button type="button">`.
 *
 * Variants: `violet` · `dark` · `grey` · `light` · `ghost`. Sizes: `sm` 28 ·
 * `md` 32 · `lg` 40px. `caret` appends the arrow-swap caret, which plays when
 * the button is hovered or focused.
 *
 * Motion: brightens on hover, squashes to 0.97 on press and springs back.
 * Reduced motion keeps the colour change and drops the travel.
 *
 * A11y: the native element's semantics; the global 2px violet focus ring; the
 * caret is decorative. A disabled `<button>` is dimmed and inert. White text
 * clears AA on every filled variant.
 * Performance: server-safe, no client JS.
 */
export function Button({ variant = "dark", size = "md", caret = false, className, children, ...element }: ButtonProps) {
  const classes = cx(buttonClassName(variant, size), className);
  const body = (
    <>
      {children}
      {caret ? <Caret /> : null}
    </>
  );

  if (isLink(element)) {
    const { href, newTab, ...anchor } = element;
    return (
      <SmartLink href={href} newTab={newTab} className={classes} {...anchor}>
        {body}
      </SmartLink>
    );
  }

  const { type = "button", ...button } = element;
  return (
    <button type={type} className={classes} {...button}>
      {body}
    </button>
  );
}

type ElementProps<T> = Omit<T, keyof Common>;

function isLink(props: ElementProps<AsLink> | ElementProps<AsButton>): props is ElementProps<AsLink> {
  return props.href !== undefined;
}

/** The four control treatments of the previous design system. */
type LegacyVariant = "primary" | "secondary" | "subtle" | "ghost";

const LEGACY: Record<LegacyVariant, ButtonVariant> = {
  primary: "violet",
  secondary: "light",
  subtle: "light",
  ghost: "ghost",
};

/**
 * @deprecated Use `<Button variant size>` (or `buttonClassName`). Kept so pages
 * written before the redesign render the new controls until they are rebuilt:
 * primary → violet, secondary and subtle → light, ghost → ghost.
 */
export function buttonVariants(variant: LegacyVariant = "primary", size: ButtonSize = "md"): string {
  return buttonClassName(LEGACY[variant], size);
}
