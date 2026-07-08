import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";
import { formatDate } from "@/lib/format";
import { evals, evalsIntro } from "@/content/evals";
import type { EvalRow } from "@/content/schema";

export const metadata: Metadata = {
  title: "Evals",
  description:
    "The eval registry — how each system is measured, the method, and the honest current state.",
  alternates: { canonical: `${SITE.url}/evals` },
};

/** Status pill — muted for in-progress/planned (never fake-green before a run). */
function Status({ status, result }: { status: EvalRow["status"]; result: string }) {
  if (status === "complete") {
    return <span className="font-mono text-xs text-positive">{result}</span>;
  }
  const dashed = status === "planned";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs text-ink-tertiary ${
        dashed ? "border-dashed border-border-strong" : "border-border-strong"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary" aria-hidden />
      {result}
    </span>
  );
}

function ResultLink({ href, children }: { href: string; children: React.ReactNode }) {
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

const TH = "py-3 pr-5 font-mono text-xs font-normal uppercase tracking-[0.06em] text-ink-tertiary";
const TD = "py-4 pr-5 align-top";

export default function EvalsPage() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">
        {evalsIntro.kicker}
      </p>
      <h1 className="mt-6 max-w-[18ch] text-4xl tracking-[-0.02em] text-ink sm:text-5xl">
        {evalsIntro.title}
      </h1>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">{evalsIntro.lede}</p>
      <div className="mt-6 flex flex-col gap-4">
        {evalsIntro.body.map((p) => (
          <p key={p} className="max-w-[var(--width-prose)] text-ink-secondary">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-14 overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-sm">
          <caption className="sr-only">Eval registry — system, method, metric, result, and date.</caption>
          <thead>
            <tr className="border-b border-border-strong text-left">
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
              <tr key={`${e.system}-${e.benchmark}`} className="border-b border-border">
                <td className={`${TD} whitespace-nowrap font-medium text-ink`}>{e.system}</td>
                <td className={`${TD} text-ink-secondary`}>{e.benchmark}</td>
                <td className={`${TD} text-ink-secondary`}>{e.metric}</td>
                <td className={TD}>
                  <Status status={e.status} result={e.result} />
                </td>
                <td className={`${TD} whitespace-nowrap font-mono text-xs text-ink-tertiary`}>
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
    </Section>
  );
}
