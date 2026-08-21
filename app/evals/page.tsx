import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import { SITE } from "@/config/site";
import { formatDate } from "@/lib/format";
import { evalAnchor, evals, evalsIntro } from "@/content/evals";
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
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border px-2.5 py-0.5 font-mono text-xs tabular-nums text-ink-tertiary ${
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



/**
 * A single eval as a registry row: the measured RESULT is the focal point, the
 * system/benchmark/metric label it, and the honest note is the method footnote.
 *
 * The result is set in INK, not in the positive colour. Rendering every complete
 * row green turned an honest registry into a wall of approval — a colour-only
 * signal saying "all good" about numbers whose entire point is that some of them
 * are not, and that one of them replaced a flattering figure with a lower true
 * one. Completion is carried by a status chip that says the word instead.
 */
function EvalCard({ e }: { e: EvalRow }) {
  return (
    <li
      id={evalAnchor(e)}
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
        <div className="flex flex-col gap-2 border-border md:min-w-[13rem] md:max-w-[17rem] md:items-end md:border-l md:pl-8 md:text-right">
          {e.status === "complete" ? (
            <>
              <span className="font-mono text-[1.375rem] leading-tight tabular-nums tracking-[-0.02em] text-ink">
                {e.result}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-border bg-bg-subtle px-2 py-0.5 font-mono text-xs text-ink-secondary">
                <Check size={11} strokeWidth={2.5} aria-hidden className="text-positive" />
                measured
              </span>
            </>
          ) : (
            <Status status={e.status} result={e.result} />
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

        {/* How to read a row — the definitions, before the readings. Without
            these, "execution accuracy" and "exact match" look like synonyms, and
            the difference between them is the argument this page is making. */}
        <dl className="mt-10 grid gap-x-10 gap-y-4 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              term: "Execution accuracy",
              def: "The generated query is RUN against the real database and its result set is compared — not its text.",
            },
            {
              term: "Exact match",
              def: "The returned rows are identical to the reference. An extra correct column still counts as a miss.",
            },
            {
              term: "Fail-closed refusal",
              def: "An unsafe or out-of-scope prompt is rejected before execution rather than answered approximately.",
            },
          ].map((d) => (
            <div key={d.term}>
              <dt className="font-mono text-xs uppercase tracking-[0.06em] text-ink">{d.term}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{d.def}</dd>
            </div>
          ))}
        </dl>

        <ul aria-label="Evaluation registry" className="mt-8 flex flex-col gap-4">
          {evals.map((e) => (
            <EvalCard key={`${e.system}-${e.benchmark}`} e={e} />
          ))}
        </ul>
      </Section>
    </>
  );
}
