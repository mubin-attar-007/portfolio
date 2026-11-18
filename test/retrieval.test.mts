// Grounding proof for the assistant's retrieval layer, with zero model quota:
//   node --import ./test/alias-loader.mjs --test test/retrieval.test.mts
//
// This is the load-bearing check that the assistant answers from real content:
// every page of the site is in the index and found by a natural question; the
// right passage for detailed, short, misspelt and aliased questions; nothing
// for questions the site does not cover, even when their common words match;
// and no withdrawn figure anywhere in the index.

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  allPassages,
  chooseFallback,
  correctWord,
  corpusSize,
  editDistance,
  retrieve,
  retrieveForQuestion,
  searchSite,
  stem,
  tokenize,
} from "../lib/ai/retrieval.ts";
import { SHORT_QUESTIONS, TEST_QUESTIONS, type TestQuestion } from "./fixtures/test-questions.ts";
import { ARTICLE_STARTERS, CASE_STUDY_STARTERS, STARTERS, startersFor } from "../lib/ai/starters.ts";
import { FOLLOW_UPS, type FollowUpTopic } from "../lib/ai/follow-ups.ts";
import { isSitePath, pagePath } from "../lib/ai/citation-links.ts";
import { resume } from "../content/resume.ts";
import { projects } from "../content/projects.ts";
import { flagships } from "../content/flagship/index.ts";
import { USAGE } from "../content/flagship/shared.ts";
import { evals, evalAnchor } from "../content/evals.ts";
import faqData from "../content/faq.json" with { type: "json" };
import { INTEGRATIONS, SITE, STATUS } from "../config/site.ts";

// Questions about things the site does not cover. They must retrieve NOTHING,
// so the route answers "not covered" without calling the model, and the
// fallback never streams a weakly related passage as if it answered them.
// Questions about his private life ("How old is he?") are answered as not
// covered before retrieval (lib/ai/intent.ts; test/chat-handler.test.mts).
const OFF_TOPIC_QUESTIONS: string[] = [
  "What's Mubin's salary expectation?",
  "Does he have a security clearance?",
  "What's the weather?",
  "Will he relocate to Berlin and what visa does he hold?",
  "Tell me a joke.",
  "What is the capital of France?",
  "Who won the cricket world cup?",
  "Is he married?",
  "Does he speak German?",
  "What is his salary at Sevina?",
  "Does he know Kubernetes?",
  "hi",
];

/**
 * The probe that found the coverage bug: a question whose distinctive word the
 * index does not know, padded with common words ("people", "use") that it
 * does. Before 2026-11-17 the common words carried it to an unrelated LLM
 * Studio passage. The products here are invented.
 */
const UNKNOWN_SUBJECT_QUESTIONS: string[] = [
  "What is FooCorp and how many people use it?",
  "How many people use Zentrix every day?",
  "Who built HealthSync and what does it use?",
  "Tell me about the Orbital project and its users",
];

/** The retired evaluation's withdrawn figures (owner decision, 2026-11-16). */
const RETIRED_FIGURES = ["18/22", "21/22", "4/4", "82%", "95%", "100% fail-closed"];

function checkTop(questions: readonly TestQuestion[]): string[] {
  const failures: string[] = [];
  for (const q of questions) {
    const passages = retrieve(q.question);
    if (passages.length === 0) {
      failures.push(`"${q.question}" → no passages retrieved`);
      continue;
    }
    // The passage under test: the first, or for `rank: "retrieved"` the one from the expected source.
    const top = q.rank === "retrieved" ? (passages.find((p) => p.source.includes(q.expectedSource)) ?? passages[0]!) : passages[0]!;
    if (!top.source.includes(q.expectedSource)) {
      const which = q.rank === "retrieved" ? "no retrieved source, of " + passages.map((p) => `"${p.source}"`).join(", ") + "," : `top source "${top.source}"`;
      failures.push(`"${q.question}" → ${which} does not include "${q.expectedSource}"`);
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

/** The slugs every product and project is known by. */
const PRODUCTS = [...flagships.map((f) => ({ slug: f.slug, name: f.name })), ...projects.map((p) => ({ slug: p.slug, name: p.title }))];

/** True when the first cited passage of a search cites `page` (anchors ignored). */
const leadsWith = (passages: ReturnType<typeof retrieve>, page: string): boolean =>
  passages.find((p) => p.cited)?.links.some((link) => pagePath(link.href) === page) ?? false;

// ---- The corpus --------------------------------------------------------------

test("the corpus indexes every source the site publishes", () => {
  const passages = allPassages();
  const count = (kind: string) => passages.filter((p) => p.kind === kind).length;
  const has = (id: string) => passages.some((p) => p.id === id);
  assert.equal(count("faq"), faqData.faq.length);
  assert.equal(count("project"), projects.length + flagships.length);
  assert.equal(count("contact"), 1);
  assert.equal(count("hire"), 2);
  assert.equal(count("resume"), resume.experience.length + 2);
  assert.equal(count("skills"), resume.skills.length + 1);
  assert.equal(count("evaluation"), evals.length);
  assert.equal(count("evaluation-guide"), 1);
  assert.equal(count("writing-index"), 1);
  assert.equal(count("work-index"), 1);
  for (const id of ["profile-summary", "about-page", "about-principles", "now", "trust", "uses-hosting", "skills-aws"]) {
    assert.ok(has(id), `missing passage: ${id}`);
  }
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

test("every flagship section is indexed from its record, cited at its anchor", () => {
  const passages = allPassages();
  for (const flagship of flagships) {
    const own = passages.filter((p) => p.id === `project-${flagship.slug}` || p.id.startsWith(`cs-${flagship.slug}-`));
    const ids = new Set(own.map((p) => p.id));
    for (const section of ["problem", "constraints", "architecture", "how-it-works", "deployment", "decisions", "verification", "outcome", "tour", "walkthrough"]) {
      assert.ok(ids.has(`cs-${flagship.slug}-${section}`), `${flagship.slug}: missing ${section}`);
    }
    const built = own.filter((p) => p.id.startsWith(`cs-${flagship.slug}-built-`));
    assert.equal(built.length, flagship.built.length, `${flagship.slug}: one passage per surface built`);
    for (const incident of flagship.incidents) assert.ok(ids.has(`cs-${flagship.slug}-what-broke-${incident.id}`), incident.id);
    for (const highlight of flagship.highlights) assert.ok(ids.has(`cs-${flagship.slug}-highlight-${highlight.id}`), highlight.id);
    for (const excerpt of flagship.excerpts) assert.ok(ids.has(`cs-${flagship.slug}-code-${excerpt.id}`), excerpt.id);
    // Every section cites the case study, at an anchor the page renders.
    for (const passage of own) {
      for (const link of passage.links) assert.match(link.href, new RegExp(`^/work/${flagship.slug}(?:#[a-z-]+)?$`), passage.id);
    }
    // The approved figure, exactly, and the AWS services, by name.
    const overview = passages.find((p) => p.id === `project-${flagship.slug}`);
    assert.ok(overview?.text.includes(USAGE[flagship.slug].sentence), `${flagship.slug}: the approved usage wording`);
    for (const service of flagship.stack.aws) assert.ok(overview?.text.includes(service), `${flagship.slug}: ${service}`);
  }
});

test("the index credits only Mubin, and only as the site does", () => {
  const all = allPassages().map((p) => p.text).join("\n");
  // The colleague line was removed from CareLTC's credit (owner, 2026-11-17).
  assert.doesNotMatch(all, /\bcolleague\b/i);
  for (const flagship of flagships) assert.ok(all.includes(flagship.credit.role), `${flagship.slug}: the approved credit`);
  // The retired role wording never enters the index.
  assert.doesNotMatch(all, /forward[- ]deployed|\bFDE\b/i);
  // The phone number lives on the PDF only.
  assert.doesNotMatch(all, /\+91|\b\d{5} \d{5}\b/);
});

test("the profile uses the site's canonical identity, employment records and flagship work", () => {
  const passages = allPassages();
  const profile = passages.find((passage) => passage.id === "profile-summary");
  assert.ok(profile?.text.includes(SITE.role));
  assert.ok(profile?.text.includes("3.5+ years"));
  for (const flagship of flagships) assert.ok(profile?.text.includes(USAGE[flagship.slug].sentence), flagship.slug);
  assert.ok(profile?.text.includes(SITE.email));
  assert.ok(passages.find((p) => p.id === "resume-document")?.text.includes(resume.summary));

  for (const role of resume.experience) {
    const passage = passages.find((entry) => entry.source === `Résumé — ${role.org} (${role.role})`);
    assert.ok(passage, `missing canonical role: ${role.org}`);
    assert.ok(passage.text.includes(role.period));
    for (const point of role.points) assert.ok(passage.text.includes(point));
  }
});

test("contact and hiring come from the site config and the hiring page", () => {
  const contact = allPassages().find((passage) => passage.kind === "contact");
  assert.ok(contact);
  for (const fact of [SITE.email, STATUS.text, SITE.location, SITE.socials.github, SITE.socials.linkedin, INTEGRATIONS.calUrl]) {
    assert.ok(contact.text.includes(fact), `contact passage is missing "${fact}"`);
  }
  assert.ok(contact.links.some((link) => link.href === STATUS.href));
  const roles = allPassages().find((passage) => passage.id === "hire-roles");
  for (const fact of ["Applied AI Engineer", "AI Engineer, LLM applications and agents", "Freelance AI project", "customer sites", "India"]) {
    assert.ok(roles?.text.includes(fact), `hiring passage is missing "${fact}"`);
  }
});

test("his notice period is indexed from STATUS, stated once, and a notice question finds the hiring pages first", () => {
  const notice = `Notice period for full-time roles: ${STATUS.noticePeriod}.`;
  const roles = allPassages().find((passage) => passage.id === "hire-roles")!;
  assert.equal(roles.text.split(STATUS.noticePeriod).length - 1, 1, "the hiring passage states the notice period once");
  assert.ok(roles.text.includes(notice));
  assert.match(roles.text.slice(0, roles.text.indexOf("\n")), /notice period and when he can join/, "the title uses visitors' words");
  assert.ok(allPassages().find((passage) => passage.id === "contact")!.text.includes(`Notice period: ${STATUS.noticePeriod}`));
  assert.ok(allPassages().find((passage) => passage.id === "profile-summary")!.text.includes(notice));
  for (const question of ["What is his notice period?", "How long is his notice?", "Mubin ka notice period kitna hai?"]) {
    const { passages, anchor } = searchSite(question);
    assert.equal(passages[0]?.id, "hire-roles", question);
    const hrefs = passages.filter((p) => p.cited).flatMap((p) => p.links.map((link) => link.href));
    assert.ok(hrefs.includes("/hire") && hrefs.includes("/contact"), `${question}: ${hrefs.join(", ")}`);
    // With no key, the answer served is the hiring passage, which leads with the notice period.
    assert.ok(chooseFallback(passages, anchor)!.answer.split("\n").slice(0, 2).includes(notice), question);
  }
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

test("every passage links only to pages of this site, each with a readable label", () => {
  for (const passage of allPassages()) {
    assert.ok(passage.links.length > 0, `${passage.id} has no page to check it on`);
    for (const link of passage.links) {
      assert.ok(isSitePath(link.href), `${passage.id} → ${link.href}`);
      assert.ok(link.label.trim() && !/[/\\]|\.\w{2,4}\b/.test(link.label), `${passage.id}: label "${link.label}"`);
    }
  }
});

// ---- Every page is answerable -------------------------------------------------

/** The routes the sitemap lists: its static entries, and every project, flagship, essay and note. */
function sitemapRoutes(): string[] {
  const source = readFileSync(path.join(process.cwd(), "app", "sitemap.ts"), "utf8");
  const statics = [...source.matchAll(/\bu\("([^"]*)"\)/g)].map((m) => m[1] || "/");
  return [
    ...new Set([
      ...statics,
      ...PRODUCTS.map((p) => `/work/${p.slug}`),
      ...publishedSlugs("writing").map((slug) => `/writing/${slug}`),
      ...publishedSlugs("notes").map((slug) => `/notes/${slug}`),
    ]),
  ];
}

/**
 * Routes with no passage of their own, and why: the home page summarizes the
 * pages that are each indexed in their own right, and it is never a citation
 * (lib/ai/citation-links.ts).
 */
const NOT_CITED: Readonly<Record<string, string>> = { "/": "the home page summarizes the indexed pages" };

/** One to three natural questions per fixed page, each of which must retrieve it first. */
const PAGE_QUESTIONS: Readonly<Record<string, readonly string[]>> = {
  "/work": ["What has Mubin shipped in production?"],
  "/writing": ["What has he written?"],
  "/notes": ["What notes has he published?"],
  "/now": ["What is he working on now?"],
  "/evals": ["How does he measure his work?", "Which result was retired, and why?"],
  "/hire": ["What roles is Mubin open to?", "Can he work remotely or on-site?"],
  "/contact": ["How can I contact him?", "How can I book a call?"],
  "/about": ["Who is Mubin?", "How does he approach the work?"],
  "/uses": ["What hosting do his public projects use?"],
  "/trust": ["What does he not claim?"],
  "/evaluate": ["How can I check his work with my own AI?"],
  "/resume": ["Can I get his CV?", "What did he study?"],
  "/skills": ["What's his tech stack?", "Does Mubin have AWS experience?"],
  "/privacy": ["Does this assistant store my question?"],
};

test("every route in the sitemap has a passage that cites it", () => {
  const cited = new Set(allPassages().flatMap((p) => p.links.map((link) => pagePath(link.href))));
  const missing = sitemapRoutes().filter((route) => !cited.has(route) && !(route in NOT_CITED));
  assert.deepEqual(missing, [], "routes without a passage");
  // Every product's case study is in the sitemap's route list.
  for (const product of PRODUCTS) assert.ok(sitemapRoutes().includes(`/work/${product.slug}`), product.slug);
});

test("every fixed page has natural questions that retrieve it first", () => {
  const routes = sitemapRoutes().filter((route) => !route.startsWith("/work/") && !/^\/(?:writing|notes)\//.test(route));
  const failures: string[] = [];
  for (const route of routes) {
    if (route in NOT_CITED) continue;
    const questions = PAGE_QUESTIONS[route];
    if (!questions) {
      failures.push(`${route}: no questions`);
      continue;
    }
    for (const question of questions) {
      if (!leadsWith(retrieve(question), route)) failures.push(`${route}: "${question}" → ${retrieve(question)[0]?.id}`);
    }
  }
  assert.deepEqual(failures, []);
});

test("every product's case study is retrieved first by its own questions", () => {
  const failures: string[] = [];
  for (const product of PRODUCTS) {
    for (const question of [`What is ${product.name}?`, ...(CASE_STUDY_STARTERS[product.slug] ?? [])]) {
      if (!leadsWith(retrieve(question), `/work/${product.slug}`)) failures.push(`"${question}" → ${retrieve(question)[0]?.id}`);
    }
  }
  assert.deepEqual(failures, []);
});

// ---- Tokenizing and spelling ----------------------------------------------------

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
    ["using", "use"],
    ["embeddings", "embedded"],
    ["availability", "available"],
    ["validator", "validation"],
    ["written", "writing"],
  ];
  for (const [a, b] of same) assert.equal(stem(a!), stem(b!), `${a} / ${b}`);
  assert.notEqual(stem("engine"), stem("engineering"));
  assert.equal(stem("bias"), "bias");
});

test("edit distance counts insertions, deletions, substitutions and transpositions", () => {
  assert.equal(editDistance("dbwisper", "dbwhisper", 2), 1); // insertion
  assert.equal(editDistance("carelct", "careltc", 2), 1); // transposition
  assert.equal(editDistance("tradepluse", "tradepulse", 2), 1);
  assert.equal(editDistance("crownwagr", "crownwager", 2), 1);
  assert.equal(editDistance("kitten", "sitting", 5), 3);
  assert.equal(editDistance("abc", "abcdef", 2), 3, "past the bound it reports bound + 1");
});

test("a misspelt product or project name finds that product (Damerau–Levenshtein 1 at 5–8 letters, 2 at 9+)", () => {
  const misspellings: [question: string, slug: string][] = [
    ["what does dbwisper do", "dbwhisper"],
    ["What is DBWhsiper?", "dbwhisper"],
    ["What is CareLCT?", "careltc"],
    ["how many people use careltcc", "careltc"],
    ["tell me about the bench discvery app", "bench-discovery"],
    ["What is Bench Dicsovery?", "bench-discovery"],
    ["What is Tradepluse?", "tradepulse"],
    ["Is crownwagr live?", "crownwager"],
    ["What is LLM Studoi?", "llm-studio"],
  ];
  for (const [question, slug] of misspellings) {
    const search = searchSite(question);
    assert.ok(search.corrected, `"${question}" was corrected`);
    assert.ok(search.passages[0]?.projects.includes(slug), `"${question}" → ${search.passages[0]?.id}`);
  }
  // Topic words are corrected too, to the site's own words.
  assert.equal(correctWord("skils"), "skills");
  assert.equal(correctWord("architecure"), "architecture");
  // Never to a common word nobody asked about, and never a word the site does not use.
  for (const word of ["married", "salary", "relocation", "weather", "kubernetes", "german"]) assert.equal(correctWord(word), null, word);
});

test("aliases are content-backed and add recall for what visitors call things", () => {
  // Each alias target is in the index (the alias map lives in lib/ai/retrieval.ts).
  for (const term of ["resume", "skills", "availability", "hiring", "roles", "users", "usage", "profiles", "recording", "screens", "owns"]) {
    assert.ok(allPassages().some((p) => tokenize(p.text).includes(stem(term))), `alias target "${term}" is in the index`);
  }
  const phrasings: [question: string, page: string][] = [
    ["How does the NFC app work?", "/work/careltc"],
    ["What broke in the NFC rounds app?", "/work/careltc"],
    ["What does the document discovery desktop app do?", "/work/bench-discovery"],
    ["Can I get his CV?", "/resume"],
    ["What's his tech stack?", "/skills"],
    ["Is this candidate available for a full-time role?", "/hire"],
    ["Who is he open to working with?", "/hire"],
    ["What is his GitHub?", "/contact"],
    ["Is there a demo video of Bench Discovery?", "/work/bench-discovery"],
    ["What is Bench Discovery, and what did Mubin build?", "/work/bench-discovery"],
    ["Kya Mubin remote kaam karte hain?", "/hire"],
    ["Mubin ne kaunse projects banaye hain?", "/work/bench-discovery"],
  ];
  const failures = phrasings.filter(([question, page]) => !leadsWith(retrieve(question), page));
  assert.deepEqual(failures.map(([q]) => `"${q}" → ${retrieve(q)[0]?.id}`), []);
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

test("common words never answer a question whose subject the site does not know", () => {
  // The probe that found it: "What is CareLTC and how many people use it?"
  // served an LLM Studio passage before CareLTC was indexed.
  for (const question of UNKNOWN_SUBJECT_QUESTIONS) {
    assert.deepEqual(retrieve(question).map((hit) => hit.id), [], question);
  }
  // Now that it is indexed, the same question answers from CareLTC's own overview, with its usage.
  const search = searchSite("What is CareLTC and how many people use it?");
  assert.equal(search.passages[0]?.id, "project-careltc");
  assert.ok(chooseFallback(search.passages, search.anchor)?.answer.includes(USAGE.careltc.sentence));
});

test("a question naming a project keeps that project's overview in the context", () => {
  const hits = retrieve("How accurate is DBWhisper?");
  const overview = hits.find((hit) => hit.id === "project-dbwhisper");
  assert.ok(overview, "the overview is in the context");
  for (const hit of hits.filter((h) => !h.cited)) assert.equal(hit.kind, "project");
  // Cited when it scores within the relative floor of the best passage.
  const named = retrieve("Is the DBWhisper demo live?");
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
    ["What broke in CareLTC?", "careltc"],
    ["How does Bench Discovery verify a redaction?", "bench-discovery"],
  ] as const) {
    const stray = retrieve(question).filter((hit) => hit.cited && !hit.projects.includes(slug));
    assert.deepEqual(stray.map((hit) => hit.id), [], `"${question}" cites another project's passages`);
  }
});

test("a named product asked about in words its record does not use gets its summary", () => {
  // Its name alone would rank its shortest passages first.
  const hits = retrieve("tell me about the bench discovery app");
  assert.deepEqual(hits.slice(0, 2).map((h) => h.id), ["project-bench-discovery", "cs-bench-discovery-problem"]);
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
    ["How many people use it?", "What is CareLTC?", "careltc"],
    ["Which AWS services does it use?", "Tell me about Bench Discovery.", "bench-discovery"],
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

// ---- The page the panel is open on ---------------------------------------------

test("on a case study, its own passages lead a question that names no other product", () => {
  for (const flagship of flagships) {
    const page = `/work/${flagship.slug}`;
    const hits = retrieve("What broke, and what changed?", { page });
    assert.ok(hits[0]?.projects.includes(flagship.slug), `${page} → ${hits[0]?.id}`);
    // "How does it work?" as the first question on the page is about the page's product.
    assert.ok(searchSite("How does it work?", [], { page }).passages[0]?.projects.includes(flagship.slug));
  }
  // A question that names another product is about that product, wherever it is asked.
  assert.ok(retrieve("What is DBWhisper?", { page: "/work/careltc" })[0]?.projects.includes("dbwhisper"));
  // Later in a conversation, "it" is the conversation's subject, not the page's.
  const later = searchSite("How was it deployed?", ["What is DBWhisper?"], { page: "/work/careltc" });
  assert.ok(later.passages[0]?.projects.includes("dbwhisper"), `→ ${later.passages[0]?.id}`);
});

test("every page's starters ground on that page", () => {
  const failures: string[] = [];
  for (const product of PRODUCTS) {
    const page = `/work/${product.slug}`;
    for (const question of startersFor(page)) {
      if (!leadsWith(searchSite(question, [], { page }).passages, page)) failures.push(`${page}: "${question}"`);
    }
  }
  for (const collection of ["writing", "notes"] as const) {
    for (const slug of publishedSlugs(collection)) {
      const page = `/${collection}/${slug}`;
      assert.deepEqual(startersFor(page), ARTICLE_STARTERS[collection]);
      for (const question of startersFor(page)) {
        if (!leadsWith(searchSite(question, [], { page }).passages, page)) failures.push(`${page}: "${question}"`);
      }
    }
  }
  assert.equal(startersFor("/hire"), STARTERS);
  assert.equal(startersFor(null), STARTERS);
  assert.deepEqual(failures, []);
});

// ---- Starters, follow-ups and the fallback --------------------------------------

test("every starter grounds, and its fallback serves the passage that answers it (P36)", () => {
  const expected: Record<(typeof STARTERS)[number], string> = {
    "What is Bench Discovery?": "Bench Discovery — flagship case study overview",
    "How does CareLTC record room rounds?": "CareLTC case study",
    "What roles is Mubin open to?": "Hiring — roles he is open to",
    "How does DBWhisper keep generated SQL safe?": "FAQ — DBWhisper",
  };
  for (const starter of STARTERS) {
    const search = searchSite(starter);
    assert.ok(search.passages.length > 0, `starter "${starter}" retrieved nothing`);
    const fallback = chooseFallback(search.passages, search.anchor);
    assert.ok(fallback?.passage.source.startsWith(expected[starter]), `"${starter}" → ${fallback?.passage.source}`);
  }
});

test("every follow-up grounds on its topic's pages", () => {
  /** The pages a topic's follow-ups must be answered from. */
  const TOPIC_PAGES: Record<FollowUpTopic, readonly string[]> = {
    "bench-discovery": ["/work/bench-discovery"],
    careltc: ["/work/careltc"],
    signflow: ["/work/signflow"],
    dbwhisper: ["/work/dbwhisper", "/evals"],
    tradepulse: ["/work/tradepulse"],
    crownwager: ["/work/crownwager", "/evals"],
    "llm-studio": ["/work/llm-studio"],
    hiring: ["/hire", "/contact"],
    resume: ["/resume", "/about"],
    skills: ["/skills", "/uses"],
    evals: ["/evals"],
    writing: ["/writing", "/writing/trust-is-not-a-safety-model", "/evals"],
    profile: ["/work", "/hire", "/contact", "/about", "/work/bench-discovery"],
  };
  const failures: string[] = [];
  for (const [topic, questions] of Object.entries(FOLLOW_UPS) as [FollowUpTopic, readonly string[]][]) {
    for (const question of questions) {
      const passages = retrieve(question);
      if (!TOPIC_PAGES[topic].some((page) => leadsWith(passages, page))) failures.push(`${topic}: "${question}" → ${passages[0]?.id}`);
    }
  }
  assert.deepEqual(failures, []);
});

test("the fallback prefers an FAQ answer only when it scores close to the best passage", () => {
  const fallback = chooseFallback(retrieve("How does TradePulse avoid look-ahead bias?"));
  assert.equal(fallback?.passage.kind, "faq");
  // Served without the FAQ's question line.
  assert.ok(fallback && !fallback.answer.startsWith("How does TradePulse"));
  assert.equal(chooseFallback([]), null);
});

test("the fallback prefers a passage with the question's most specific word", () => {
  const search = searchSite("How many people use Bench Discovery?");
  assert.equal(search.anchor, stem("usage"), "an alias's own words are never the anchor");
  assert.equal(chooseFallback(search.passages, search.anchor)?.passage.id, "project-bench-discovery");
});
