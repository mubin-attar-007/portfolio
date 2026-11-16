// Grounding proof for the assistant's retrieval layer, with zero model quota:
//   node --import ./test/alias-loader.mjs --test test/retrieval.test.mts
//
// This is the load-bearing check that the assistant answers from real content:
// the right passage for detailed and for short questions, nothing for
// questions the site does not cover, every source in the index, and no
// withdrawn figure anywhere in it.

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  allPassages,
  chooseFallback,
  corpusSize,
  retrieve,
  retrieveForQuestion,
  stem,
  tokenize,
} from "../lib/ai/retrieval.ts";
import { SHORT_QUESTIONS, TEST_QUESTIONS, type TestQuestion } from "./fixtures/test-questions.ts";
import { STARTERS } from "../lib/ai/starters.ts";
import { isSitePath } from "../lib/ai/citation-links.ts";
import { resume } from "../content/resume.ts";
import { projects } from "../content/projects.ts";
import { evals, evalAnchor } from "../content/evals.ts";
import faqData from "../content/faq.json" with { type: "json" };
import { SITE, STATUS } from "../config/site.ts";

// Questions about things the site does not cover. They must retrieve NOTHING,
// so the route answers "not covered" without calling the model, and the
// fallback never streams a weakly related passage as if it answered them.
const OFF_TOPIC_QUESTIONS: string[] = [
  "What's Mubin's salary expectation?",
  "Does he have a security clearance?",
  "What's the weather?",
  "Will he relocate to Berlin and what visa does he hold?",
  "Tell me a joke.",
  "What is the capital of France?",
  "Who won the cricket world cup?",
  "Is he married?",
  "How old is he?",
  "Does he speak German?",
  "What is his salary at Sevina?",
  "Does he know Kubernetes?",
  "hi",
];

/** The retired evaluation's withdrawn figures (owner decision, 2026-11-16). */
const RETIRED_FIGURES = ["18/22", "21/22", "4/4", "82%", "95%", "100% fail-closed"];

function checkTop(questions: readonly TestQuestion[]): string[] {
  const failures: string[] = [];
  for (const q of questions) {
    const top = retrieve(q.question)[0];
    if (!top) {
      failures.push(`"${q.question}" → no passages retrieved`);
      continue;
    }
    if (!top.source.includes(q.expectedSource)) {
      failures.push(`"${q.question}" → top source "${top.source}" does not include "${q.expectedSource}"`);
    }
    for (const term of q.mustMention) {
      if (!top.text.toLowerCase().includes(term.toLowerCase())) {
        failures.push(`"${q.question}" → top passage missing "${term}"`);
      }
    }
  }
  return failures;
}

/** Published (non-draft) slugs of one MDX collection, read from disk. */
function publishedSlugs(dir: "writing" | "notes"): string[] {
  const root = path.join(process.cwd(), "content", dir);
  return readdirSync(root)
    .filter((file) => file.endsWith(".mdx"))
    .filter((file) => !/^draft:\s*true\s*$/m.test(readFileSync(path.join(root, file), "utf8")))
    .map((file) => file.slice(0, -4));
}

// ---- The corpus --------------------------------------------------------------

test("the corpus indexes every source the site publishes", () => {
  const passages = allPassages();
  const count = (kind: string) => passages.filter((p) => p.kind === kind).length;
  assert.equal(count("faq"), faqData.faq.length);
  assert.equal(count("project"), projects.length);
  assert.equal(count("profile"), 1);
  assert.equal(count("contact"), 1);
  assert.equal(count("resume"), resume.experience.length + 1);
  assert.equal(count("skills"), resume.skills.length);
  assert.equal(count("evaluation"), evals.length);
  assert.equal(count("evaluation-guide"), 1);
  assert.equal(count("writing-index"), 1);
  for (const project of projects) {
    assert.ok(
      passages.some((p) => p.source.startsWith(`${project.title} case study —`)),
      `missing case-study passages: ${project.slug}`,
    );
  }
  for (const slug of publishedSlugs("writing")) {
    assert.ok(passages.some((p) => p.links.some((l) => l.href === `/writing/${slug}`)), `essay missing: ${slug}`);
  }
  for (const slug of publishedSlugs("notes")) {
    assert.ok(passages.some((p) => p.links.some((l) => l.href === `/notes/${slug}`)), `note missing: ${slug}`);
  }
  assert.equal(corpusSize(), passages.length);
});

test("the profile uses the site's canonical identity and employment records", () => {
  const passages = allPassages();
  const profile = passages.find((passage) => passage.id === "profile-summary");
  assert.ok(profile?.text.includes(SITE.role));
  assert.ok(profile?.text.includes(resume.summary));

  for (const role of resume.experience) {
    const passage = passages.find((entry) => entry.source === `Résumé — ${role.org} (${role.role})`);
    assert.ok(passage, `missing canonical role: ${role.org}`);
    assert.ok(passage.text.includes(role.period));
    for (const point of role.points) assert.ok(passage.text.includes(point));
  }
});

test("contact and availability come from the site config", () => {
  const contact = allPassages().find((passage) => passage.kind === "contact");
  assert.ok(contact);
  for (const fact of [SITE.email, STATUS.text, SITE.location, SITE.socials.github, SITE.socials.linkedin]) {
    assert.ok(contact.text.includes(fact), `contact passage is missing "${fact}"`);
  }
  assert.ok(contact.links.some((link) => link.href === STATUS.href));
});

test("every résumé skill is indexed, and asking about it finds its group", () => {
  const passages = allPassages();
  const misses: string[] = [];
  for (const group of resume.skills) {
    const passage = passages.find((p) => p.kind === "skills" && p.source === `Skills — ${group.group}`);
    assert.ok(passage?.text.includes(group.items), `skills passage missing for ${group.group}`);
    // Split on commas outside parentheses: "routing (Gemini, GPT, …)" is one item.
    for (const item of group.items.split(/,\s*(?![^()]*\))/)) {
      const hits = retrieve(`Does he know ${item}?`);
      if (!hits.some((hit) => hit.id === passage!.id)) misses.push(`${group.group}: "${item}"`);
    }
  }
  assert.deepEqual(misses, [], `skills not found by a direct question:\n  ${misses.join("\n  ")}`);
});

test("evaluation rows are indexed as the registry states them", () => {
  const passages = allPassages();
  for (const row of evals) {
    const passage = passages.find((p) => p.id === `eval-${evalAnchor(row)}`);
    assert.ok(passage, `missing evaluation: ${row.system} / ${row.benchmark}`);
    assert.ok(passage.links.some((link) => link.href === `/evals#${evalAnchor(row)}`));
    if (row.status === "complete") {
      assert.ok(passage.text.includes(row.result), `result missing: ${row.benchmark}`);
      // The fallback drops the title line; what the result measures, and on
      // which test set, must still come before the figure.
      const body = passage.text.slice(passage.text.indexOf("\n") + 1);
      const figure = body.indexOf(row.result);
      for (const scope of [row.metric, row.benchmark]) {
        const at = body.indexOf(scope);
        assert.ok(at !== -1 && at < figure, `"${scope}" must precede the result: ${row.benchmark}`);
      }
    }
    if (row.retired) {
      assert.equal(passage.retired, true);
      assert.match(passage.source, /\(retired\)$/);
      assert.ok(passage.text.includes("retired"), "a retired row must say it is retired");
      assert.ok(passage.text.includes(row.retired.reason), "a retired row must say why");
      assert.ok(passage.text.includes(row.retired.link), "a retired row must link its audit");
    }
  }
});

test("every essay and note passage says when it was written", () => {
  // An essay describes a project as it was on its date: the 2026-05-20 essay
  // names sqlparse, which the v2 validator replaced with SQLGlot.
  const pieces = allPassages().filter((p) => p.kind === "writing" || p.kind === "note");
  assert.ok(pieces.length > 0);
  for (const passage of pieces) {
    const title = passage.text.slice(0, passage.text.indexOf("\n"));
    assert.match(title, /\(writing, published \d{4}-\d{2}-\d{2}/, `${passage.id}: the model sees the date`);
    assert.match(passage.source, /\((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}\)/, `${passage.id}: the reader sees the date`);
  }
});

test("no withdrawn figure appears anywhere in the index", () => {
  const leaks = allPassages().flatMap((passage) =>
    RETIRED_FIGURES.filter((figure) => passage.text.includes(figure)).map((figure) => `${passage.id}: ${figure}`),
  );
  assert.deepEqual(leaks, []);
});

test("every passage links only to pages of this site", () => {
  for (const passage of allPassages()) {
    assert.ok(passage.links.length > 0, `${passage.id} has no page to check it on`);
    for (const link of passage.links) assert.ok(isSitePath(link.href), `${passage.id} → ${link.href}`);
  }
});

// ---- Tokenizing ----------------------------------------------------------------

test("tokenizing folds accents, so 'résumé' finds the résumé", () => {
  assert.deepEqual(tokenize("Résumé"), tokenize("resume"));
  assert.ok(retrieve("Can I see his résumé?").length > 0);
});

test("the stemmer joins the forms a question and a page use", () => {
  const same = [
    ["deployed", "deployment"],
    ["accurate", "accuracy"],
    ["skills", "skill"],
    ["studied", "study"],
    ["used", "use"],
    ["embeddings", "embedded"],
    ["availability", "available"],
    ["validator", "validation"],
    ["written", "writing"],
  ];
  for (const [a, b] of same) assert.equal(stem(a!), stem(b!), `${a} / ${b}`);
  assert.notEqual(stem("engine"), stem("engineering"));
  assert.equal(stem("bias"), "bias");
});

// ---- Questions ---------------------------------------------------------------

test("every detailed question retrieves its expected source and terms", () => {
  const failures = checkTop(TEST_QUESTIONS);
  assert.deepEqual(failures, [], `\n  ${failures.join("\n  ")}`);
});

test("short natural questions retrieve the right passage (P3)", () => {
  const failures = checkTop(SHORT_QUESTIONS);
  assert.deepEqual(failures, [], `\n  ${failures.join("\n  ")}`);
});

test("questions the site does not cover retrieve nothing", () => {
  const leaks = OFF_TOPIC_QUESTIONS.flatMap((q) => {
    const hits = retrieve(q);
    return hits.length > 0 ? [`"${q}" → ${hits[0]!.source} @ ${hits[0]!.score.toFixed(2)}`] : [];
  });
  assert.deepEqual(leaks, []);
});

test("a question naming a project keeps that project's overview in the context", () => {
  const hits = retrieve("How accurate is DBWhisper?");
  const overview = hits.find((hit) => hit.id === "project-dbwhisper");
  assert.ok(overview, "the overview is in the context");
  for (const hit of hits.filter((h) => !h.cited)) assert.equal(hit.kind, "project");
  // Cited when it scores within the relative floor of the best passage.
  const named = retrieve("Does LangGraph act as the orchestrator in DBWhisper?");
  assert.ok(named.find((hit) => hit.id === "project-dbwhisper")?.cited, "the overview is cited");
});

test("a question naming a project is answered and cited from that project", () => {
  // A rare word the question shares with another project ("act" with
  // TradePulse, "handle" with LLM Studio and CrownWager) used to filter out
  // the named project's own record, and an essay about another project could
  // answer for it.
  for (const [question, slug] of [
    ["Does LangGraph act as the orchestrator in DBWhisper?", "dbwhisper"],
    ["How many tables can DBWhisper handle?", "dbwhisper"],
    ["Can I try LLM Studio?", "llm-studio"],
    ["Is LLM Studio live right now?", "llm-studio"],
    ["Does CrownWager have a demo?", "crownwager"],
    ["Is TradePulse live?", "tradepulse"],
  ] as const) {
    const stray = retrieve(question).filter((hit) => hit.cited && !hit.projects.includes(slug));
    assert.deepEqual(stray.map((hit) => hit.id), [], `"${question}" cites another project's passages`);
  }
});

test("a withdrawn result leads only a question about itself", () => {
  // Not "how accurate is it?", and not a question its metric happens to name:
  // leading "Is DBWhisper fail-closed?" read as if fail-closed were withdrawn.
  for (const question of ["How accurate is DBWhisper?", "Is DBWhisper fail-closed?", "How does DBWhisper validate a query?"]) {
    const top = retrieve(question)[0];
    assert.ok(top && !top.retired, `"${question}" → ${top?.id}`);
  }
  // …but it answers a question about itself — its retirement or its benchmark — as retired.
  for (const question of ["What happened to the golden query set?", "What is DBWhisper's accuracy on the golden set?", "Which results were retired?"]) {
    const top = retrieve(question)[0];
    assert.ok(top?.retired, `"${question}" → ${top?.id}`);
  }
});

test("a follow-up searches the question it refers back to", () => {
  const cases: [latest: string, previous: string, slug: string][] = [
    ["How was it deployed?", "What is DBWhisper?", "dbwhisper"],
    ["Tell me more about that.", "What is CrownWager?", "crownwager"],
    ["Is it open source?", "What is TradePulse?", "tradepulse"],
  ];
  for (const [latest, previous, slug] of cases) {
    const hits = retrieveForQuestion(latest, [previous]);
    assert.ok(hits[0]?.projects.includes(slug), `"${latest}" after "${previous}" → ${hits[0]?.id}`);
  }
  // A new topic is not pulled back to the old one, and off-topic stays empty.
  assert.ok(retrieveForQuestion("What are his skills?", ["What is DBWhisper?"])[0]?.kind === "skills");
  assert.deepEqual(retrieveForQuestion("What's the weather?", ["What is DBWhisper?"]), []);
});

test("a chain of follow-ups keeps the topic the first question set", () => {
  // "Tell me more" after "How was it deployed?" used to search only that
  // question, and drifted to other projects' deployment passages.
  const chain = retrieveForQuestion("Tell me more", ["What does DBWhisper do?", "How was it deployed?"]);
  const cited = chain.filter((hit) => hit.cited);
  assert.ok(cited.length > 0, "the chain retrieves");
  assert.deepEqual(cited.filter((hit) => !hit.projects.includes("dbwhisper")).map((hit) => hit.id), []);
  // A question that changed the subject ends the chain: this is about his work, not DBWhisper.
  const changed = retrieveForQuestion("Tell me more about that.", ["What is DBWhisper?", "Where does he work?"]);
  assert.ok(changed[0] && !changed[0].projects.includes("dbwhisper"), `→ ${changed[0]?.id}`);
});

// ---- Starters and the fallback -------------------------------------------------

test("every starter grounds, and its fallback serves the passage that answers it (P36)", () => {
  const expected: Record<(typeof STARTERS)[number], string> = {
    "What has Mubin shipped in production?": "FAQ — profile · projects (all four)",
    "Why a deterministic SQL validator instead of trusting the LLM?": "Essay — Trust is not a safety model",
    "How does TradePulse avoid look-ahead bias?": "FAQ — TradePulse — backtesting/engine.py",
    "What real production bugs has he found and fixed?": "FAQ — LLM Studio — database/models.py",
  };
  for (const starter of STARTERS) {
    const hits = retrieve(starter);
    assert.ok(hits.length > 0, `starter "${starter}" retrieved nothing`);
    const fallback = chooseFallback(hits);
    assert.ok(fallback?.passage.source.startsWith(expected[starter]), `"${starter}" → ${fallback?.passage.source}`);
  }
});

test("the fallback prefers an FAQ answer only when it scores close to the best passage", () => {
  const fallback = chooseFallback(retrieve("What has Mubin shipped in production?"));
  assert.equal(fallback?.passage.kind, "faq");
  // Served without the FAQ's question line.
  assert.ok(fallback && !fallback.answer.startsWith("What has Mubin"));
  assert.equal(chooseFallback([]), null);
});
