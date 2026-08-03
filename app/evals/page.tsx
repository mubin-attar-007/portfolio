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

function evalId(e: EvalRow) {
  return `${e.system}-${e.benchmark}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * A single eval as a "leaderboard" card: the measured RESULT is the focal point
 * (large mono, `positive` when a real run is complete), the system/benchmark/
 * metric label it, and the honest note is the method footnote. Elevated with the
 * shared surface depth so the registry reads as a scoreboard, not a spreadsheet.
 */
function EvalCard({ e }: { e: EvalRow }) {
  return (
    <li
      id={evalId(e)}
      className="scroll-mt-28 rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-surface)]"
    >
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
            {e.system} · {e.benchmark}
          </p>
          <p className="mt-2 text-base font-medium text-ink">{e.metric}</p>
          <p className="mt-3 max-w-[var(--width-prose)] text-sm leading-relaxed text-ink-secondary">
            {e.note}
          </p>
          {e.link ? (
            <span className="mt-3 block">
              <ResultLink href={e.link}>method</ResultLink>
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 border-border md:min-w-[10rem] md:border-l md:pl-8 md:text-right">
          {e.status === "complete" ? (
            <span className="font-mono text-2xl font-medium tabular-nums text-positive">
              {e.result}
            </span>
          ) : (
            <span className="md:self-end">
              <Status status={e.status} result={e.result} />
            </span>
          )}
          <time className="font-mono text-xs text-ink-tertiary">
            {e.date ? formatDate(e.date) : "—"}
          </time>
        </div>
      </div>
    </li>
  );
}

/**
 * /evals — the eval registry as a scannable scoreboard of cards. The header
 * lede + the fine print (`evalsIntro.body`) establish what counts as a
 * measurement BEFORE the readings, then each system's real result is the focal
 * point of its card. No fake-green: an unfinished run shows a muted pill, never
 * a borrowed number.
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
        {/* What counts as a measurement here — the standard, stated once, before
            the readings so the numbers are read the right way. */}
        <div className="max-w-[var(--width-prose)] border-l-[length:var(--stripe-width)] border-l-border-strong pl-5">
          {evalsIntro.body.map((p) => (
            <p key={p} className="text-sm leading-relaxed text-ink-secondary [&+p]:mt-3">
              {p}
            </p>
          ))}
        </div>

        <ul aria-label="Evaluation registry" className="mt-10 flex flex-col gap-4">
          {evals.map((e) => (
            <EvalCard key={`${e.system}-${e.benchmark}`} e={e} />
          ))}
        </ul>
      </Section>
    </>
  );
}
