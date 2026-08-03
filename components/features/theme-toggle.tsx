"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle — switches light/dark by setting `data-theme` on <html> and
 * persisting to localStorage. Dark is the default/brand; light is a preference.
 * Props: none. A11y: labelled button; icon reflects the *action*, updates on
 * toggle. SSR renders a stable placeholder (Sun = the dark default) to avoid
 * hydration mismatch; the real state resolves after mount. The no-flash pre-paint
 * script lives in layout.
 */
type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const current: Theme =
      stored === "dark" || stored === "light"
        ? stored
        : ((document.documentElement.getAttribute("data-theme") as Theme | null) ?? "dark");
    // one-time read of the persisted theme (else the dark brand default) on
    // mount — we intentionally do NOT follow the OS scheme (dark is the brand)
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
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="icon-btn inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-ink-secondary hover:text-ink lg:h-9 lg:w-9"
    >
      {isDark ? (
        <Sun size={18} strokeWidth={1.5} aria-hidden />
      ) : (
        <Moon size={18} strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
}
