/** Typed architecture-diagram data (ADR-005). Nodes are placed on a col/row grid. */
export type DiagramNode = {
  id: string;
  label: string;
  sublabel?: string;
  /** one sentence: what it does and why it exists — doubles as the text alternative */
  description: string;
  col: number;
  row: number;
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
