import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { AuditLane } from "@/components/features/audit-lane";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { SectionHeading } from "@/components/ui/section-heading";
import { home } from "@/content/site";
import { Metric, MetricsRow, MetricsTable } from "@/components/ui/metric";
import { Figure } from "@/components/ui/figure";
import { PullQuote } from "@/components/ui/pull-quote";
import { BeforeAfter } from "@/components/ui/before-after";
import { CodeBlock } from "@/components/ui/code-block";
import { DecisionLog } from "@/components/mdx/decision-log";
import { FailureLog } from "@/components/mdx/failure-log";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import type { DiagramSpec } from "@/components/diagrams/types";

export const metadata: Metadata = {
  title: "Components",
  robots: { index: false, follow: false },
};

const RAG: DiagramSpec = {
  nodes: [
    { id: "ui", label: "Web UI", sublabel: "Next.js", description: "The visitor's browser; sends the question to the edge API.", col: 0, row: 1 },
    { id: "api", label: "Edge API", sublabel: "/api/ask", description: "Embeds the query and retrieves before calling the model.", col: 1, row: 1 },
    { id: "index", label: "Static index", sublabel: "search-index.json", description: "Pre-embedded content chunks held in memory — no vector DB.", col: 2, row: 0 },
    { id: "llm", label: "Model", sublabel: "grounded", description: "Answers only from retrieved chunks, and cites them.", col: 2, row: 2 },
  ],
  edges: [
    { from: "ui", to: "api", label: "question" },
    { from: "api", to: "index", label: "top-k" },
    { from: "api", to: "llm", label: "context" },
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
      <AuditLane
        title="Audit lane"
        items={[
          ...home.proof.stats.map((stat) => ({
            href: stat.href,
            value: stat.value,
            label: stat.label,
          })),
          { href: "/trust", label: "trust policy" },
          { href: "/changelog", label: "changelog" },
        ]}
        className="mt-8"
      />

      <Row title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Row>

      <Row title="Tags">
        <div className="flex flex-wrap gap-2">
          <Tag>TypeScript</Tag>
          <Tag>FastAPI</Tag>
          <Tag>production</Tag>
        </div>
      </Row>

      <Row title="Card (quiet)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card as="article" className="group">
            <h3 className="text-xl text-ink transition-colors group-hover:text-accent">Card title</h3>
            <p className="mt-2 text-sm text-ink-secondary">
              Surface background, hairline border, no lift or glow. Hover shifts the border and the
              title to accent.
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-secondary">A plain quiet card.</p>
          </Card>
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
        <MetricsRow>
          <Metric label="review time per assessment" before="45 min" after="6 min" direction="down-good" method="Median wall-clock over 200 sampled assessments, v1 vs current." />
          <Metric label="false-positive rate" before="31%" after="11%" direction="down-good" method="On a 500-case labelled validation set." />
          <Metric label="cost per run" after="$0.0024" direction="down-good" method="Token + compute cost, averaged over a week of runs." />
        </MetricsRow>
        <div className="mt-8">
          <MetricsTable
            rows={[
              { label: "p95 latency", value: "214 ms", method: "1k requests, warm edge, synthetic data." },
              { label: "throughput", value: "1,204 rows/s", method: "Batch export benchmark, single worker." },
              { label: "monthly cost", value: "$0", method: "Free-tier stack; no paid infra." },
            ]}
          />
        </div>
      </Row>

      <Row title="Before / after">
        <BeforeAfter
          label="v1 → v2"
          before="Single-pass retrieval; 31% false positives on the validation set."
          after="Added a reranking pass; 11% false positives, same latency budget."
        />
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
              choice: "Build-time embeddings + a static index, not a vector DB",
              alternatives: ["Pinecone", "pgvector"],
              reason: "The corpus is under a thousand chunks; it fits in memory a hundred times over.",
              tradeoff: "Re-embed on every content change; migrate only if the corpus 100×s.",
            },
          ]}
        />
      </Row>

      <Row title="Failure log">
        <FailureLog
          entries={[
            { version: "v1", metric: "false-positive rate", value: "31%", cause: "single-pass retrieval, naive rule threshold" },
            { version: "v2", metric: "false-positive rate", value: "11%", fix: "added a reranking pass and rewrote the threshold rule" },
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
        <SystemDiagram spec={RAG} caption="A grounded RAG assistant — arrow-key or hover to trace the flow." />
      </Row>
    </Container>
  );
}
