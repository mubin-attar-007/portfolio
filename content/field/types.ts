import type { PillStatus } from "@/config/site";
import type { FieldWorkSlug } from "@/config/nav";

/**
 * The field-report model. A field report describes private work anonymously:
 * no organisation, product, facility, client, repository, provider or figure
 * that needs the owner's approval appears in any field of it. Every string
 * here renders on the page, so the disclosure scan covers this folder.
 */

/** One boundary zone of an architecture sketch, with its parts in data-flow order. */
export type SketchZone = {
  /** States the boundary in words, e.g. "Facility PC · documents stay here". */
  label: string;
  nodes: readonly string[];
};

/** A labelled crossing between two ADJACENT zones (`from` is the left one). */
export type SketchCrossing = {
  label: string;
  /** "forward" flows left → right; "back" flows right → left. */
  direction: "forward" | "back";
};

export type Sketch = {
  title: string;
  zones: readonly SketchZone[];
  /** `crossings[i]` sits between `zones[i]` and `zones[i + 1]`. */
  crossings: readonly SketchCrossing[];
  notes?: readonly string[];
};

/** Which part of the primary sketch a trace step lights up. */
export type SketchFocus = { zone: number; node?: number; crossing?: number };

export type TraceStep = { title: string; body: string; focus: SketchFocus };

export type Constraint = { constraint: string; forced: string; checked: string };

export type BuiltGroup = { title: string; items: readonly string[] };

export type BoundaryRow = {
  data: string;
  direction: "stays" | "leaves" | "enters";
  /** The two ends, in words: "PC only", "API → phone". */
  path: string;
  rule: string;
};

export type DeploymentCard = { title: string; body: string };

export type Incident = {
  id: string;
  title: string;
  broke: string;
  cause: string;
  change: string;
  guard: string;
};

export type Decision = { choice: string; instead: string; reason: string; tradeoff: string };

export type FieldReport = {
  slug: FieldWorkSlug;
  /** False until the owner signs the report off: draft ribbon, noindex, no feeds. */
  published: boolean;
  /** The anonymous product statement: the page's h1. */
  headline: string;
  /** A plain name for the system (breadcrumbs, metadata): never a product name. */
  name: string;
  domain: string;
  summary: string;
  pills: readonly { status: PillStatus; label: string }[];
  /** The approved credit line. */
  credit: string;
  problem: { body: readonly string[]; users: readonly string[] };
  constraints: readonly Constraint[];
  constraintsNote: string;
  built: readonly BuiltGroup[];
  /** "Built by others", kept generic. Empty when there is nothing to say. */
  others: readonly string[];
  /** How it was built (the approved agent-direction line). */
  howBuilt: string;
  sketch: Sketch;
  /** Further sketches shown in the architecture section (e.g. the cloud side). */
  moreSketches: readonly Sketch[];
  trace: readonly TraceStep[];
  boundary: readonly BoundaryRow[];
  deployment: readonly DeploymentCard[];
  incidents: readonly Incident[];
  decisions: readonly Decision[];
  verification: { checks: readonly string[]; notMeasured: readonly string[] };
  outcome: { proves: readonly string[]; notShown: readonly string[] };
  walkthrough: { covers: readonly string[]; staysPrivate: readonly string[] };
};
