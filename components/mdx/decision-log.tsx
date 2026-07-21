import { EVIDENCE_SPACING } from "@/components/mdx/prose";

/**
 * DecisionLog — the case-study primitive that carries "decisions over stacks":
 * each row names the choice, the rejected alternatives, the reason, and the
 * cost accepted (CONTENT_MODEL §1/§6). Table-like, hairline rows, generous
 * padding, no zebra, no coloured headers. A11y: a description list per decision.
 *
 * Shares the one evidence rhythm (EVIDENCE_SPACING) with figures, code blocks,
 * callouts and pull quotes, so a reader scanning a case study meets a single
 * vertical cadence instead of each block breathing to its own value.
 */
export type Decision = {
  choice: string;
  alternatives: string[];
  reason: string;
  tradeoff: string;
};

export function DecisionLog({ decisions }: { decisions: Decision[] }) {
  return (
    <div className={`${EVIDENCE_SPACING} divide-y divide-border border-y border-border`}>
      {decisions.map((d, i) => (
        <div key={i} className="grid gap-3 py-5 md:grid-cols-[1fr_1.5fr] md:gap-8">
          <div>
            <p className="font-medium text-ink">{d.choice}</p>
            <p className="mt-1 text-sm text-ink-tertiary">Instead of: {d.alternatives.join(", ")}</p>
          </div>
          <div className="text-sm text-ink-secondary">
            <p>{d.reason}</p>
            <p className="mt-2">
              <span className="font-mono text-xs uppercase text-ink-tertiary">Trade-off accepted</span>{" "}
              — {d.tradeoff}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
