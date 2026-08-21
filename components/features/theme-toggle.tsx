"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle — switches light/dark by setting `data-theme` on <html> and
 * persisting the choice to localStorage.
 *
 * LIGHT is the brand default; dark is an explicit, remembered preference. The OS
 * `prefers-color-scheme` is deliberately never consulted (ADR-011), so this
 * button is the only thing that can move the site off light.
 *
 * SSR renders the light-state icon — matching the `data-theme="light"` the
 * server puts on <html> — so there is no hydration mismatch, and the pre-paint
 * script in the layout has already corrected the attribute for a returning
 * visitor before this component mounts.
 *
 * A11y: a labelled button whose icon shows the ACTION (moon = go dark), with
 * `aria-pressed` reflecting the current state and a title for pointer users.
 */
type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const current: Theme =
      stored === "dark" || stored === "light"
        ? stored
        : ((document.documentElement.getAttribute("data-theme") as Theme | null) ?? "light");
    // One-time read of the persisted theme (else the light brand default) on
    // mount — we intentionally do NOT follow the OS scheme.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
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
      className="icon-btn inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] text-ink-secondary hover:text-ink lg:h-9 lg:w-9"
    >
      {isDark ? (
        <Sun size={17} strokeWidth={1.6} aria-hidden />
      ) : (
        <Moon size={17} strokeWidth={1.6} aria-hidden />
      )}
    </button>
  );
}
