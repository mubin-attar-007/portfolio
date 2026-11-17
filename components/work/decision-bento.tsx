import type { DiagramSpec } from "@/components/diagrams/types";
import { Bento, Card, CardArt, CardBody } from "@/components/ui/card";
import styles from "./case-study.module.css";

/**
 * The fork illustration: the rejected path ends in a struck node, the chosen
 * path draws itself in violet when the card is hovered or focused.
 */
function ForkArt() {
  return (
    <svg viewBox="0 0 240 120" className={styles.fork} aria-hidden="true" focusable="false">
      <circle cx="28" cy="60" r="7" className={styles.forkOrigin} />
      <path d="M35 60H90C108 60 108 30 126 30H190" className={styles.forkRejectedPath} />
      <path d="M35 60H90C108 60 108 90 126 90H190" className={styles.forkBase} />
      <path d="M35 60H90C108 60 108 90 126 90H190" className={styles.forkChosen} pathLength={1} />
      <g className={styles.forkRejected}>
        <rect x="190" y="18" width="28" height="24" rx="6" />
        <path d="M199 25l10 10M209 25l-10 10" />
      </g>
      <g className={styles.forkPick}>
        <rect x="190" y="78" width="28" height="24" rx="6" />
        <path d="M198 90l4 4 8-8" />
      </g>
    </svg>
  );
}

/**
 * DecisionBento — the engineering decisions embodied in the architecture,
 * read from the diagram data (each node's why / instead-of / trade-off). Wide
 * cards close the last row, so the grid reads as a bento, not a list.
 */
export function DecisionBento({
  spec,
  labels,
}: {
  spec: DiagramSpec;
  labels: { rejected: string; tradeoff: string };
}) {
  const decided = spec.nodes.filter((n) => n.decision?.why);
  // Wide cards fill the last row: one wide card when a row is short by one,
  // the first and the last when it is short by two.
  const short = (3 - (decided.length % 3)) % 3;
  const wide = (i: number) => (short >= 1 && i === 0) || (short === 2 && i === decided.length - 1);
  return (
    <Bento columns={3} className={styles.decisions}>
      {decided.map((node, i) => (
        <Card key={node.id} span={wide(i) ? 2 : 1}>
          <CardArt>
            <ForkArt />
          </CardArt>
          <CardBody>
            {node.sublabel ? <p className={styles.decisionNode}>{node.sublabel}</p> : null}
            <h3>{node.label}</h3>
            <p>{node.decision?.why}</p>
            <dl className={styles.decisionFacts}>
              {node.decision?.rejected ? (
                <div>
                  <dt>{labels.rejected}</dt>
                  <dd>{node.decision.rejected}</dd>
                </div>
              ) : null}
              {node.decision?.tradeoff ? (
                <div>
                  <dt>{labels.tradeoff}</dt>
                  <dd>{node.decision.tradeoff}</dd>
                </div>
              ) : null}
            </dl>
          </CardBody>
        </Card>
      ))}
    </Bento>
  );
}
