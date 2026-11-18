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
// (test/retrieval.test.mts, test/assistant-golden.test.mts) prove retrieval
// with zero model quota.
//
// A question is read before it is scored:
//
//   - its words are folded, and a misspelt name or topic word is corrected to
//     the site's own spelling (Damerau–Levenshtein: 1 edit for 5–8 letters,
//     2 for 9+), product names first: "dbwisper" → "dbwhisper";
//   - a small, content-backed alias map adds recall ("the NFC app" is CareLTC,
//     "CV" is the résumé); an alias never adds a fact;
//   - it is then judged relative to itself, not against a fixed score:
//
//   1. A question that only names a project, or only asks about Mubin, gets
//      that project's overview and case-study summary, or his profile.
//   2. Otherwise every topic word must be a word the site uses. A word the
//      site never uses is the most specific word a question can have, so a
//      question about it ("salary", "Kubernetes", a product the site does not
//      know) retrieves nothing and gets an honest "not covered" — the words
//      around it ("how many people use it") cannot answer it on their own.
//      A question that names a project is anchored by the name: its unknown
//      words are left to the answer, which says what the site does not cover.
//   3. A passage must match at least half of the topic weight itself — unless
//      it is the record of the project the question names, which the name
//      already makes relevant — and score within RELATIVE_FLOOR of the best
//      passage; the best k are kept.
// -----------------------------------------------------------------------------

import { resume } from "@/content/resume";
import { flagships } from "@/content/flagship";
import { uses } from "@/content/site";
import { SITE } from "@/config/site";
import { buildCorpus, COMMENTARY_KINDS, PROJECT_NAMES, type Passage } from "./corpus";

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

/**
 * Passages handed to the model per question. A question that names a product
 * also gets the product's overview, which takes the last place when it did not
 * score into the others.
 */
const DEFAULT_K = 5;

/** A passage must match at least this share of the question's topic weight itself. */
const MIN_COVERAGE = 0.5;

/** A passage must score at least this share of the best passage's score. */
const RELATIVE_FLOOR = 0.6;

/**
 * Multiplier for the site's own record of a project — a case study section,
 * an evaluation row, an FAQ answer about it — when the question names exactly
 * that project. A passage about a project the question does not name — its
 * record, or an essay or note that names only other projects — is divided by
 * it. Essays and notes are never boosted: they compete, but a question about
 * DBWhisper is answered from DBWhisper's write-up first. The overview is not
 * boosted either — it summarizes everything, so it would outrank the section
 * that actually answers, and it is in the context anyway (see `retrieve`) —
 * except for a question about the project's demo, source or usage, which it
 * answers (OVERVIEW_BOOST).
 */
const PROJECT_BOOST = 1.5;

/**
 * Multiplier for evaluation rows when a question asks about results ("How
 * accurate…", "What is the Spider score?"): the registry is where a figure,
 * its method and its scope live together. A retired row is multiplied by it
 * only when the question asks about that row — its retirement or its
 * benchmark ("What happened to the golden set?") — and divided by it
 * otherwise, whatever the question asks: a withdrawn result is never the lead
 * answer to "how accurate is it?" or "is it fail-closed?".
 */
const RESULTS_BOOST = 1.5;

/**
 * Multiplier for project overviews when a question asks whether a project can
 * be seen or tried ("Is TradePulse live?", "Does CrownWager have a demo?") or
 * how many people use it: the overview is the passage that states the demo
 * link, or that none is published, the source, and a flagship's approved
 * usage. When the question names the project, the overview also takes
 * PROJECT_BOOST, so it leads that project's case-study sections.
 */
const OVERVIEW_BOOST = 1.5;

/**
 * Multiplier for his profile, hiring, contact details, résumé, skills and the
 * indexes of his work and his writing when
 * a short question is about him ("Where does he work?"). Two topic words are
 * not enough for BM25 to tell "work" the job from "work" the essays.
 */
const PERSON_BOOST = 1.5;

/**
 * Multiplier for the passages of the page the assistant was opened on, when
 * the question names no other project: a mild prior, so "What broke?" asked on
 * a case study answers from that case study first without hiding the rest.
 * A question that points at the page itself ("What is this essay about?",
 * "How does it work?") takes the strong one: "this" is the page.
 */
const PAGE_BOOST = 1.3;
const THIS_PAGE_BOOST = 2;

/** A question with at most this many topic words is short enough for PERSON_BOOST. */
const SHORT_QUESTION_TERMS = 2;

/** The passage kinds that describe him rather than his projects. */
const PERSON_KINDS: ReadonlySet<Passage["kind"]> = new Set([
  "profile",
  "contact",
  "hire",
  "resume",
  "skills",
  "work-index",
  "writing-index",
]);

/** An FAQ answer is preferred for the fallback when it scores this close to the best passage. */
const FAQ_PREFERENCE = 0.9;

const K1 = 1.5; // term-frequency saturation
const B = 0.75; // length normalization

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

/**
 * Words that carry no topic: English glue, the filler of conversational and
 * recruiter questions ("tell me", "do you know", "give me a quick rundown"),
 * and the glue of Hinglish ("Mubin ne kaunse projects banaye hain?"). Without
 * the filler, a rare filler word outweighs the topic — "Does he know Docker?"
 * used to rank an essay first because it contains "know".
 */
const STOPWORDS = new Set(
  [
    // English glue
    "a an and are as at be but by can do does for from has have he her him his how i in is it its of on or " +
      "that the their them they this to was were what when which who why will with you your about into over " +
      "than then there these those we us our himself",
    // conversational and recruiter filler
    "tell me more know knows explain describe give show list please could would should may might must shall " +
      "did done doing where whom whose any some much many very really actually also just like get got see say " +
      "said anything something everything thing things kind sort lot bit if so not no yes all each every both " +
      "other such only own same too here been being am had having my mine she hers let lets want need help " +
      "hey hi hello thanks thank ok okay sure great nice again briefly brief short shorter simpler simply " +
      "summarize summarise summary elaborate expand detail details example examples rephrase mean means meant " +
      "answer answers question questions quick quickly rundown overview basically exactly specifically " +
      "good best interested curious wondering",
    // the task words of a comparison: "compare CareLTC and Bench Discovery" is about the two products
    "compare compared comparing comparison versus vs difference differences differ between contrast similar",
    // Hinglish glue
    "kya hai hain ka ki ke ko ne se mein aur bhi ye yeh wo woh kaun kaunsa kaunse kaunsi kaise kab kahan " +
      "kyun kyon kitna kitne kitni batao bataiye bata kuch sab uska uski uske iska iski apna apne hum mujhe " +
      "aap hota hoti hote raha rahe rahi tha thi karta karte karti kiya kiye wala wali wale",
  ]
    .join(" ")
    .split(" "),
);

/**
 * Words that make a question about him: the pronouns, his name, and how a
 * recruiter refers to someone ("this candidate").
 */
const PERSON = new Set(["he", "him", "his", "himself", "candidate", "guy", "person", ...words(SITE.name)]);

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
  using: "use",
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

/** The indexed terms of a list of words: without stopwords, stemmed. */
function termsOf(list: readonly string[]): string[] {
  return list.filter((word) => !STOPWORDS.has(word)).map(stem);
}

/** The indexed terms of a text: its words without stopwords, stemmed. */
export function tokenize(text: string): string[] {
  return termsOf(words(text));
}

/** Topic terms that make a question about measured results. */
const RESULT_TERMS: ReadonlySet<string> = new Set(
  tokenize("accuracy accurate score result benchmark metric evaluation eval measured performance"),
);

/**
 * Topic terms that ask what a project's overview states: whether it can be
 * seen or tried (its demo and source), how many people use it, and his role on
 * it. Not "repository": LLM Studio's "repository layer" is code.
 */
const OVERVIEW_TERMS: ReadonlySet<string> = new Set(
  tokenize("demo live try available link source repo status offline users usage role credit"),
);

/** Topic terms that ask about a withdrawn result as such. */
const RETIREMENT_TERMS: ReadonlySet<string> = new Set(tokenize("retired withdrawn audit"));

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

/** His profile: the answer to "Who is he?", and the background of every live answer. */
const PROFILE = CORPUS.findIndex((passage) => passage.id === "profile-summary");

/**
 * For each retired evaluation passage, the words that ask about it: the
 * retirement words, and the most distinctive word of its benchmark's name —
 * the one fewest passages use ("golden" in "Custom golden-query set"), not the
 * generic ones any SQL question uses ("query", "set").
 */
const RETIRED_SUBJECTS: ReadonlyMap<string, ReadonlySet<string>> = new Map(
  CORPUS.flatMap((passage) => {
    if (!passage.retired || !passage.benchmark) return [];
    const terms = [...new Set(tokenize(passage.benchmark))];
    const frequency = (term: string) => DOCUMENT_FREQUENCY.get(term) ?? 0;
    const rarest = Math.min(...terms.map(frequency));
    const distinctive = terms.filter((term) => frequency(term) === rarest);
    return [[passage.id, new Set([...RETIREMENT_TERMS, ...distinctive])] as const];
  }),
);

/** The path of a site link without its in-page anchor: "/evals#x" → "/evals". */
const pathOf = (href: string): string => href.split("#", 1)[0]!;

/** The pages each passage cites, without anchors, for the page prior. */
const PASSAGE_PAGES: readonly ReadonlySet<string>[] = CORPUS.map(
  (passage) => new Set(passage.links.map((link) => pathOf(link.href))),
);

// ---------------------------------------------------------------------------
// Spelling: correct a word the index does not know to one it does
// ---------------------------------------------------------------------------

/**
 * The words a misspelling may be corrected to: the products' and projects'
 * names (as words and joined, "careltc", "benchdiscovery"), his name, and the
 * words of every passage title — the words visitors ask with — plus the tools
 * the skills, stacks and /uses list. Not every word on the site: a correction
 * to a common word ("married" → "carried") would answer a question nobody
 * asked, so only names and topic words are candidates.
 */
const NAME_WORDS: ReadonlySet<string> = new Set([
  ...PROJECT_FORMS.flatMap((p) => [...p.phrase.split(" "), p.joined]),
  ...words(SITE.name),
]);

const CORRECTABLE: readonly string[] = [
  ...new Set([
    ...NAME_WORDS,
    ...CORPUS.flatMap((p) => words(p.text.slice(0, Math.max(0, p.text.indexOf("\n"))))),
    ...resume.skills.flatMap((g) => words(g.items)),
    ...flagships.flatMap((f) => [...f.stack.groups.flatMap((g) => g.items), ...f.stack.aws].flatMap(words)),
    ...uses.groups.flatMap((g) => g.items.flatMap(words)),
  ]),
].filter((word) => word.length >= 4 && !STOPWORDS.has(word) && !/\d/.test(word));

/** The most edits a word of this length may be from its correction. */
const editBudget = (length: number): number => (length >= 9 ? 2 : length >= 5 ? 1 : 0);

/**
 * Optimal-string-alignment Damerau–Levenshtein distance: insertions, deletions,
 * substitutions and adjacent transpositions ("carelct" → "careltc" is 1).
 * Returns `max + 1` as soon as the distance must exceed `max`.
 */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before = new Array<number>(b.length + 1).fill(0);
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  let current = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, before[j - 2]! + 1);
      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > max) return max + 1;
    [before, previous, current] = [previous, current, before];
  }
  return previous[b.length]!;
}

/** True when a word is one retrieval can use as it is. */
const isKnownWord = (word: string): boolean =>
  STOPWORDS.has(word) || PERSON.has(word) || NAME_WORDS.has(word) || DOCUMENT_FREQUENCY.has(stem(word));

const corrections = new Map<string, string | null>();

/**
 * The site's spelling of a word it does not know, or null. Names first: when
 * a word is as close to a product's name as to a topic word, it is the name.
 */
export function correctWord(word: string): string | null {
  const cached = corrections.get(word);
  if (cached !== undefined) return cached;
  let best: { word: string; distance: number; name: boolean; frequency: number } | null = null;
  const budget = editBudget(word.length);
  if (budget > 0 && !isKnownWord(word)) {
    for (const candidate of CORRECTABLE) {
      const distance = editDistance(word, candidate, budget);
      if (distance > budget) continue;
      const name = NAME_WORDS.has(candidate);
      const frequency = DOCUMENT_FREQUENCY.get(stem(candidate)) ?? 0;
      const better =
        !best ||
        distance < best.distance ||
        (distance === best.distance && name && !best.name) ||
        (distance === best.distance && name === best.name && frequency > best.frequency);
      if (better) best = { word: candidate, distance, name, frequency };
    }
  }
  const correction = best?.word ?? null;
  if (corrections.size > 5_000) corrections.clear();
  corrections.set(word, correction);
  return correction;
}

// ---------------------------------------------------------------------------
// Aliases: how visitors name things the site names differently
// ---------------------------------------------------------------------------

/**
 * A phrase a visitor uses and what it means on this site. Content-backed:
 * each target is a product in the registry or words the index contains
 * (test/retrieval.test.mts checks both). An alias adds recall, never a fact.
 *
 * - `project`: a product the site names differently ("the NFC app" is
 *   CareLTC). The phrase then reads like the product's name.
 * - `means`: what the visitor's word means here ("CV" is the résumé). It
 *   replaces the phrase, and applies only when no product is named: "What's
 *   CareLTC's stack?" asks about CareLTC's stack, not his skills list.
 * - `adds`: more words to search for ("available" also searches for
 *   availability and hiring), with the same rule unless `withProject`
 *   ("how many people use CareLTC?" searches for its usage).
 *
 * A phrase matches when its words occur in order in the question, or in the
 * question without its filler ("people are using it" matches "people use").
 */
type Alias = { phrase: string; project?: string; means?: string; adds?: string; withProject?: true };

const ALIASES: readonly Alias[] = [
  { phrase: "nfc app", project: "careltc" },
  { phrase: "nfc rounds", project: "careltc" },
  { phrase: "nurse rounds", project: "careltc" },
  { phrase: "rounding app", project: "careltc" },
  { phrase: "document discovery", project: "bench-discovery" },
  { phrase: "desktop app", project: "bench-discovery" },
  { phrase: "redaction app", project: "bench-discovery" },
  { phrase: "ask bench", project: "bench-discovery" },
  { phrase: "e-signature", project: "signflow" },
  { phrase: "esignature", project: "signflow" },
  { phrase: "e signature", project: "signflow" },
  { phrase: "signing app", project: "signflow" },
  { phrase: "signing platform", project: "signflow" },
  { phrase: "docusign", project: "signflow" },
  { phrase: "cv", means: "resume" },
  { phrase: "curriculum vitae", means: "resume" },
  { phrase: "tech stack", means: "skills" },
  { phrase: "stack", means: "skills" },
  { phrase: "technologies", means: "skills" },
  { phrase: "kaam", means: "work" },
  { phrase: "banaya", means: "built" },
  { phrase: "banaye", means: "built" },
  { phrase: "banayi", means: "built" },
  { phrase: "available", adds: "availability hiring" },
  { phrase: "open to", adds: "availability hiring roles" },
  { phrase: "hire", adds: "availability hiring" },
  { phrase: "hiring", adds: "availability roles" },
  { phrase: "remote", adds: "hybrid on-site" },
  { phrase: "his github", adds: "profiles" },
  { phrase: "mubin github", adds: "profiles" },
  { phrase: "github profile", adds: "profiles" },
  { phrase: "his linkedin", adds: "profiles" },
  { phrase: "mubin linkedin", adds: "profiles" },
  { phrase: "linkedin profile", adds: "profiles" },
  { phrase: "people use", adds: "users usage", withProject: true },
  { phrase: "user base", adds: "users usage", withProject: true },
  { phrase: "tap", adds: "tag", withProject: true },
  { phrase: "video", adds: "recording", withProject: true },
  { phrase: "videos", adds: "recording", withProject: true },
  { phrase: "screenshots", adds: "screens", withProject: true },
  { phrase: "did he build", adds: "role owns", withProject: true },
  { phrase: "did mubin build", adds: "role owns", withProject: true },
  { phrase: "he built", adds: "role owns", withProject: true },
  { phrase: "mubin built", adds: "role owns", withProject: true },
  { phrase: "his contribution", adds: "role owns", withProject: true },
  { phrase: "his part", adds: "role owns", withProject: true },
];

const ALIAS_FORMS = ALIASES.map((alias) => ({
  ...alias,
  phraseWords: words(alias.phrase),
  /** The terms the alias stands for (`means`) or adds (`adds`). */
  target: tokenize(alias.means ?? alias.adds ?? ""),
}));

/**
 * Words that, beside a product's name, refer to the product itself: "tell me
 * about the Bench Discovery app", "how does CareLTC work?". They are left out
 * of such a question's topic, which is then the product's summary.
 */
const GENERIC_WHEN_NAMED: ReadonlySet<string> = new Set(
  tokenize("app apps application product project system platform tool software solution work works working"),
);

/** True when `phrase` occurs in `list` as consecutive entries. */
function occursIn(list: readonly string[], phrase: readonly string[]): boolean {
  if (phrase.length === 0 || phrase.length > list.length) return false;
  for (let i = 0; i + phrase.length <= list.length; i++) {
    if (phrase.every((word, j) => list[i + j] === word)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Reading a question
// ---------------------------------------------------------------------------

/** What a question asks about, as retrieval reads it. */
type Reading = {
  /** Topic terms: the question's terms minus the names it uses and the words for him. */
  content: string[];
  /** Topic terms the index does not contain, after spelling and aliases. */
  unknown: string[];
  /** Terms of the project names it uses (and of the projects its aliases name). */
  nameTerms: string[];
  /** Slugs of the projects it names. */
  projects: string[];
  /** It asks about a person: "he", "his", Mubin's name, "the candidate". */
  person: boolean;
  /** It points back at an earlier question ("it", "that"). */
  refersBack: boolean;
  /** It asks about measured results ("how accurate", "score"). */
  asksForResults: boolean;
  /** It asks what an overview states: a demo, the source, the usage. */
  asksForOverview: boolean;
  /**
   * The most specific topic term (the one fewest passages contain), not
   * counting an alias's own words, or null when the question asks by name.
   */
  anchor: string | null;
  /** A word was corrected to the site's spelling. */
  corrected: boolean;
};

/** The words without filler, irregular forms regularized: "people are using it" → people, use. */
const withoutFiller = (list: readonly string[]): string[] =>
  list.filter((word) => !STOPWORDS.has(word)).map((word) => IRREGULAR[word] ?? word);

/**
 * Read a question. `implied` is a product the question is about without
 * naming it: the case study it was asked on, when it points at the page.
 */
function read(question: string, implied: string | null = null): Reading {
  let corrected = false;
  const all = words(question).map((word) => {
    const fix = correctWord(word);
    if (fix === null) return word;
    corrected = true;
    return fix;
  });
  const spaced = ` ${all.join(" ")} `;
  const joined = all.join("");
  const bare = withoutFiller(all);
  const matches = ALIAS_FORMS.filter((alias) => occursIn(all, alias.phraseWords) || occursIn(bare, alias.phraseWords));

  const named = PROJECT_FORMS.filter((p) => spaced.includes(` ${p.phrase} `) || joined.includes(p.joined));
  const productAliases = matches.filter((a) => a.project !== undefined);
  const projects = [
    ...new Set([...named.map((p) => p.slug), ...productAliases.map((a) => a.project!), ...(implied ? [implied] : [])]),
  ];
  const topicAliases = matches.filter((a) => a.project === undefined && (projects.length === 0 || a.withProject));

  // A product alias reads like the product's name.
  const nameTerms = new Set([
    ...PROJECT_FORMS.filter((p) => projects.includes(p.slug)).flatMap((p) => [...p.terms, p.joined]),
    ...productAliases.flatMap((a) => termsOf(a.phraseWords)),
  ]);
  // A synonym replaces the visitor's words; an expansion adds to them. Either
  // way the alias's own words are understood, so they never count as unknown,
  // and they are never the question's most specific word.
  const replaced = new Set(topicAliases.filter((a) => a.means).flatMap((a) => termsOf(a.phraseWords)));
  const aliasWords = new Set(topicAliases.flatMap((a) => termsOf(a.phraseWords)));
  const terms = [...new Set([...termsOf(all).filter((t) => !replaced.has(t)), ...topicAliases.flatMap((a) => a.target)])];
  const content = terms.filter(
    (term) => !nameTerms.has(term) && !PERSON.has(term) && !(projects.length > 0 && GENERIC_WHEN_NAMED.has(term)),
  );
  const known = content.filter((term) => DOCUMENT_FREQUENCY.has(term));
  const person = all.some((word) => PERSON.has(word));

  let anchor: string | null = null;
  for (const term of known) {
    if (aliasWords.has(term)) continue;
    if (anchor === null || DOCUMENT_FREQUENCY.get(term)! < DOCUMENT_FREQUENCY.get(anchor)!) anchor = term;
  }
  return {
    content: known,
    unknown: content.filter((term) => !DOCUMENT_FREQUENCY.has(term) && !aliasWords.has(term)),
    nameTerms: [...nameTerms].filter((term) => DOCUMENT_FREQUENCY.has(term)),
    projects,
    person,
    refersBack: all.some((word) => REFERS_BACK.has(word)),
    asksForResults: content.some((term) => RESULT_TERMS.has(term)),
    // "Is he available?" is about hiring him, not about a project's demo.
    asksForOverview: content.some((term) => OVERVIEW_TERMS.has(term)) && !(person && projects.length === 0),
    anchor,
    corrected,
  };
}

/**
 * True when the passage is the site's own record of the projects the question
 * names (not commentary on them): the question's name alone makes it relevant.
 */
function isRecordOf(passage: Passage, q: Reading): boolean {
  return (
    q.projects.length > 0 &&
    passage.projects.length > 0 &&
    !COMMENTARY_KINDS.has(passage.kind) &&
    passage.projects.every((slug) => q.projects.includes(slug))
  );
}

/** How strongly a passage's subject matches the question's, as a score multiplier. */
function subjectWeight(index: number, q: Reading, page: string | null): number {
  const passage = CORPUS[index]!;
  let weight = 1;
  if (q.projects.length > 0 && passage.projects.length > 0) {
    const other = !passage.projects.some((slug) => q.projects.includes(slug));
    // The overview is the section that answers a demo or usage question, so it
    // is boosted like the rest of the record then, and only then.
    const answers = passage.kind !== "project" || q.asksForOverview;
    if (other) weight /= PROJECT_BOOST;
    else if (isRecordOf(passage, q) && answers) weight *= PROJECT_BOOST;
  } else if (q.projects.length > 0 && passage.kind !== "evaluation-guide") {
    // A passage about no product (his skills, the tools he uses, his profile)
    // is background to a question about one: the product's record answers it.
    weight /= PROJECT_BOOST;
  } else if (q.projects.length === 0 && q.person && q.content.length <= SHORT_QUESTION_TERMS) {
    if (PERSON_KINDS.has(passage.kind)) weight *= PERSON_BOOST;
  }
  if (passage.kind === "project" && q.asksForOverview) weight *= OVERVIEW_BOOST;
  if (passage.kind === "evaluation") {
    if (passage.retired) {
      const subject = RETIRED_SUBJECTS.get(passage.id);
      const asksAboutIt = q.content.some((term) => subject?.has(term));
      weight = asksAboutIt ? weight * RESULTS_BOOST : weight / RESULTS_BOOST;
    } else if (q.asksForResults) {
      weight *= RESULTS_BOOST;
    }
  }
  if (page && q.projects.length === 0 && PASSAGE_PAGES[index]!.has(page)) {
    weight *= q.refersBack ? THIS_PAGE_BOOST : PAGE_BOOST;
  }
  return weight;
}

/** BM25 score of every passage for a set of terms, weighted by subject. */
function scoreAll(terms: readonly string[], q: Reading, page: string | null): number[] {
  return CORPUS.map((_, i) => {
    const length = TERMS[i]!.length;
    if (length === 0) return 0;
    const norm = K1 * (1 - B + B * (length / AVERAGE_LENGTH));
    let score = 0;
    for (const term of terms) {
      const f = FREQUENCIES[i]!.get(term);
      if (!f) continue;
      score += idf(DOCUMENT_FREQUENCY.get(term)!) * ((f * (K1 + 1)) / (f + norm));
    }
    return score * subjectWeight(i, q, page);
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

/** Options for one search. */
export type SearchOptions = {
  k?: number;
  /** The site page the assistant was opened on (already validated), for the page prior. */
  page?: string | null;
};

/** Retrieval for one reading of a question. */
function retrieveReading(q: Reading, { k = DEFAULT_K, page = null }: SearchOptions): RetrievedPassage[] {
  const pagePath = page ? pathOf(page) : null;

  // The summary of the named projects: their overviews and the openings of their case studies.
  const summary = (): RetrievedPassage[] => {
    const scores = scoreAll(q.nameTerms, q, pagePath);
    return q.projects
      .flatMap((slug) => PROJECT_SUMMARY.get(slug) ?? [])
      .slice(0, k)
      .map((index) => withScore(index, scores[index]!, true));
  };

  // 1) Only a name: the project's summary passages, or Mubin's profile. A
  //    question that names a project but asks with words the site does not
  //    use gets the summary too: the name is what it is about.
  if (q.content.length === 0) {
    if (q.projects.length > 0) return summary();
    if (q.person && q.unknown.length === 0 && PROFILE !== -1) return [withScore(PROFILE, 0, true)];
    return [];
  }

  // 2) Coverage: a topic word the site never uses is the most specific word
  //    in the question, so unless a project's name anchors it, the question is
  //    about something the site does not cover.
  if (q.projects.length === 0 && q.unknown.length > 0) return [];
  const topic = q.content;
  const known = topic.reduce((sum, term) => sum + idf(DOCUMENT_FREQUENCY.get(term)!), 0);

  // 3) Score with topic and name terms; a passage must match at least half of
  //    the topic weight itself, so "notice period" does not settle for a
  //    passage that only says "period". The record of a project the question
  //    names is exempt: a rare word elsewhere ("act", "handle") must not
  //    filter out the project the question is about.
  const scores = scoreAll([...topic, ...q.nameTerms], q, pagePath);
  // A named project whose record matches none of the topic words: its name
  // alone would rank its shortest passages first, so answer from its summary.
  const recordMatches = CORPUS.some((passage, index) => isRecordOf(passage, q) && matchedWeight(index, topic) > 0);
  if (q.projects.length > 0 && !recordMatches) return summary();
  const ranked = scores
    .map((score, index) => ({ score, index }))
    .filter(
      ({ index, score }) =>
        score > 0 && (isRecordOf(CORPUS[index]!, q) || matchedWeight(index, topic) >= MIN_COVERAGE * known),
    )
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const best = ranked[0]?.score ?? 0;
  const floor = RELATIVE_FLOOR * best;
  const hits = ranked
    .filter(({ score }) => score >= floor)
    .slice(0, k)
    .map(({ index, score }) => withScore(index, score, true));

  // A named project's overview is always in the context. It is cited when it
  // scores within the floor, and is background otherwise.
  for (const slug of q.projects) {
    const overview = PROJECT_SUMMARY.get(slug)?.[0];
    if (overview === undefined || hits.some((hit) => hit.id === CORPUS[overview]!.id)) continue;
    if (hits.length >= k) hits.pop();
    const score = scores[overview]!;
    hits.push(withScore(overview, score, score > 0 && score >= floor));
  }
  return hits;
}

/**
 * Retrieve the passages that answer one question, best first.
 *
 * Deterministic and network-free. Returns [] when the question is not about
 * anything the site covers, so the route can say so instead of guessing.
 */
export function retrieve(question: string, options: SearchOptions = {}): RetrievedPassage[] {
  return retrieveReading(read(question), options);
}

/**
 * A question that continues an earlier one rather than starting a topic: it
 * names no project and either finds nothing on its own ("Tell me more") or
 * points back ("How was it deployed?").
 */
function isFollowUp(q: Reading, hits: readonly RetrievedPassage[]): boolean {
  return q.projects.length === 0 && (hits.length === 0 || q.refersBack);
}

/** The essay or note a page is, as its path, or null: "/writing/trust-is-not-a-safety-model". */
function articleOfPage(page: string | null): string | null {
  const path = page ? pathOf(page) : null;
  return path && /^\/(?:writing|notes)\/[a-z0-9-]+$/.test(path) ? path : null;
}

/**
 * A question about the essay or note it was asked on ("What is this essay
 * about?"), answered from that piece only: its passages ranked by the
 * question's topic words, or in page order when none match.
 */
function retrieveFromArticle(q: Reading, article: string, k: number): RetrievedPassage[] {
  const own = CORPUS.map((_, index) => index).filter((index) => PASSAGE_PAGES[index]!.has(article));
  const scores = scoreAll(q.content, q, null);
  const ranked = own.filter((index) => scores[index]! > 0).sort((a, b) => scores[b]! - scores[a]! || a - b);
  return (ranked.length > 0 ? ranked : own).slice(0, k).map((index) => withScore(index, scores[index]!, true));
}

/** The product whose case study a page is, or null: "/work/careltc#what-broke" → "careltc". */
function projectOfPage(page: string | null): string | null {
  const slug = page ? /^\/work\/([a-z0-9-]+)$/.exec(pathOf(page))?.[1] : undefined;
  return slug && PROJECT_NAMES.some((p) => p.slug === slug) ? slug : null;
}

/** What a search found, and how. */
export type SiteSearch = {
  passages: RetrievedPassage[];
  /** A misspelt word was corrected to the site's spelling. */
  corrected: boolean;
  /**
   * The question's most specific topic term (the rarest one), or null when it
   * asks by name only. The fallback prefers a passage that contains it.
   */
  anchor: string | null;
  /** The question asks about something at all: a name, or a word that is not filler ("hi" does not). */
  topical: boolean;
};

/**
 * Search for the latest question of a conversation.
 *
 * Only the latest question is searched — unless it is a follow-up. Then it is
 * searched together with the earlier questions it continues: back through any
 * follow-ups before it, to the question that set the topic. "What does
 * DBWhisper do?" → "How was it deployed?" → "Tell me more" still searches
 * DBWhisper on the third turn, while a question that changed the subject
 * ("Where does he work?") ends the chain there.
 */
export function searchSite(latest: string, earlier: readonly string[] = [], options: SearchOptions = {}): SiteSearch {
  let q = read(latest);
  // The first question asked on a case study that points at the page ("How
  // does it work?") is about that product; later, "it" is the conversation's.
  const onPage = projectOfPage(options.page ?? null);
  const pointsAtPage = earlier.length === 0 && q.projects.length === 0 && q.refersBack;
  if (onPage && pointsAtPage) q = read(latest, onPage);
  // …and on an essay or a note, "this" is that piece.
  const article = pointsAtPage ? articleOfPage(options.page ?? null) : null;
  if (article) {
    return { passages: retrieveFromArticle(q, article, options.k ?? DEFAULT_K), corrected: q.corrected, anchor: q.anchor, topical: true };
  }
  const hits = retrieveReading(q, options);
  // A question with a word of its own the site never uses ("What's the
  // weather?") is not a follow-up, whatever came before it.
  if (q.projects.length === 0 && q.unknown.length > 0) {
    return { passages: [], corrected: q.corrected, anchor: q.anchor, topical: true };
  }
  const topical = q.projects.length > 0 || q.content.length > 0 || q.unknown.length > 0 || q.person;
  const own = { passages: hits, corrected: q.corrected, anchor: q.anchor, topical };
  if (!isFollowUp(q, hits)) return own;
  const thread: string[] = [];
  for (let i = earlier.length - 1; i >= 0; i--) {
    const question = earlier[i]!;
    thread.unshift(question);
    const before = read(question);
    if (!isFollowUp(before, retrieveReading(before, options))) break;
  }
  if (thread.length === 0) return own;
  const combined = read([...thread, latest].join(" "));
  const passages = retrieveReading(combined, options);
  if (passages.length === 0) return own;
  return { passages, corrected: q.corrected || combined.corrected, anchor: q.anchor ?? combined.anchor, topical };
}

/** The passages for the latest question of a conversation (see `searchSite`). */
export function retrieveForQuestion(
  latest: string,
  earlier: readonly string[] = [],
  options: SearchOptions = {},
): RetrievedPassage[] {
  return searchSite(latest, earlier, options).passages;
}

/** A grounded answer to serve verbatim when the model is unavailable. */
export type FallbackAnswer = { answer: string; passage: RetrievedPassage };

/**
 * Pick the passage to serve verbatim when the model is unavailable: the best
 * cited passage — preferring one that contains the question's anchor, its
 * most specific term — or an FAQ answer when one scores within FAQ_PREFERENCE
 * of it (an FAQ answer is written to be read on its own). The title line is
 * dropped: the FAQ's question, or the label this index adds to every other
 * passage.
 *
 * Every cited passage already addresses the question's topic: it matches at
 * least half of the topic's weight, or it is the record of the project the
 * question names (`retrieve`), and a question whose most specific word the
 * site does not use retrieves nothing at all.
 */
export function chooseFallback(passages: readonly RetrievedPassage[], anchor: string | null = null): FallbackAnswer | null {
  const cited = passages.filter((passage) => passage.cited);
  const anchored = anchor === null ? [] : cited.filter((passage) => tokenize(passage.text).includes(anchor));
  const best = anchored[0] ?? cited[0];
  if (!best) return null;
  const faq = (anchored.length > 0 ? anchored : cited).find(
    (passage) => passage.kind === "faq" && passage.score >= FAQ_PREFERENCE * best.score,
  );
  const passage = faq ?? best;
  const newline = passage.text.indexOf("\n");
  const answer = (newline >= 0 ? passage.text.slice(newline + 1) : passage.text).trim();
  return { answer, passage };
}

/** His profile passage: the background of every live answer (null only if the corpus has none). */
export function backgroundProfile(): Passage | null {
  return PROFILE === -1 ? null : CORPUS[PROFILE]!;
}

/** Passages by id, in the order given, as cited passages: what the router chose. Unknown ids are skipped. */
export function passagesById(ids: readonly string[]): RetrievedPassage[] {
  return ids.flatMap((id) => {
    const index = CORPUS.findIndex((passage) => passage.id === id);
    return index === -1 ? [] : [withScore(index, 0, true)];
  });
}

/** Total passages in the corpus — for the grounding test and diagnostics. */
export function corpusSize(): number {
  return CORPUS.length;
}

/** All passages (read-only) — for the grounding test, the router's index and diagnostics. */
export function allPassages(): readonly Passage[] {
  return CORPUS;
}
