import { EVIDENCE_FRAME, EVIDENCE_SPACING } from "@/components/mdx/prose";

/**
 * DecisionLog — "decisions over stacks": each entry names the choice, the
 * rejected alternatives, the reason, and the cost accepted (CONTENT_MODEL §1/§6).
 * One white card, hairline-divided rows, a mono label per field.
 *
 * Shares the evidence rhythm and frame (EVIDENCE_*) with figures and code
 * blocks, so the blocks in one article read as one device.
 * A11y: an ordered list of decisions; each is a description list.
 */
export type Decision = {
  choice: string;
  alternatives: string[];
  reason: string;
  tradeoff: string;
};

const FIELD = "font-mono text-label uppercase text-ink-tertiary";

export function DecisionLog({ decisions }: { decisions: Decision[] }) {
  return (
    <ol className={`${EVIDENCE_SPACING} ${EVIDENCE_FRAME} divide-y divide-border`}>
      {decisions.map((d) => (
        <li key={d.choice} className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-8">
          <div>
            <p className="text-title-sm text-ink">{d.choice}</p>
            <p className="mt-1.5 text-sm text-ink-tertiary">Instead of: {d.alternatives.join(", ")}</p>
          </div>
          <dl className="grid gap-3 text-sm leading-relaxed text-ink-secondary">
            <div>
              <dt className={FIELD}>Why</dt>
              <dd className="mt-0.5">{d.reason}</dd>
            </div>
            <div>
              <dt className={FIELD}>Trade-off accepted</dt>
              <dd className="mt-0.5">{d.tradeoff}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
