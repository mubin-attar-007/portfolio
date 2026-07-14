import { home } from "@/content/site";

/**
 * SkillRotator — the honest take on Clerk's "trusted by" wall: no customer logos,
 * so we show the real stack behind four live products as a Clerk-style
 * hairline-celled grid, grouped by role (backend / AI / frontend / data) so it
 * reads as a composed SYSTEM, not a scrolling word-list. Static, server-rendered,
 * zero client JS. A11y: labelled column headings + tool lists; a visually-hidden
 * flat list carries the full stack for screen readers.
 * (Legacy name kept to avoid churn; rename to TechStack in the DS sweep.)
 */
export function SkillRotator() {
  return (
    <div className="border-y border-border bg-bg-subtle">
      <div className="mx-auto w-full max-w-[var(--width-container)] px-6 py-9 sm:px-8">
        <p className="text-sm text-ink-secondary">{home.stackLabel}</p>
        <div className="reveal mt-7 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-border">
          {home.stackGroups.map((g, i) => (
            <div key={g.label} className={i === 0 ? "sm:pr-6" : "sm:px-6"}>
              <p className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
                {g.label}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {g.items.map((t) => (
                  <li key={t} className="font-mono text-sm text-ink-secondary">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="sr-only">Tech stack: {home.stack.join(", ")}.</p>
    </div>
  );
}
