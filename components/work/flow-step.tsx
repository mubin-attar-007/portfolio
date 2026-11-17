import type { DiagramNode, DiagramSpec } from "@/components/diagrams/types";
import { cx } from "@/components/ui/cx";
import styles from "./case-study.module.css";

type Neighbour = { node: DiagramNode; label?: string; dashed?: boolean };

/** The nodes wired into and out of one node, with the edge labels. */
function neighbours(spec: DiagramSpec, id: string): { inbound: Neighbour[]; outbound: Neighbour[] } {
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const pick = (other: string, label?: string, dashed?: boolean): Neighbour[] => {
    const node = byId.get(other);
    return node ? [{ node, label, dashed }] : [];
  };
  return {
    inbound: spec.edges.filter((e) => e.to === id).flatMap((e) => pick(e.from, e.label, e.dashed)),
    outbound: spec.edges.filter((e) => e.from === id).flatMap((e) => pick(e.to, e.label, e.dashed)),
  };
}

function Side({ items, label, align }: { items: Neighbour[]; label: string; align: "in" | "out" }) {
  return (
    <div className={cx(styles.flowSide, align === "out" && styles.flowSideOut)}>
      <p className={styles.flowLabel}>{label}</p>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={`${item.node.id}-${item.label ?? ""}`} data-dashed={item.dashed ? "" : undefined}>
              <span className={styles.flowNode}>{item.node.label}</span>
              {item.label ? <span className={styles.flowEdge}>{item.label}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.flowNone}>{align === "in" ? "Entry point" : "End of the path"}</p>
      )}
    </div>
  );
}

/**
 * FlowStep — the media pane for one "How it works" step: the part of the real
 * architecture in focus, with what it receives and what it hands on, read
 * straight from the diagram data. Dashed rows are fallback paths, as in the
 * full diagram. Decorative motion: the wires pulse while the pane is active.
 */
export function FlowStep({
  spec,
  id,
  fromLabel,
  toLabel,
}: {
  spec: DiagramSpec;
  id: string;
  fromLabel: string;
  toLabel: string;
}) {
  const node = spec.nodes.find((n) => n.id === id);
  if (!node) throw new Error(`FlowStep: no node "${id}" in this diagram.`);
  const { inbound, outbound } = neighbours(spec, id);
  return (
    <div className={styles.flow}>
      <Side items={inbound} label={fromLabel} align="in" />
      <span className={styles.flowWire} aria-hidden="true" />
      <div className={styles.flowFocus}>
        <span className={styles.flowFocusLabel}>{node.label}</span>
        {node.sublabel ? <span className={styles.flowFocusSub}>{node.sublabel}</span> : null}
      </div>
      <span className={styles.flowWire} aria-hidden="true" />
      <Side items={outbound} label={toLabel} align="out" />
    </div>
  );
}
