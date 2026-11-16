// -----------------------------------------------------------------------------
// Local, dependency-free retrieval over the site's content (ADR-006).
//
// The assistant is RETRIEVAL-FIRST: before any model is involved, it finds the
// most relevant real passages from the site's own content. lib/ai/corpus.ts
// builds the passages at module load; this module indexes them with BM25 and
// decides, per question, which passages are relevant enough to answer from.
//
// No embedding API, no network, no dependencies — it runs identically in the
// route and in a plain `node --test`, which is what lets the grounding tests
// (test/retrieval.test.mts) prove retrieval with zero model quota.
//
// Relevance is judged relative to the question, not against a fixed score.
// BM25 scores grow with the number of matched terms, so a fixed floor tuned on
// long questions rejects every short one ("What does DBWhisper do?" scores
// about 2.3; the old floor was 4.6). Instead:
//
//   1. A question that only names a project, or only asks about Mubin, gets
//      that project's overview and case-study summary, or his profile.
//   2. Otherwise the question must be covered by the site: its content words,
//      weighted by rarity, must mostly be words the site uses. A word the site
//      never uses ("salary", "visa") counts as maximally specific, so a
//      question about it retrieves nothing and gets an honest "not covered".
//   3. A passage must match at least half of that weight itself, and score
//      within RELATIVE_FLOOR of the best passage; the best k are kept.
// -----------------------------------------------------------------------------

import { SITE } from "@/config/site";
import { buildCorpus, PROJECT_NAMES, type Passage } from "./corpus";

/** A passage with its BM25 score for one question. */
export type RetrievedPassage = Passage & {
  score: number;
  /**
   * False for a passage included only as background (a named project's
   * overview that did not itself score). The route cites only cited passages,
   * so a source line always matches the question it answers.
   */
  cited: boolean;
};

/** Passages handed to the model per question. */
const DEFAULT_K = 4;

/**
 * The share of a question's topic weight that must be made of words the site
 * uses, and that a passage must match itself. Below it the question, or the
 * passage, is about something else.
 */
const MIN_COVERAGE = 0.5;

/** A passage must score at least this share of the best passage's score. */
const RELATIVE_FLOOR = 0.6;

/**
 * Multiplier for the site's own record of a project — a case study section,
 * an evaluation row, an FAQ answer about it — when the question names exactly
 * that project. The record of a project the question does not name is divided
 * by it. Essays and notes stay neutral: they compete, but a question about
 * DBWhisper is answered from DBWhisper's write-up first. The overview is not
 * boosted: it summarizes everything, so it would outrank the section that
 * actually answers, and it is in the context anyway (see `retrieve`).
 */
const PROJECT_BOOST = 1.5;

/**
 * Multiplier for evaluation rows when a question asks about results ("How
 * accurate…", "What is the Spider score?"): the registry is where a figure,
 * its method and its scope live together. A retired row is divided by it
 * instead. It still answers a question about itself, but a withdrawn result is
 * never the lead answer to "how accurate is it?".
 */
const RESULTS_BOOST = 1.5;

/**
 * Multiplier for his profile, contact details, résumé and skills when a short
 * question is about him ("Where does he work?"). Two topic words are not
 * enough for BM25 to tell "work" the job from "work" the essays.
 */
const PERSON_BOOST = 1.5;

/** A question with at most this many topic words is short enough for PERSON_BOOST. */
const SHORT_QUESTION_TERMS = 2;

/** The passage kinds that describe him rather than his projects. */
const PERSON_KINDS: ReadonlySet<Passage["kind"]> = new Set(["profile", "contact", "resume", "skills"]);

/** An FAQ answer is preferred for the fallback when it scores this close to the best passage. */
const FAQ_PREFERENCE = 0.9;

const K1 = 1.5; // term-frequency saturation
const B = 0.75; // length normalization

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

/**
 * Words that carry no topic: English glue, plus the filler of conversational
 * questions ("tell me", "do you know", "more briefly"). Without the second
 * group, a rare filler word outweighs the topic — "Does he know Docker?" used
 * to rank an essay first because it contains "know".
 */
const STOPWORDS = new Set(
  (
    "a an and are as at be but by can do does for from has have he her him his how i in is it its of on or " +
    "that the their them they this to was were what when which who why will with you your about into over " +
    "than then there these those we us our himself " +
    "tell me more know knows explain describe give show list please could would should may might must shall " +
    "did done doing where whom whose any some much many very really actually also just like get got see say " +
    "said anything something everything thing things kind sort lot bit if so not no yes all each every both " +
    "other such only own same too here been being am had having my mine she hers let lets want need help " +
    "hey hi hello thanks thank ok okay sure great nice again briefly brief short shorter simpler simply " +
    "summarize summarise summary elaborate expand detail details example examples rephrase mean means meant " +
    "answer answers question questions"
  ).split(" "),
);

/** Words that make a question about a person: who he is, what he does. */
const PERSON = new Set(["he", "him", "his", "himself", ...words(SITE.name)]);

/** Words that point back at the previous question: "Is it open source?" */
const REFERS_BACK = new Set(["it", "its", "that", "this", "they", "them", "these", "those"]);

/**
 * Suffixes stripped by the stemmer, longest first, with the shortest base each
 * may leave. Deliberately small: enough that "deployed" finds "deployment",
 * "accurate" finds "accuracy" and "skills" finds "skill", not a full Porter
 * stemmer. The same function runs on passages and questions, so a conflation
 * it makes ("state" and "statement") is at worst a little noise.
 */
const SUFFIXES: readonly (readonly [suffix: string, replacement: string, minBase: number])[] = [
  ["izations", "", 3], ["ization", "", 3], ["ibility", "", 3], ["ability", "", 3], ["ations", "", 3],
  ["ation", "", 3], ["ators", "", 3], ["ator", "", 3], ["ments", "", 3], ["ment", "", 3], ["ities", "", 3],
  ["ity", "", 3], ["ness", "", 4], ["able", "", 3], ["ible", "", 3],
  ["izing", "", 3], ["ating", "", 3], ["ings", "", 3], ["ing", "", 3], ["ized", "", 3], ["izes", "", 3],
  ["ize", "", 3], ["ates", "", 3], ["ated", "", 3], ["ate", "", 3], ["ies", "y", 2], ["ied", "y", 2],
  ["ches", "ch", 1], ["shes", "sh", 1], ["sses", "ss", 1], ["xes", "x", 1], ["ers", "", 4], ["er", "", 4],
  ["ed", "", 3], ["acy", "", 3], ["ly", "", 4],
];

/** A doubled final consonant left by "shipped" or "embedding" ("shipp" → "ship"). */
const DOUBLED = /([b-df-hj-km-np-rtv-y])\1$/;

/** Irregular verb forms visitors ask with, mapped to the form suffix rules handle. */
const IRREGULAR: Readonly<Record<string, string>> = {
  written: "write",
  wrote: "write",
  built: "build",
  ran: "run",
  led: "lead",
  taught: "teach",
};

/** Reduce a word to the key both passages and questions are indexed by. */
export function stem(input: string): string {
  const word = IRREGULAR[input] ?? input;
  if (word.length <= 3 || /\d/.test(word)) return word;
  let key = word;
  const rule = SUFFIXES.find(([suffix, , minBase]) => word.endsWith(suffix) && word.length - suffix.length >= minBase);
  if (rule) {
    key = word.slice(0, -rule[0].length) + rule[1];
    if (DOUBLED.test(key)) key = key.slice(0, -1);
  } else if (word.endsWith("ed")) {
    key = word.slice(0, -1); // "used" → "use", "based" → "base"
  } else if (word.endsWith("s") && !/[aiosu]s$/.test(word)) {
    key = word.slice(0, -1); // a plural; "bias", "status" and "redis" keep their s
  }
  return key.length > 3 && key.endsWith("e") ? key.slice(0, -1) : key;
}

/** Lower-cased words with accents folded ("résumé" → "resume"); one-letter words dropped. */
function words(text: string): string[] {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);
}

/** The indexed terms of a text: its words without stopwords, stemmed. */
export function tokenize(text: string): string[] {
  return words(text)
    .filter((word) => !STOPWORDS.has(word))
    .map(stem);
}

/** Topic terms that make a question about measured results. */
const RESULT_TERMS: ReadonlySet<string> = new Set(
  tokenize("accuracy accurate score result benchmark metric evaluation eval measured performance"),
);

// ---------------------------------------------------------------------------
// Index (built once, at module load)
// ---------------------------------------------------------------------------

const CORPUS: readonly Passage[] = buildCorpus();
// Addresses stay in the text the model and the fallback read, but not in the
// index: "tradepulse-live.vercel.app" must not make TradePulse an answer to
// "Is the DBWhisper demo live?".
const WEB_ADDRESS = /\bhttps?:\/\/\S+/g;
const TERMS = CORPUS.map((passage) => tokenize((passage.searchText ?? passage.text).replace(WEB_ADDRESS, " ")));
const FREQUENCIES = TERMS.map((terms) => {
  const tf = new Map<string, number>();
  for (const term of terms) tf.set(term, (tf.get(term) ?? 0) + 1);
  return tf;
});
const DOCUMENT_FREQUENCY = new Map<string, number>();
for (const terms of TERMS) {
  for (const term of new Set(terms)) DOCUMENT_FREQUENCY.set(term, (DOCUMENT_FREQUENCY.get(term) ?? 0) + 1);
}
const AVERAGE_LENGTH = TERMS.reduce((sum, terms) => sum + terms.length, 0) / Math.max(1, CORPUS.length);

/** BM25 idf with the standard +0.5 smoothing. */
function idf(documents: number): number {
  return Math.log(1 + (CORPUS.length - documents + 0.5) / (documents + 0.5));
}

/** The weight of a word no passage uses: rarer than any word that exists. */
const UNKNOWN_WEIGHT = idf(0);

/** Each project's name as a question spells it, in words and as one token. */
const PROJECT_FORMS = PROJECT_NAMES.map((project) => {
  const parts = words(project.title);
  return { slug: project.slug, phrase: parts.join(" "), joined: parts.join(""), terms: new Set(parts.map(stem)) };
});

/** The passages that answer "What is <project>?": its overview and the opening of its case study. */
const PROJECT_SUMMARY = new Map(
  PROJECT_NAMES.map((project) => [
    project.slug,
    [
      CORPUS.findIndex((p) => p.kind === "project" && p.projects.includes(project.slug)),
      CORPUS.findIndex((p) => p.kind === "case-study" && p.projects.includes(project.slug)),
    ].filter((index) => index !== -1),
  ]),
);

const PROFILE = CORPUS.findIndex((passage) => passage.kind === "profile");

// ---------------------------------------------------------------------------
// Retrieval
// ---------------------------------------------------------------------------

/** What a question asks about, as retrieval reads it. */
type Reading = {
  /** Topic terms: the question's words minus stopwords and the names it uses. */
  content: string[];
  /** Terms of the project names it uses. */
  nameTerms: string[];
  /** Slugs of the projects it names. */
  projects: string[];
  /** It asks about a person: "he", "his", or Mubin's name. */
  person: boolean;
  /** It points back at an earlier question ("it", "that"). */
  refersBack: boolean;
  /** It asks about measured results ("how accurate", "score"). */
  asksForResults: boolean;
};

function read(question: string): Reading {
  const all = words(question);
  const spaced = ` ${all.join(" ")} `;
  const joined = all.join("");
  const named = PROJECT_FORMS.filter((p) => spaced.includes(` ${p.phrase} `) || joined.includes(p.joined));
  const nameTerms = new Set(named.flatMap((p) => [...p.terms, p.joined]));
  const terms = [...new Set(tokenize(question))];
  const content = terms.filter((term) => !nameTerms.has(term) && !PERSON.has(term));
  return {
    content,
    nameTerms: terms.filter((term) => nameTerms.has(term)),
    projects: named.map((p) => p.slug),
    person: all.some((word) => PERSON.has(word)),
    refersBack: all.some((word) => REFERS_BACK.has(word)),
    asksForResults: content.some((term) => RESULT_TERMS.has(term)),
  };
}

/** How strongly a passage's subject matches the question's, as a score multiplier. */
function subjectWeight(passage: Passage, q: Reading): number {
  let weight = 1;
  if (q.projects.length > 0 && passage.projects.length > 0) {
    const own = passage.projects.every((slug) => q.projects.includes(slug));
    const other = !passage.projects.some((slug) => q.projects.includes(slug));
    if (other) weight /= PROJECT_BOOST;
    else if (own && passage.kind !== "project") weight *= PROJECT_BOOST;
  } else if (q.projects.length === 0 && q.person && q.content.length <= SHORT_QUESTION_TERMS) {
    if (PERSON_KINDS.has(passage.kind)) weight *= PERSON_BOOST;
  }
  if (passage.kind === "evaluation" && q.asksForResults) {
    weight = passage.retired ? weight / RESULTS_BOOST : weight * RESULTS_BOOST;
  }
  return weight;
}

/** BM25 score of every passage for a set of terms, weighted by subject. */
function scoreAll(terms: readonly string[], q: Reading): number[] {
  return CORPUS.map((passage, i) => {
    const length = TERMS[i]!.length;
    if (length === 0) return 0;
    const norm = K1 * (1 - B + B * (length / AVERAGE_LENGTH));
    let score = 0;
    for (const term of terms) {
      const f = FREQUENCIES[i]!.get(term);
      if (!f) continue;
      score += idf(DOCUMENT_FREQUENCY.get(term)!) * ((f * (K1 + 1)) / (f + norm));
    }
    return score * subjectWeight(passage, q);
  });
}

/** The idf weight of the topic terms a passage contains. */
function matchedWeight(index: number, topic: readonly string[]): number {
  let weight = 0;
  for (const term of topic) {
    if (FREQUENCIES[index]!.has(term)) weight += idf(DOCUMENT_FREQUENCY.get(term)!);
  }
  return weight;
}

const withScore = (index: number, score: number, cited: boolean): RetrievedPassage => ({
  ...CORPUS[index]!,
  score,
  cited,
});

/**
 * Retrieve the passages that answer one question, best first.
 *
 * Deterministic and network-free. Returns [] when the question is not about
 * anything the site covers, so the route can say so instead of guessing.
 */
export function retrieve(question: string, { k = DEFAULT_K }: { k?: number } = {}): RetrievedPassage[] {
  const q = read(question);

  // 1) Only a name: the project's summary passages, or Mubin's profile.
  if (q.content.length === 0) {
    if (q.projects.length > 0) {
      const scores = scoreAll(q.nameTerms, q);
      return q.projects
        .flatMap((slug) => PROJECT_SUMMARY.get(slug) ?? [])
        .slice(0, k)
        .map((index) => withScore(index, scores[index]!, true));
    }
    if (q.person && PROFILE !== -1) return [withScore(PROFILE, 0, true)];
    return [];
  }

  // 2) Coverage: are the question's topic words words this site uses?
  const topic = q.content.filter((term) => DOCUMENT_FREQUENCY.has(term));
  const known = topic.reduce((sum, term) => sum + idf(DOCUMENT_FREQUENCY.get(term)!), 0);
  const unknown = (q.content.length - topic.length) * UNKNOWN_WEIGHT;
  if (known / (known + unknown) < MIN_COVERAGE) return [];

  // 3) Score with topic and name terms; a passage must match at least half of
  //    the topic weight itself, so "notice period" does not settle for a
  //    passage that only says "period".
  const scores = scoreAll([...topic, ...q.nameTerms], q);
  const ranked = scores
    .map((score, index) => ({ score, index }))
    .filter(({ index, score }) => score > 0 && matchedWeight(index, topic) >= MIN_COVERAGE * known)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const best = ranked[0]?.score ?? 0;
  const hits = ranked
    .filter(({ score }) => score >= RELATIVE_FLOOR * best)
    .slice(0, k)
    .map(({ index, score }) => withScore(index, score, true));

  // A named project's overview is always in the context: background, not a
  // citation, unless it scored on its own.
  for (const slug of q.projects) {
    const overview = PROJECT_SUMMARY.get(slug)?.[0];
    if (overview === undefined || hits.some((hit) => hit.id === CORPUS[overview]!.id)) continue;
    if (hits.length >= k) hits.pop();
    hits.push(withScore(overview, scores[overview]!, false));
  }
  return hits;
}

/**
 * Retrieve for the latest question of a conversation.
 *
 * Only the latest question is searched — unless it reads as a follow-up: it
 * names no project and either found nothing ("Tell me more") or points back
 * ("How was it deployed?"). Then the previous question and the latest one are
 * searched together, so "it" finds what the conversation is about.
 */
export function retrieveForQuestion(
  latest: string,
  earlier: readonly string[] = [],
  options: { k?: number } = {},
): RetrievedPassage[] {
  const hits = retrieve(latest, options);
  const previous = earlier[earlier.length - 1];
  if (!previous) return hits;
  const q = read(latest);
  if (q.projects.length > 0 || (hits.length > 0 && !q.refersBack)) return hits;
  const combined = retrieve(`${previous} ${latest}`, options);
  return combined.length > 0 ? combined : hits;
}

/** A grounded answer to serve verbatim when the model is unavailable. */
export type FallbackAnswer = { answer: string; passage: RetrievedPassage };

/**
 * Pick the passage to serve verbatim when the model is unavailable: the best
 * cited passage, or an FAQ answer when one scores within FAQ_PREFERENCE of it
 * (an FAQ answer is written to be read on its own). The title line is dropped:
 * the FAQ's question, or the label this index adds to every other passage.
 */
export function chooseFallback(passages: readonly RetrievedPassage[]): FallbackAnswer | null {
  const cited = passages.filter((passage) => passage.cited);
  const best = cited[0];
  if (!best) return null;
  const faq = cited.find((passage) => passage.kind === "faq" && passage.score >= FAQ_PREFERENCE * best.score);
  const passage = faq ?? best;
  const newline = passage.text.indexOf("\n");
  const answer = (newline >= 0 ? passage.text.slice(newline + 1) : passage.text).trim();
  return { answer, passage };
}

/** Total passages in the corpus — for the grounding test and diagnostics. */
export function corpusSize(): number {
  return CORPUS.length;
}

/** All passages (read-only) — for the grounding test and diagnostics. */
export function allPassages(): readonly Passage[] {
  return CORPUS;
}
