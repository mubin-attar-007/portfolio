/**
 * The flagship case-study model: Bench Discovery, CareLTC and SignFlow, the
 * three products built at Sevina Technologies that the company approved for
 * publication by name (owner, 17 Nov 2026; SignFlow 18 Nov 2026). Every string here renders on a page, in the
 * assistant's index or in llms.txt, so the disclosure scan covers this folder.
 *
 * Approved for publication: the names Sevina Technologies, Bench Discovery,
 * CareLTC and SignFlow; the usage figures (exact wording, `USAGE` in ./shared.ts);
 * screenshots and recordings of the real apps running with dummy data; curated
 * code excerpts; the AWS services the products run on. Never published:
 * production repositories, URLs, hostnames, account or resource identifiers,
 * regions, and real client or facility names.
 */

export type FlagshipSlug = "bench-discovery" | "careltc" | "signflow";

// ---------------------------------------------------------------------------
// The architecture sketch (an original boundary diagram, drawn in HTML)
// ---------------------------------------------------------------------------

/** One boundary zone of a sketch, with its parts in data-flow order. */
export type SketchZone = {
  /** States the boundary in words: "Windows PC · documents stay here". */
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

/** One step of "How it works": a request or a run, followed through the sketch. */
export type TraceStep = { title: string; body: string; focus: SketchFocus };

// ---------------------------------------------------------------------------
// The record: constraints, what was built, where it runs, what broke
// ---------------------------------------------------------------------------

export type Constraint = { constraint: string; forced: string; checked: string };

/** The icon a "What I built" group carries, by what it is. */
export type BuiltIcon = "desktop" | "cloud" | "mobile" | "api" | "portal" | "docs";

export type BuiltGroup = { title: string; icon: BuiltIcon; items: readonly string[] };

export type BoundaryRow = {
  data: string;
  direction: "stays" | "leaves" | "enters";
  /** The two ends, in words: "PC only", "API → phone". */
  path: string;
  rule: string;
};

export type DeploymentCard = { title: string; body: string };

export type Incident = {
  /** A stable anchor ("ios-session"): never shared between products. */
  id: string;
  title: string;
  broke: string;
  cause: string;
  change: string;
  guard: string;
};

export type Decision = { choice: string; instead: string; reason: string; tradeoff: string };

// ---------------------------------------------------------------------------
// Figures, media and the engineering showcase
// ---------------------------------------------------------------------------

/**
 * A headline figure in the hero. `source` says where its method lives: the
 * usage figures are the ones the company approved (`USAGE`), every other
 * figure is a test count described in the Verification section.
 */
export type Figure = { value: string; label: string; source: "approved-usage" | "verification" };

/**
 * The frame a capture is shown in, by its real surface: a web app in a
 * browser, the desktop app as its own window, the mobile app on a phone, and
 * a document the app wrote as a sheet of paper.
 */
export type FrameKind = "browser" | "window" | "phone" | "page";

/** One screenshot of the real app, running with dummy data. */
export type Screenshot = {
  /** Under /public, e.g. "/showcase/careltc/portal-live-status.webp". */
  src: string;
  width: number;
  height: number;
  /** What the screen shows, for a reader who cannot see it. */
  alt: string;
  /** The gallery's short name for it ("Live floor status"). */
  title: string;
  /** What the screen proves: the caption under the frame. */
  proves: string;
  frame: FrameKind;
};

/** One tab of the product tour (Desktop | Web, Portal | Mobile). */
export type GalleryTab = { id: string; label: string; shots: readonly Screenshot[] };

/** A span of a recording and what it shows: the caption track and the text alternative. */
export type Scene = { start: number; end: number; text: string };

/** A screen recording of the real app (silent; its scenes are its text alternative). */
export type Recording = {
  id: string;
  /** The surface it shows, as a tab names it ("Desktop app"). */
  label: string;
  title: string;
  /** The .webm, its poster (.webp) and its caption track (.vtt), under /public. */
  src: string;
  poster: string;
  captions: string;
  width: number;
  height: number;
  /** Seconds. */
  duration: number;
  frame: "browser" | "window";
  /** The video's accessible name. */
  alt: string;
  summary: string;
  scenes: readonly Scene[];
};

/**
 * A highlight card's illustration: decorative (the card's text carries the
 * meaning) and still at rest; it plays its moment while the card is hovered or
 * holds focus (ADR-018 §5).
 */
export type HighlightArt =
  /** Terminal lines: the spinner turns, then the check pops. */
  | { kind: "terminal"; running: string; done: string }
  /** Checks that pop in sequence. */
  | { kind: "checks"; items: readonly string[] }
  /** A short timeline that lights in sequence: broke → cause → fix. */
  | { kind: "timeline"; items: readonly [string, string, string] }
  /** Nodes joined by wires that pulse; `hot` is the node that matters. */
  | { kind: "flow"; nodes: readonly string[]; hot: number }
  /** Labelled bars that fill (`value` 0–100: the bar's length, not a measurement). */
  | { kind: "bars"; items: readonly { label: string; value: number }[]; note: string }
  /** A question and a cited reply that rises. */
  | { kind: "reply"; question: string; answer: string; cite: string }
  /** A status badge whose halo spreads. */
  | { kind: "badge"; title: string; lines: readonly string[] };

export type Highlight = {
  id: string;
  title: string;
  body: string;
  art: HighlightArt;
  /** Two bento columns instead of one. */
  wide?: boolean;
};

/** A curated, sanitised excerpt of production code, with its story. */
export type CodeExcerpt = {
  id: string;
  title: string;
  /** Two sentences: the problem it answers and what the code does about it. */
  story: string;
  /** A generic label, never a private path ("mobile/nfc/ios-session.ts"). */
  file: string;
  lang: "csharp" | "python" | "ts";
  code: string;
};

/** The AWS services the products run on, spelled once (`AWS` in ./shared.ts). */
export type AwsService =
  | "Amazon ECS"
  | "AWS Fargate"
  | "Amazon ECR"
  | "Application Load Balancer"
  | "Amazon RDS for PostgreSQL"
  | "Amazon S3"
  | "Amazon CloudFront"
  | "Amazon Cognito"
  | "AWS KMS"
  | "AWS Secrets Manager"
  | "AWS Systems Manager Parameter Store"
  | "Amazon CloudWatch"
  | "AWS CloudTrail"
  | "AWS CloudFormation"
  | "Amazon VPC"
  | "AWS IAM"
  | "AWS STS";

export type StackGroup = { label: string; items: readonly string[] };

/**
 * What the product is built with: the technology by layer, and the AWS
 * services it is hosted on. Typed so the skills page and the résumé can reuse it.
 */
export type FlagshipStack = { groups: readonly StackGroup[]; aws: readonly AwsService[] };

/** A test suite's result, as counted or run, with how. */
export type TestSuite = { value: string; label: string; method: string };

// ---------------------------------------------------------------------------
// The case study
// ---------------------------------------------------------------------------

export type Flagship = {
  slug: FlagshipSlug;
  /** The product's public name (the approved spelling: "CareLTC"). */
  name: string;
  /** The product statement: the page's h1. */
  headline: string;
  /** The lead, and the search description (50–160 characters). */
  summary: string;
  /** One line, for cards, menus and social cards. */
  definition: string;
  /** Who it is for, in a few words ("Long-term care operations"). */
  domain: string;
  /** The last date this record was checked against the product (ISO). */
  updated: string;
  /**
   * The owner's credit, word for word, present tense: the only attribution the
   * page makes. Work is never attributed by git history and no colleague is
   * named (owner, 17 Nov 2026). The hero pairs it with `AGENT_DIRECTION`.
   */
  credit: { role: string };
  /** The hero's figures row. Usage figures only in the approved wording. */
  figures: readonly Figure[];
  problem: { body: readonly string[]; users: readonly string[] };
  constraints: readonly Constraint[];
  constraintsNote: string;
  built: readonly BuiltGroup[];
  /** The primary sketch, which "How it works" steps through. */
  sketch: Sketch;
  /** Further sketches for the architecture section (Bench Discovery's cloud side). */
  moreSketches: readonly Sketch[];
  trace: readonly TraceStep[];
  boundary: readonly BoundaryRow[];
  deployment: readonly DeploymentCard[];
  incidents: readonly Incident[];
  decisions: readonly Decision[];
  verification: {
    suites: readonly TestSuite[];
    checks: readonly string[];
    notMeasured: readonly string[];
  };
  outcome: { proves: readonly string[]; notShown: readonly string[] };
  highlights: readonly Highlight[];
  excerpts: readonly CodeExcerpt[];
  /** The hero's composition: the main capture and the one layered over it. */
  hero: { primary: Screenshot; secondary: Screenshot; caption: string };
  gallery: readonly GalleryTab[];
  recordings: readonly Recording[];
  stack: FlagshipStack;
  /** The cards on / and /work: one line of what it does, and its technology. */
  card: { body: string; tech: string };
};
