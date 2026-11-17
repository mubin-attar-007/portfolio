import { dbwhisperWalkthrough } from "@/content/dbwhisper-walkthrough";
import { DBWHISPER_EVIDENCE } from "@/content/evals";
import { FlagshipWalkthrough } from "./walkthrough";

/**
 * FlagshipWalkthroughSection — the server side of the walkthrough: assembles
 * every specimen fact from the content layer and hands the client component a
 * finished bundle of props.
 *
 * The boundary matters twice over. Bundle-wise, a client import of `content/`
 * drags the registry and Zod into the browser (the 290KB lesson). Truth-wise,
 * doing the assembly here means the walkthrough's SQL, schema rows, result rows
 * and scores are the same objects the request specimens and /evals render — one
 * source, three surfaces.
 *
 * The scores come from `DBWHISPER_EVIDENCE`, which reads the registry through
 * `requireEval` and throws at build time if a row is renamed or retired — the
 * walkthrough cannot outlive the evidence it cites, and every figure carries its
 * scope in the same cell.
 */
export function FlagshipWalkthroughSection() {
  const w = dbwhisperWalkthrough.walkthrough;
  const s = dbwhisperWalkthrough.stage;
  const { policy, spider } = DBWHISPER_EVIDENCE;

  const sql = s.sql.map((tok) => (tok.t === "br" ? "\n" : tok.v)).join("");

  return (
    <section id="request-walkthrough" aria-labelledby="walkthrough-title" className="my-14 scroll-mt-28 rounded-[var(--radius-lg)] border border-border bg-bg-subtle p-5 sm:p-8">
      <FlagshipWalkthrough
        eyebrow={w.eyebrow}
        title={w.title}
        body={w.body}
        cta={w.cta}
        stages={w.stages}
        refusalDemo={w.refusalDemo}
        providers={w.providers}
        schema={s.schema}
        question={s.question}
        sql={sql}
        columns={s.columns}
        rows={s.rows}
        verdict={s.verdict}
        sampleLabel={s.sampleLabel}
        scores={[
          { value: policy.ratio, label: `${policy.label} · ${policy.kind.toLowerCase()}` },
          {
            value: spider.ratio,
            label: `${spider.label} · ${spider.scope} · ${spider.excluded} of ${spider.sampled} dropped`,
          },
        ]}
        registryHref="/evals"
      />
    </section>
  );
}
