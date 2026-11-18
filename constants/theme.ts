/**
 * The browser-chrome colour of each page surface, so the address bar and an
 * installed shortcut's splash continue the page.
 *
 * - `light` is the canvas (`--color-bg`, styles/tokens.css): the site default,
 *   read by the root layout's `theme-color` and the web manifest (app/manifest.ts).
 * - `dark` is the dark-surface canvas (`--color-plate-deep`): a dark page
 *   (/about, /evals, the 404 — the pages that render `<DarkSurface>`) can export
 *   `viewport = { themeColor: BROWSER_CHROME.dark }` so its address bar matches.
 *
 * The site has one theme. These are surfaces, not modes: nothing here is a
 * visitor preference.
 *
 * Literals, not `var()`: these values leave CSS — a meta tag and a JSON
 * manifest cannot read a custom property — so a palette change updates them in
 * the same change. test/icons.test.mts checks `light` against tokens.css.
 */
export const BROWSER_CHROME = { light: "#f7f7f8", dark: "#0f0f12" } as const;

/** A page surface: the light canvas, or a dark page. */
export type Surface = keyof typeof BROWSER_CHROME;
