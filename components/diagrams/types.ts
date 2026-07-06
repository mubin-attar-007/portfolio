/** The real engineering decision behind a node — revealed on hover/click. */
export type NodeDecision = {
  /** the alternative(s) NOT chosen */
  rejected?: string;
  /** why this was chosen (grounded in the real system) */
  why?: string;
  /** the honest cost of the choice */
  tradeoff?: string;
};

/** Typed architecture-diagram data (ADR-005). Nodes are placed on a col/row grid. */
export type DiagramNode = {
  id: string;
  label: string;
  sublabel?: string;
  /** one sentence: what it does and why it exists — doubles as the text alternative */
  description: string;
  col: number;
  row: number;
  /** optional: the real decision this node embodies (drives the interactive reveal) */
  decision?: NodeDecision;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  /** dashed = fallback / conditional path */
  dashed?: boolean;
};

export type DiagramSpec = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};
