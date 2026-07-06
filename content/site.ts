/**
 * Homepage + about copy. Structured content (hero, field notes, principles)
 * lives here rather than in a parsed .md — a pragmatic divergence documented in
 * CLAUDE.md. Every number carries its method (in the linked case study).
 */

export const home = {
  metaLine: "Mubin Attar · AI/ML Engineer · Ahmedabad, India",
  headline: "I build grounded AI systems — and show how they actually work.",
  lede:
    "GenAI/ML engineer, four live products. I don't ship screenshots — I take the systems apart: the architecture, the decisions I rejected, and the numbers, every one linked to how it was measured.",
  availability: "Open to AI/ML roles — remote or Ahmedabad, India.",
  // A single quiet fact line — the facts survive; the hollow stat cards don't.
  facts: ["4 live products", "shipping AI since 2022", "$0 free-tier stack"],

  // The interactive architecture centerpiece framing (the flagship is pulled
  // from content/projects.ts; this is just the section's voice).
  architecture: {
    kicker: "The flagship, taken apart",
    title: "Inside DBWhisper",
    invite:
      "A natural-language-to-SQL agent that reads your database safely. Every box is a real decision — hover to trace the flow, click one to see what I rejected, why, and what it cost.",
  },

  // Field notes — real entries from the build. Numbers are genuine (method in
  // the linked case study). This is "how I think", not a stat wall.
  fieldNotes: [
    {
      n: "01",
      kicker: "on honest metrics",
      title: "I replaced a 68% accuracy claim with 65%.",
      body: "CrownWager inherited a model that reported ~68% — but it was “best of 300 random splits,” picked after the fact. I rewrote training to one fixed split plus 5-fold stratified cross-validation. The honest number is 65.2% ± 0.8% on 15,115 games. Lower, and real.",
      tag: { value: "65.2% ± 0.8%", label: "5-fold CV · 15,115 games" },
      href: "/work/crownwager",
    },
    {
      n: "02",
      kicker: "on safety",
      title: "“Less often” is not a safety property.",
      body: "A better prompt makes an LLM emit a destructive query less often — never never. So in DBWhisper every generated statement passes a deterministic validator first: SELECT-only, single statement, enrolled tables only. It fails closed — it refuses when it can’t prove the query is safe.",
      tag: { value: "fail-closed", label: "refuses rather than risks" },
      href: "/work/dbwhisper",
    },
    {
      n: "03",
      kicker: "on proof",
      title: "I let a test scramble the future to prove the past couldn’t see it.",
      body: "Look-ahead bias silently inflates every backtest. TradePulse decides on closed bars and fills on the next bar’s open — so a canary test multiplies all future bars by 3× and asserts the past equity curve is byte-identical. If any look-ahead leaks in, the build fails.",
      tag: { value: "byte-identical", label: "past equity under a scrambled future" },
      href: "/work/tradepulse",
    },
  ],

  principles: [
    {
      title: "Evidence over demos",
      body: "Every number is genuinely computed. If a number can’t be shared, I describe the mechanism and say so — I never invent one.",
    },
    {
      title: "Safety is structural, not statistical",
      body: "When an action can do damage, I put a deterministic gate in front of it that the model cannot talk its way past — and fail closed, refusing when safety can’t be proven.",
    },
    {
      title: "Constraints force good engineering",
      body: "A $0 stack rules out waste: retrieval-scoped prompts, bounded agent loops, lean containers. The limits shaped the design from the start.",
    },
  ],
} as const;

export const about = {
  headline: "Solo engineer, real products.",
  body: [
    "I'm an AI/ML engineer with 3+ years building and shipping production AI end to end — GenAI/LLM applications, agentic and RAG systems, and predictive ML. I work across the stack: FastAPI, Next.js, Postgres, and Docker, with auth, CI/CD, and security hardening baked in.",
    "By day I build healthcare-AI automation at Sevina Technologies — clinical-compliance and reimbursement pipelines (constrained by HIPAA, so shown here only in the abstract). On my own time I ship live AI products on a $0 free-tier stack, which forces discipline: no waste, real engineering, shipped.",
    "The one rule across all of it: every number a user sees is genuinely computed — never faked.",
  ],
} as const;
