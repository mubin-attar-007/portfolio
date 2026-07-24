import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import { SITE } from "@/config/site";
import { formatDate } from "@/lib/format";
import { evals, evalsIntro } from "@/content/evals";
import type { EvalRow } from "@/content/schema";

export const metadata: Metadata = {
  title: "Evals",
  description:
    "The eval registry — how each system is measured, the method, and the honest current state.",
  alternates: { canonical: `${SITE.url}/evals` },
  openGraph: {
    siteName: SITE.name,
    title: "Evals — Mubin Attar",
    description:
      "The eval registry — how each system is measured, the method, and the honest current state.",
    url: `${SITE.url}/evals`,
    type: "website",
  },
};

/** Status pill — muted for in-progress/planned (never fake-green before a run). */
function Status({
  status,
  result,
}: {
  status: EvalRow["status"];
  result: string;
}) {
  if (status === "complete") {
    return (
      <span className="font-mono text-xs tabular-nums text-positive">
        {result}
      </span>
    );
  }
  const dashed = status === "planned";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 py-0.5 font-mono text-xs tabular-nums text-ink-tertiary ${
        dashed ? "border-dashed border-border-strong" : "border-border-strong"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary" aria-hidden />
      {result}
    </span>
  );
}

function ResultLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = /^https?:\/\//.test(href);
  const cls =
    "inline-flex items-center gap-1 font-mono text-xs text-ink-tertiary underline decoration-border-strong underline-offset-4 hover:text-accent hover:decoration-accent";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children} <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden />
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

const REGISTRY_GRID =
  "md:grid-cols-[minmax(6.5rem,0.85fr)_minmax(10rem,1.45fr)_minmax(8rem,1fr)_minmax(6.5rem,0.75fr)_minmax(5rem,0.6fr)_minmax(12rem,1.6fr)]";
const MOBILE_LABEL =
  "font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary md:hidden";

function evalId(e: EvalRow) {
  return `${e.system}-${e.benchmark}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * /evals — the eval registry. Opens with the shared `PageHeader`, and the
 * REGISTRY itself is the first thing
 * in the body band — the same fold economy as Clerk's pricing page, where the
 * plans are visible inside the first viewport and the fine print sits under
 * them. The two method paragraphs (`evalsIntro.body`) follow the table: they
 * qualify the data, so they read as its footnote, not its gatekeeper — leading
 * with them was what pushed the table below the fold.
 */
export default function EvalsPage() {
  return (
    <>
      <Section space="lg" className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={evalsIntro.kicker}
          title={evalsIntro.title}
          lede={evalsIntro.lede}
        />
      </Section>
      <Section space="md" className={PAGE_BODY_BAND}>
        {/* One responsive registry, not separate mobile and desktop DOM trees.
            Each claim now has one exact, stable hash target at the visible row. */}
        <div className="overflow-x-auto" role="table" aria-label="Evaluation registry">
          <div
            role="row"
            className={`${REGISTRY_GRID} hidden min-w-[60rem] border-b border-border py-3 text-left md:grid md:gap-5`}
          >
            {["System", "Benchmark / Method", "Metric", "Result", "Date", "Notes"].map(
              (label) => (
                <span
                  key={label}
                  role="columnheader"
                  className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary"
                >
                  {label}
                </span>
              ),
            )}
          </div>
          <ul role="rowgroup" className="divide-y divide-border border-y border-border md:border-t-0">
            {evals.map((e) => (
              <li
                key={`${e.system}-${e.benchmark}`}
                id={evalId(e)}
                role="row"
                className={`${REGISTRY_GRID} grid scroll-mt-28 gap-4 py-5 text-sm md:min-w-[60rem] md:gap-5`}
              >
                <div role="cell" className="flex items-center justify-between gap-4 md:block">
                  <span className="font-medium text-ink">{e.system}</span>
                  <span className="md:hidden">
                    <Status status={e.status} result={e.result} />
                  </span>
                </div>
                <div role="cell" className="text-ink-secondary">
                  <span className={MOBILE_LABEL}>Benchmark / method</span>
                  <p className="mt-1 md:mt-0">{e.benchmark}</p>
                </div>
                <div role="cell" className="text-ink-secondary">
                  <span className={MOBILE_LABEL}>Metric</span>
                  <p className="mt-1 md:mt-0">{e.metric}</p>
                </div>
                <div role="cell" className="hidden md:block">
                  <Status status={e.status} result={e.result} />
                </div>
                <div
                  role="cell"
                  className="font-mono text-xs text-ink-tertiary"
                >
                  <span className={MOBILE_LABEL}>Date</span>
                  <p className="mt-1 md:mt-0">{e.date ? formatDate(e.date) : "—"}</p>
                </div>
                <div role="cell" className="max-w-[32ch] text-ink-secondary">
                  <span className={MOBILE_LABEL}>Notes</span>
                  <p className="mt-1 md:mt-0">{e.note}</p>
                  {e.link ? (
                    <span className="mt-1.5 block">
                      <ResultLink href={e.link}>method</ResultLink>
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* The fine print — what counts as a measurement here. Below the data,
            the way Clerk's pricing page keeps its qualifiers under the plans. */}
        <hr className="rule-fade mt-16" />
        <div className="reveal mt-10 flex flex-col gap-4">
          {evalsIntro.body.map((p) => (
            <p
              key={p}
              className="max-w-[var(--width-prose)] text-ink-secondary"
            >
              {p}
            </p>
          ))}
        </div>
      </Section>
    </>
  );
}
