import { Check } from "lucide-react";
import { home } from "@/content/site";

/**
 * HeroTerminal — a calm, static terminal showing a representative DBWhisper
 * request (retrieve → validate → read-only SQL). Presentational; copy comes
 * from content/site.ts (Law 3). Gives the hero a focal point without motion
 * or a fabricated benchmark. A11y: <figure> with a caption; no interactivity.
 */
export function HeroTerminal() {
  const d = home.heroDemo;
  return (
    <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs text-ink-tertiary">{d.app}</span>
        <span className="rounded-[var(--radius-sm)] border border-border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-ink-tertiary">
          {d.badge}
        </span>
      </div>
      <div className="px-4 py-4 font-mono text-xs leading-relaxed">
        <div className="flex gap-2">
          <span className="text-accent" aria-hidden>
            ▸
          </span>
          <span className="text-ink">{d.prompt}</span>
        </div>
        <div className="mt-3 flex flex-col gap-0.5 text-ink-tertiary">
          {d.steps.map((s) => (
            <div key={s}>{s}</div>
          ))}
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre text-ink-secondary">{d.sql.join("\n")}</pre>
        <div className="mt-3 flex items-center gap-1.5 text-ink">
          <Check size={13} strokeWidth={2} className="text-positive" aria-hidden />
          <span>{d.result}</span>
        </div>
      </div>
      <figcaption className="border-t border-border px-4 py-2 font-mono text-[0.7rem] text-ink-tertiary">
        {d.note}
      </figcaption>
    </figure>
  );
}
