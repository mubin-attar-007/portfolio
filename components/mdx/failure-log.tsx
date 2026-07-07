/**
 * FailureLog — "failures earn trust": the v1→v2 arc of a real problem, its
 * metric value at each version (bad values in negative colour, the resolved
 * value in positive), and the cause/fix (CONTENT_MODEL §1/§6). Quiet vertical
 * feel. A11y: value colour is paired with the version label + cause/fix text.
 */
export type FailureEntry = {
  version: string;
  metric: string;
  value: string;
  cause?: string;
  fix?: string;
};

export function FailureLog({ entries }: { entries: FailureEntry[] }) {
  return (
    <div className="my-6 flex flex-col gap-5 border-l-[length:var(--stripe-width)] border-border-strong pl-5">
      {entries.map((e, i) => {
        const tone =
          i === 0 ? "text-negative" : i === entries.length - 1 ? "text-positive" : "text-ink";
        return (
          <div key={i} className="grid gap-1.5 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-ink">{e.version}</span>
              <span className={`font-mono text-sm tabular-nums ${tone}`}>{e.value}</span>
              <span className="text-sm text-ink-secondary">{e.metric}</span>
            </div>
            <div className="text-sm text-ink-secondary">
              {e.cause ? (
                <p>
                  <span className="font-mono text-xs uppercase text-ink-tertiary">Cause</span> — {e.cause}
                </p>
              ) : null}
              {e.fix ? (
                <p className="mt-1">
                  <span className="font-mono text-xs uppercase text-ink-tertiary">Fix</span> — {e.fix}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
