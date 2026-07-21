import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type AuditLaneItem = {
  label: string;
  href: string;
  value?: string;
};

type AuditLaneProps = {
  title: string;
  items: readonly AuditLaneItem[];
  /** Additional classes for outer section wrappers. */
  className?: string;
};

type StaggerStyle = CSSProperties & Record<"--i", number>;
function stagger(i: number): StaggerStyle {
  return { "--i": i };
}

const AUDIT_PILL =
  "group inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-1.5 font-mono text-xs text-ink-secondary transition-[color,background-color,border-color,transform] duration-base ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-border-strong hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

export function AuditLane({ title, items, className }: AuditLaneProps) {
  return (
    <section className={`reveal border border-border bg-surface ${className ?? ""}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-5 sm:py-3.5">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">{title}</p>
      </div>
      <div className="reveal-stagger flex flex-wrap gap-2 px-4 py-4 sm:px-5 sm:py-5">
        {items.map((item, i) => (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={`${AUDIT_PILL} reveal`}
            style={stagger(i + 1)}
            aria-label={item.value ? `${item.value} ${item.label}` : item.label}
          >
            {item.value ? <span className="mr-1.5 text-ink-tertiary">{item.value}</span> : null}
            <span>{item.label}</span>
            <ArrowRight
              size={13}
              strokeWidth={2}
              aria-hidden
              className="transition-transform duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
