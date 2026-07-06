"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle — switches light/dark by setting `data-theme` on <html> and
 * persisting to localStorage. Light is the default/brand; this is a preference.
 * Props: none. A11y: labelled button; icon reflects the *action*, updates on
 * toggle. SSR renders a stable placeholder (Moon) to avoid hydration mismatch;
 * the real state resolves after mount. The no-flash pre-paint script lives in layout.
 */
type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const current: Theme =
      stored === "dark" || stored === "light"
        ? stored
        : (document.documentElement.getAttribute("data-theme") as Theme | null) ??
          (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    // one-time read of the persisted/OS theme on mount (not a cascading render)
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
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-ink-secondary transition-colors hover:text-ink"
    >
      {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
    </button>
  );
}
