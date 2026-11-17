import { EVIDENCE_FRAME, EVIDENCE_SPACING } from "@/components/mdx/prose";

/**
 * FailureLog — "failures earn trust": the v1→v2 arc of a real problem, its
 * metric value at each version (the first value in negative colour, the
 * resolved one in positive), and the cause and fix (CONTENT_MODEL §1/§6). One
 * white card; the versions run down a hairline rail with a dot per version.
 *
 * A11y: an ordered list; the value's colour always sits beside the version
 * label and the cause/fix text, so it is never the only signal.
 */
export type FailureEntry = {
  version: string;
  metric: string;
  value: string;
  cause?: string;
  fix?: string;
};

const FIELD = "font-mono text-label uppercase text-ink-tertiary";

export function FailureLog({ entries }: { entries: FailureEntry[] }) {
  return (
    <ol className={`${EVIDENCE_SPACING} ${EVIDENCE_FRAME} grid gap-5 p-5`}>
      {entries.map((e, i) => {
        const first = i === 0;
        const last = i === entries.length - 1 && !first;
        const tone = first ? "text-negative" : last ? "text-positive" : "text-ink";
        const dot = first ? "bg-negative" : last ? "bg-positive" : "bg-border-strong";
        return (
          <li key={`${e.version}-${i}`} className="relative grid gap-1.5 pl-6 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-8">
            <span aria-hidden="true" className={`absolute top-[0.45rem] left-0 size-2 rounded-full ${dot}`} />
            {i < entries.length - 1 ? (
              <span aria-hidden="true" className="absolute top-5 -bottom-5 left-[3.5px] w-px bg-border" />
            ) : null}
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-sm text-ink">{e.version}</span>
              <span className={`font-mono text-sm tabular-nums ${tone}`}>{e.value}</span>
              <span className="text-sm text-ink-secondary">{e.metric}</span>
            </div>
            <div className="grid gap-1 text-sm leading-relaxed text-ink-secondary">
              {e.cause ? (
                <p>
                  <span className={FIELD}>Cause</span> {e.cause}
                </p>
              ) : null}
              {e.fix ? (
                <p>
                  <span className={FIELD}>Fix</span> {e.fix}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
