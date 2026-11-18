import type { CSSProperties } from "react";
import { TECH_LOGOS, type TechLogo } from "@/components/icons/tech-logos";

/** A tool's brand mark, when the site has one (components/icons/tech-logos.ts); otherwise its caller shows a monogram. */
export const techLogo = (name: string): TechLogo | undefined => TECH_LOGOS[name];

/** WCAG relative luminance of a six-digit hex colour. */
function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Below this luminance a brand colour disappears on a plate (Next.js, Vercel, Django), so it shows white there. */
const TOO_DARK_FOR_A_PLATE = 0.05;

/**
 * TechMark — a tool's brand mark as an inline SVG in `currentColor` (grey at
 * rest, as its container sets it), carrying its colours for a hover state:
 * `--brand`, and `--brand-on-dark` for a plate (white where the brand colour
 * is too dark to show). Only ever beside the tool's name, never alone or as a
 * badge (design-system §11.5).
 * A11y: decorative (`aria-hidden`); the name beside it says what it is.
 */
export function TechMark({ logo, size = 20, className }: { logo: TechLogo; size?: number; className?: string }) {
  const style = {
    "--brand": `#${logo.hex}`,
    "--brand-on-dark": luminance(logo.hex) < TOO_DARK_FOR_A_PLATE ? "#ffffff" : `#${logo.hex}`,
  } as CSSProperties;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden="true" focusable="false">
      <path d={logo.path} fill="currentColor" />
    </svg>
  );
}
