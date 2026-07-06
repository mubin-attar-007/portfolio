/**
 * Homepage + about copy. Structured content (hero, proof strip, principles)
 * lives here rather than in a parsed .md — a pragmatic divergence documented in
 * CLAUDE.md. Every proof metric carries a method.
 */

export const home = {
  metaLine: "Mubin Attar · AI/ML Engineer · Ahmedabad, India",
  headline: "I build grounded AI systems — and show how they actually work.",
  lede:
    "GenAI/ML engineer. Four live products — real architecture, real numbers. Every metric on this page links to how it was measured.",
  availability: "Open to AI/ML roles — remote or Ahmedabad, India.",
  proof: [
    { value: "4", label: "live AI products", method: "Each links to a running deployment and its source." },
    { value: "3+", label: "years shipping", method: "Building and shipping AI/ML since 2022." },
    { value: "$0", label: "infra cost", method: "Free-tier stack: Vercel + Hugging Face Spaces + Neon Postgres." },
  ],
  principles: [
    {
      title: "Evidence over demos",
      body: "Every number is genuinely computed. If a number can't be shared, I describe the mechanism and say so — I never invent one.",
    },
    {
      title: "Safety is structural, not statistical",
      body: "When an action can do damage, I put a deterministic gate in front of it that the model cannot talk its way past — and fail closed, refusing when safety can't be proven.",
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
