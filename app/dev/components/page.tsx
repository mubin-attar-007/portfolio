import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { WorkSubnav } from "@/components/layout/work-subnav";
import { Marquee, MarqueeGroup } from "@/components/motion/marquee";
import { Float } from "@/components/motion/float";
import { PulseRings } from "@/components/motion/pulse-rings";
import { DotBand, Frame, RuleX } from "@/components/ui/blueprint";
import { BoundaryMark } from "@/components/ui/boundary-mark";
import { BrowserFrame } from "@/components/ui/browser-frame";
import { Button } from "@/components/ui/button";
import { Bento, Card, CardArt, CardBody } from "@/components/ui/card";
import { CaretLink } from "@/components/ui/caret-link";
import { Chip } from "@/components/ui/chip";
import { CircuitArt } from "@/components/ui/circuit-art";
import { DottedGuides, DottedRule } from "@/components/ui/dotted-guides";
import { Kicker } from "@/components/ui/kicker";
import { Label } from "@/components/ui/label";
import { Metric, MetricsTable } from "@/components/ui/metric";
import { PageHeader } from "@/components/ui/page-header";
import { Plate } from "@/components/ui/plate";
import { SectionHeader } from "@/components/ui/section-header";
import { StatsRow } from "@/components/ui/stats-row";
import { StatusPill } from "@/components/ui/status-pill";
import { StickySteps } from "@/components/ui/sticky-steps";
import { Timeline, TimelineEntry } from "@/components/ui/timeline";
import { Toc, type TocItem } from "@/components/ui/toc";
import { Callout } from "@/components/ui/callout";
import { CodeBlock } from "@/components/ui/code-block";
import { DecisionLog } from "@/components/mdx/decision-log";
import { STATUS_PILL, type PillStatus } from "@/config/site";

/**
 * A preview route, not a page of the site (ADR-007): noindex, no canonical, no
 * social card. Every figure and date is a deliberately impossible fixture.
 */
export const metadata: Metadata = {
  title: "Components",
  description: "The component preview: every primitive in its states, with fixture data only.",
  robots: { index: false, follow: false },
  alternates: null,
  openGraph: null,
};

const SECTIONS: readonly TocItem[] = [
  { id: "type", label: "Type and headers" },
  { id: "controls", label: "Buttons and links" },
  { id: "pills", label: "Pills and chips" },
  { id: "cards", label: "Cards and plates", items: [{ id: "plate", label: "Plate" }] },
  { id: "blueprint", label: "Blueprint devices" },
  { id: "motion", label: "Motion" },
  { id: "frames", label: "Frames and steps" },
  { id: "record", label: "Timeline and stats" },
  { id: "content", label: "Content blocks" },
];

const PILLS = Object.keys(STATUS_PILL) as PillStatus[];

function Row({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-border py-12">
      <h2 id={id} className="mb-8 text-sub">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="grid h-56 w-full place-items-center bg-bg-subtle text-sm text-ink-secondary">{label}</div>
  );
}

export default function ComponentsPage() {
  return (
    <>
      <WorkSubnav current="dbwhisper" />
      <Section space="head">
        <PageHeader
          kicker="Preview"
          title="Components"
          lede="Every primitive in its states. Fixture data only: every figure here is impossible on purpose (999, 0.000), so none can be mistaken for a result."
        >
          <Button variant="violet" href="/evals" caret>
            Real results
          </Button>
        </PageHeader>
      </Section>
      <Container className="grid gap-12 pb-24 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <Row id="type" title="Type and headers">
            <div className="grid gap-8">
              <div className="flex flex-wrap items-center gap-6">
                <Kicker>Kicker</Kicker>
                <Label>Mono label</Label>
                <Label tone="tertiary">Tertiary label</Label>
              </div>
              <SectionHeader kicker="Section" title="A section header" lead="One supporting sentence under the heading.">
                <CaretLink href="/work" size="md">
                  All work
                </CaretLink>
              </SectionHeader>
              <SectionHeader as="h3" size="sm" title="The small Careers-style heading" align="center" />
            </div>
          </Row>

          <Row id="controls" title="Buttons and links">
            <div className="grid gap-6">
              {(["sm", "md", "lg"] as const).map((size) => (
                <div key={size} className="flex flex-wrap items-center gap-3">
                  <Button variant="violet" size={size} caret>
                    Violet
                  </Button>
                  <Button variant="dark" size={size} caret>
                    Dark
                  </Button>
                  <Button variant="grey" size={size}>
                    Grey
                  </Button>
                  <Button variant="light" size={size}>
                    Light
                  </Button>
                  <Button variant="ghost" size={size}>
                    Ghost
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="dark" disabled>
                  Disabled
                </Button>
                <CaretLink href="/writing">Read the writing</CaretLink>
                <CaretLink href="/now" tone="muted" weight="regular">
                  Muted
                </CaretLink>
                <CaretLink href="/evals" tone="accent">
                  Accent
                </CaretLink>
                <CaretLink href="https://github.com/mubin-attar-007">GitHub</CaretLink>
              </div>
            </div>
          </Row>

          <Row id="pills" title="Pills and chips">
            <div className="grid gap-5">
              <div className="flex flex-wrap gap-2">
                {PILLS.map((status) => (
                  <StatusPill key={status} status={status} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip>Outline</Chip>
                <Chip variant="soft">Soft</Chip>
                <Chip variant="raised" dot>
                  Raised with dot
                </Chip>
                <Chip variant="raised" size="md" mono>
                  › A sample question
                </Chip>
              </div>
            </div>
          </Row>

          <Row id="cards" title="Cards and plates">
            <Bento columns={2}>
              <Card>
                <CardArt>
                  <Chip variant="raised" size="md">
                    Art
                  </Chip>
                </CardArt>
                <CardBody>
                  <h3>A light card</h3>
                  <p>Hover lifts the shadow and the art leans in.</p>
                  <div className="mt-4 flex gap-4">
                    <CaretLink href="/work/dbwhisper">Case study</CaretLink>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <h3>Text only</h3>
                  <p>A card without art pins its body to the bottom.</p>
                </CardBody>
              </Card>
            </Bento>
          </Row>
        </div>
        <aside className="hidden lg:block">
          <Toc items={SECTIONS} />
        </aside>
      </Container>

      <Plate labelledBy="plate">
        <SectionHeader id="plate" kicker="Plate" align="center" title="A notched dark plate" lead="Cards, pills and links inside read the plate ramp by themselves.">
          <CaretLink href="/work" size="md">
            All work
          </CaretLink>
        </SectionHeader>
        <Bento className="mt-16">
          <Card span={2}>
            <CardArt>
              <StatusPill status="in-use" />
            </CardArt>
            <CardBody>
              <h3>A dark card</h3>
              <p>Same component, plate tokens.</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3>Status on dark</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill status="pilot" />
                <StatusPill status="retired" />
              </div>
            </CardBody>
          </Card>
        </Bento>
      </Plate>

      <Container className="pb-24">
        <Row id="blueprint" title="Blueprint devices">
          <Frame padded className="py-10">
            <p className="text-ink-secondary">A frame with rules at both edges.</p>
          </Frame>
          <RuleX className="my-8" />
          <DotBand />
          <div className="relative mt-16 overflow-x-clip pt-40">
            <DottedGuides />
            <div className="relative z-10 rounded-[var(--radius-lg)] bg-surface p-10 shadow-[var(--shadow-card)]">
              <DottedRule />
              <p className="text-ink-secondary">Dotted guides behind a card.</p>
            </div>
          </div>
          <div className="relative mt-10 h-72 overflow-hidden rounded-[var(--radius-xl)] bg-surface">
            <CircuitArt />
            <p className="relative p-8 text-ink-secondary">Circuit art, centred fade.</p>
          </div>
        </Row>

        <Row id="motion" title="Motion">
          <MarqueeGroup label="Sample questions">
            <Marquee duration={40} fade={false}>
              {["What has he shipped?", "How is SQL kept safe?", "Where can he work from?", "Show the evals"].map((q) => (
                <Chip key={q} variant="raised" size="md" mono>
                  {q}
                </Chip>
              ))}
            </Marquee>
            <Marquee duration={32} delay={-9} reverse fade={false}>
              {["Which result was retired?", "How are agents directed?", "Is travel possible?"].map((q) => (
                <Chip key={q} variant="raised" size="md" mono>
                  {q}
                </Chip>
              ))}
            </Marquee>
          </MarqueeGroup>
          <div className="relative mt-10 grid h-64 place-items-center">
            <PulseRings size={96} radius={26} />
            <Float>
              <span className="grid h-24 w-24 place-items-center rounded-[26px] bg-surface text-accent shadow-[var(--shadow-card)]">
                <BoundaryMark size={36} />
              </span>
            </Float>
          </div>
        </Row>

        <Row id="frames" title="Frames and steps">
          <BrowserFrame url="example.app">
            <Placeholder label="Footage · illustrative sample · synthetic data" />
          </BrowserFrame>
          <StickySteps
            className="mt-16"
            label="How it works"
            steps={[
              { title: "Read the question", body: "The first step, in words.", media: <Placeholder label="Step one" /> },
              { title: "Check it", body: "The second step, in words.", media: <Placeholder label="Step two" /> },
              { title: "Answer with a source", body: "The third step, in words.", media: <Placeholder label="Step three" /> },
            ]}
          />
        </Row>

        <Row id="record" title="Timeline and stats">
          <StatsRow
            stats={[
              { label: "Fixture A", value: "999", source: { label: "Method", href: "/evals" } },
              { label: "Fixture B", value: "0.000" },
              { label: "Fixture C", value: "000" },
            ]}
          />
          <Timeline label="Fixture changelog" className="mt-16">
            <TimelineEntry date="Jan 1, 2099" dateTime="2099-01-01" title="A dated entry" tags={<StatusPill status="draft" />}>
              Entries sit on a rail; the date sticks while the entry scrolls.
            </TimelineEntry>
            <TimelineEntry date="Jan 1, 2098" dateTime="2098-01-01" title="An earlier entry">
              Fixture text.
            </TimelineEntry>
          </Timeline>
        </Row>

        <Row id="content" title="Content blocks">
          <div className="grid gap-8">
            <Metric label="fixture rate" before="99.9%" after="00.0%" method="Fixture value — not a measurement." />
            <MetricsTable rows={[{ label: "fixture", value: "999 ms", method: "Fixture value — not a measurement." }]} />
            <Callout variant="note">A note callout.</Callout>
            <CodeBlock filename="example.ts" lang="ts" code={`export const answer = 0;`} />
            <DecisionLog
              decisions={[
                { choice: "A fixture choice", alternatives: ["another"], reason: "Fixture reason.", tradeoff: "Fixture trade-off." },
              ]}
            />
          </div>
        </Row>
      </Container>
    </>
  );
}
