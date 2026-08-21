import { Section } from "@/components/layout/section";
import { flagshipHome } from "@/content/home-visual";
import { DBWHISPER_GOLDEN, requireEval } from "@/content/evals";
import { FlagshipWalkthrough } from "./walkthrough";

/**
 * FlagshipWalkthroughSection — the server side of the walkthrough: assembles
 * every specimen fact from the content layer and hands the client component a
 * finished bundle of props.
 *
 * The boundary matters twice over. Bundle-wise, a client import of `content/`
 * drags the registry and Zod into the browser (the 290KB lesson). Truth-wise,
 * doing the assembly here means the walkthrough's SQL, schema rows, result rows
 * and scores are the same objects the hero stage and /evals render — one
 * source, three surfaces.
 *
 * The Spider score is looked up with `requireEval`, which throws at build time
 * if the row is renamed — the walkthrough cannot outlive the evidence it cites.
 */
export function FlagshipWalkthroughSection() {
  const w = flagshipHome.walkthrough;
  const s = flagshipHome.stage;

  const sql = s.sql.map((tok) => (tok.t === "br" ? "\n" : tok.v)).join("");
  const spider = requireEval("DBWhisper", "Spider");
  const spiderValue = `${spider.result.split("%")[0]!.trim()}%`;

  return (
    <Section space="lg" ariaLabelledBy="walkthrough-title">
      <FlagshipWalkthrough
        eyebrow={w.eyebrow}
        title={w.title}
        body={w.body}
        cta={w.cta}
        stages={w.stages}
        refusalDemo={w.refusalDemo}
        providers={w.providers}
        schema={s.schema}
        sql={sql}
        columns={s.columns}
        rows={s.rows}
        verdict={s.verdict}
        sampleLabel={s.sampleLabel}
        scores={[
          { value: DBWHISPER_GOLDEN.exactMatch, label: "exact execution match · 22 golden queries" },
          { value: DBWHISPER_GOLDEN.failClosed, label: "fail-closed refusals · 4 of 4 unsafe prompts" },
          { value: spiderValue, label: "Spider dev split · 101/139 scored" },
        ]}
        registryHref={DBWHISPER_GOLDEN.anchor}
      />
    </Section>
  );
}
