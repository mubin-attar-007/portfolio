import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { AuditLane } from "@/components/features/audit-lane";
import { PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import { SITE } from "@/config/site";
import { formatDate } from "@/lib/format";
import { evals, evalsIntro } from "@/content/evals";
import { home } from "@/content/site";
import type { EvalRow } from "@/content/schema";

export const metadata: Metadata = {
  title: "Evals",
  description:
    "The eval registry — how each system is measured, the method, and the honest current state.",
  alternates: { canonical: `${SITE.url}/evals` },
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs tabular-nums text-ink-tertiary ${
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

/* Table cells follow Clerk's table language (their pricing feature lists):
   quiet uppercase-mono column heads, uniform hairline row rules, and GENEROUS
   cell padding — py-5 rows are what make a data table read as designed rather
   than as a spreadsheet dropped on the page. */
const TH =
  "py-3 pr-5 font-mono text-xs font-normal uppercase tracking-[0.06em] text-ink-tertiary";
const TD = "py-5 pr-5 align-top";

/**
 * /evals — the eval registry. Opens with the shared `PageHeader` on an `aurora`
 * band like every other index route, and the REGISTRY itself is the first thing
 * in the body band — the same fold economy as Clerk's pricing page, where the
 * plans are visible inside the first viewport and the fine print sits under
 * them. The two method paragraphs (`evalsIntro.body`) follow the table: they
 * qualify the data, so they read as its footnote, not its gatekeeper — leading
 * with them was what pushed the table below the fold.
 */
export default function EvalsPage() {
  return (
    <>
      <Section space="lg" aurora className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={evalsIntro.kicker}
          title={evalsIntro.title}
          lede={evalsIntro.lede}
        />
      </Section>
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

      <Section space="md" className={PAGE_BODY_BAND}>
        {/* Mobile (< md): each eval as a stacked card so Result/Date/Notes never
          scroll off-screen. Desktop keeps the scannable table below. */}
        <ul className="reveal flex flex-col gap-4 md:hidden">
          {evals.map((e) => (
            <li
              key={`${e.system}-${e.benchmark}`}
              className="rounded-[var(--radius-md)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-ink">{e.system}</span>
                <Status status={e.status} result={e.result} />
              </div>
              <p className="mt-1 text-sm text-ink-secondary">{e.benchmark}</p>
              <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between gap-6">
                  <dt className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
                    Metric
                  </dt>
                  <dd className="text-right text-ink-secondary">{e.metric}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
                    Date
                  </dt>
                  <dd className="text-right font-mono text-xs text-ink-tertiary">
                    {e.date ? formatDate(e.date) : "—"}
                  </dd>
                </div>
              </dl>
              {e.note ? (
                <p className="mt-3 text-sm text-ink-secondary">
                  {e.note}
                  {e.link ? (
                    <span className="mt-1.5 block">
                      <ResultLink href={e.link}>method</ResultLink>
                    </span>
                  ) : null}
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="reveal hidden overflow-x-auto md:block">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <caption className="sr-only">
              Eval registry — system, method, metric, result, and date.
            </caption>
            <thead>
              {/* `border-border`, not `-strong`: Clerk's tables keep ONE hairline
                  weight everywhere and let the mono heads differentiate the row. */}
              <tr className="border-b border-border text-left">
                <th scope="col" className={TH}>
                  System
                </th>
                <th scope="col" className={TH}>
                  Benchmark / Method
                </th>
                <th scope="col" className={TH}>
                  Metric
                </th>
                <th scope="col" className={TH}>
                  Result
                </th>
                <th scope="col" className={TH}>
                  Date
                </th>
                <th scope="col" className={TH}>
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {evals.map((e) => (
                <tr
                  key={`${e.system}-${e.benchmark}`}
                  className="border-b border-border"
                >
                  <td
                    className={`${TD} whitespace-nowrap font-medium text-ink`}
                  >
                    {e.system}
                  </td>
                  <td className={`${TD} text-ink-secondary`}>{e.benchmark}</td>
                  <td className={`${TD} text-ink-secondary`}>{e.metric}</td>
                  <td className={TD}>
                    <Status status={e.status} result={e.result} />
                  </td>
                  <td
                    className={`${TD} whitespace-nowrap font-mono text-xs text-ink-tertiary`}
                  >
                    {e.date ? formatDate(e.date) : "—"}
                  </td>
                  <td className={`${TD} max-w-[32ch] text-ink-secondary`}>
                    {e.note}
                    {e.link ? (
                      <span className="mt-1.5 block">
                        <ResultLink href={e.link}>method</ResultLink>
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
