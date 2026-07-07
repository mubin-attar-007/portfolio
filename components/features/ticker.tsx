import { home } from "@/content/site";

/**
 * Ticker — a slow horizontal marquee of the tech stack (the engineering-honest
 * take on Clerk's moving logo strip). Pure CSS animation (no JS); the edges fade
 * via a mask; motion pauses under prefers-reduced-motion. A11y: the moving strip
 * is decorative (aria-hidden); a visually-hidden list carries the real content.
 */
export function Ticker() {
  const items = home.stack;
  return (
    <div className="border-y border-border bg-bg-subtle py-3.5">
      <div className="ticker-mask overflow-hidden">
        <ul className="ticker-track flex w-max items-center gap-x-9" aria-hidden>
          {[...items, ...items].map((item, i) => (
            <li key={i} className="flex items-center gap-x-9">
              <span className="font-mono text-sm text-ink-secondary">{item}</span>
              <span className="h-1 w-1 rounded-full bg-border-strong" />
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">Tech stack: {items.join(", ")}.</p>
    </div>
  );
}
