"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle — switches light/dark by setting `data-theme` on <html> and
 * persisting the choice to localStorage.
 *
 * LIGHT is the default; dark is an explicit, remembered preference. The OS
 * `prefers-color-scheme` is deliberately never consulted.
 *
 * SSR renders the light-state icon — matching the `data-theme="light"` the server
 * puts on <html> — so there is no hydration mismatch, and the pre-paint script
 * in the layout has already corrected the attribute for a returning visitor
 * before this component mounts.
 *
 * It also rewrites <meta name="theme-color">, because that tag is static
 * metadata keyed to the DEFAULT theme: without this, a visitor who switches to
 * light keeps a near-black address bar above a white page. The layout comment
 * explains why the tag cannot be a prefers-color-scheme pair.
 *
 * A11y: a labelled button whose icon shows the ACTION (sun = go light), with
 * `aria-pressed` reflecting the current state and a title for pointer users.
 */
type Theme = "light" | "dark";

/** The `--color-bg` of each theme — the address bar continues the page. */
const CHROME: Record<Theme, string> = { light: "#fcfcfe", dark: "#03080a" };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // The layout has already applied the stored preference before paint.
    // Reading the DOM also works when browser policy blocks localStorage.
    const current: Theme =
      document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", CHROME[current]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", CHROME[next]);
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage policy must not prevent changing the current page's theme.
    }
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={label}
      title={label}
      className="icon-btn inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-ink-secondary hover:text-ink"
    >
      {isDark ? (
        <Sun size={16} strokeWidth={1.6} aria-hidden />
      ) : (
        <Moon size={16} strokeWidth={1.6} aria-hidden />
      )}
    </button>
  );
}
