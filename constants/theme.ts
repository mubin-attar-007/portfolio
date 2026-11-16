/**
 * The browser-chrome colour of each theme: each theme's `--color-bg`
 * (styles/tokens.css), so the address bar and an installed shortcut's splash
 * continue the page. Read by the `theme-color` meta tag (app/layout.tsx), the
 * theme toggle that rewrites it (components/features/theme-toggle.tsx), and the
 * web manifest (app/manifest.ts).
 *
 * Literals, not `var()`: these values leave CSS — a meta tag and a JSON
 * manifest cannot read a custom property — so a palette change updates them in
 * the same change (design-system.md §11.1). `scripts/smoke.mjs` asserts both
 * against the rendered page, and test/icons.test.mts against tokens.css.
 */
export const BROWSER_CHROME = { light: "#fcfcfe", dark: "#03080a" } as const;

/** A site theme: light by default, dark only as a remembered choice. */
export type Theme = keyof typeof BROWSER_CHROME;
