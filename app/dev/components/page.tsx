import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { SectionHeading } from "@/components/ui/section-heading";
import { Metric, MetricsTable } from "@/components/ui/metric";
import { Figure } from "@/components/ui/figure";
import { PullQuote } from "@/components/ui/pull-quote";
import { CodeBlock } from "@/components/ui/code-block";
import { DecisionLog } from "@/components/mdx/decision-log";
import { FailureLog } from "@/components/mdx/failure-log";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import type { DiagramSpec } from "@/components/diagrams/types";

/**
 * A preview route, not a page of the site (ADR-007): no canonical and no social
 * card (`null` clears the root defaults), and noindex. robots.txt also disallows
 * /dev/, so a crawler that obeys it never reads this tag.
 */
export const metadata: Metadata = {
  title: "Components",
  description: "The component preview: every primitive in its states, with fixture data only.",
  robots: { index: false, follow: false },
  alternates: null,
  openGraph: null,
};

/** This site's assistant, as it ships (ADR-006, spec/AI_ASSISTANT.md). */
const ASSISTANT: DiagramSpec = {
  nodes: [
    { id: "ui", label: "Assistant panel", sublabel: "client", description: "Sends the visitor's question, with the recent turns, to the route.", col: 0, row: 1 },
    { id: "api", label: "Route handler", sublabel: "/api/chat", description: "Rate-limits and screens the request, then retrieves before any model call (Node.js runtime).", col: 1, row: 1 },
    { id: "index", label: "BM25 index", sublabel: "in memory", description: "Site content split into passages and indexed at module load. No embeddings, no vector DB.", col: 2, row: 0 },
    { id: "llm", label: "Gemini", sublabel: "grounded", description: "Answers only from the retrieved passages and cites them. Without a key or quota, the route serves the best FAQ answer instead.", col: 2, row: 2 },
  ],
  edges: [
    { from: "ui", to: "api", label: "question" },
    { from: "api", to: "index", label: "top-k" },
    { from: "api", to: "llm", label: "passages" },
  ],
};

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-12">
      <p className="mb-6 font-mono text-xs uppercase text-ink-tertiary">{title}</p>
      {children}
    </section>
  );
}

export default function ComponentsPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl text-ink">Components</h1>
      <p className="mt-3 max-w-[var(--width-prose)] text-ink-secondary">
        Every primitive in every state, both themes. Toggle the theme in the header. This route is
        noindex and hidden from production nav.
      </p>
      {/* noindex is not the same as private — this URL is publicly fetchable. On
          a site whose whole argument is that no number is invented, a gallery
          full of realistic-looking metrics is a liability, so every value below
          is deliberately impossible (999, 000, xx). */}
      <p className="mt-4 max-w-[var(--width-prose)] rounded-[var(--radius-md)] border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-ink">
        <strong className="font-medium">Fixture data.</strong> Every figure and date on this page is
        a deliberately impossible placeholder chosen so it can never be mistaken for a measured
        result. Real metrics live on{" "}
        <Link href="/evals" prefetch={false} className="link-underline text-accent">
          /evals
        </Link>
        .
      </p>

      <Row title="Buttons (buttonVariants)">
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className={buttonVariants("primary")}>
            Primary
          </button>
          <button type="button" className={buttonVariants("secondary")}>
            Secondary
          </button>
          <button type="button" className={buttonVariants("subtle")}>
            Subtle
          </button>
          <button type="button" className={buttonVariants("ghost")}>
            Ghost
          </button>
          <button type="button" className={buttonVariants("primary")} disabled>
            Disabled
          </button>
        </div>
      </Row>

      <Row title="Callouts">
        <div className="flex flex-col gap-3">
          <Callout variant="note">A note — the accent-bordered variant, used sparingly.</Callout>
          <Callout variant="caution">A caution — meaning carried by the word, not colour alone.</Callout>
          <Callout variant="plain">A plain aside.</Callout>
        </div>
      </Row>

      <Row title="Section heading">
        <SectionHeading kicker="How I think">Decisions over stacks</SectionHeading>
      </Row>

      <Row title="Metrics">
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <Metric label="review time per assessment" before="999 min" after="000 min" direction="down-good" method="Fixture value — not a measurement. See /evals for real results." />
          <Metric label="false-positive rate" before="99.9%" after="00.0%" direction="down-good" method="Fixture value — not a measurement. See /evals for real results." />
          <Metric label="cost per run" after="$0.0000" direction="down-good" method="Fixture value — not a measurement. See /evals for real results." />
        </div>
        <div className="mt-8">
          <MetricsTable
            rows={[
              { label: "p95 latency", value: "999 ms", method: "Fixture value — not a measurement." },
              { label: "throughput", value: "0,000 rows/s", method: "Fixture value — not a measurement." },
              { label: "monthly cost", value: "$9.999", method: "Fixture value — not a measurement." },
            ]}
          />
        </div>
      </Row>

      <Row title="Decision log">
        <DecisionLog
          decisions={[
            {
              choice: "A deterministic rules engine, not an LLM, for validation",
              alternatives: ["LLM-as-judge", "hybrid rules + LLM"],
              reason:
                "The rules are enumerable and auditors need reproducibility; per-call cost at daily volume is unjustifiable.",
              tradeoff: "Rule-maintenance burden; slower to cover novel edge cases.",
            },
            {
              choice: "An in-memory BM25 index, not a vector DB",
              alternatives: ["Pinecone", "pgvector"],
              reason:
                "The corpus fits in memory many times over, and lexical retrieval runs the same in the route and in a plain node --test run.",
              tradeoff: "Matching depends on shared vocabulary; the index is rebuilt per server instance.",
            },
          ]}
        />
      </Row>

      <Row title="Failure log">
        <FailureLog
          entries={[
            { version: "v1", metric: "fixture rate", value: "99.9%", cause: "fixture — not a measured cause" },
            { version: "v2", metric: "fixture rate", value: "00.0%", fix: "fixture — not a measured fix" },
          ]}
        />
      </Row>

      <Row title="Code block (Shiki)">
        <CodeBlock
          filename="lib/format.ts"
          lang="ts"
          code={`export function deltaTone(before: string | undefined, after: string, direction: MetricDirection): DeltaTone {\n  if (before == null) return "neutral";\n  const b = parseMetricNumber(before);\n  const a = parseMetricNumber(after);\n  if (b == null || a == null || b === a) return "neutral";\n  return (a > b) === (direction === "up-good") ? "positive" : "negative";\n}`}
        />
      </Row>

      <Row title="Figure">
        <Figure caption="Figure 1 — a framed figure with a caption (synthetic data only).">
          <div className="grid place-items-center bg-bg-subtle p-10 text-sm text-ink-tertiary">
            [ figure content ]
          </div>
        </Figure>
      </Row>

      <Row title="Pull quote (serif, essays only)">
        <PullQuote cite="Project charter">
          The site should disappear; the work remains.
        </PullQuote>
      </Row>

      <Row title="System diagram (keyboard-navigable)">
        <SystemDiagram spec={ASSISTANT} caption="This site's assistant — arrow-key or hover to trace the flow." />
      </Row>
    </Container>
  );
}
