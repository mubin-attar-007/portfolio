// -----------------------------------------------------------------------------
// Local, dependency-free retrieval over /content.
//
// The chatbot is RETRIEVAL-FIRST: before any LLM is involved, we find the
// most relevant real passages from Mubin's own site content. This module
// ingests /content at import time into a corpus of `Passage`s, builds a BM25
// lexical index over them, and exposes `retrieve(query, k)`.
//
// No embedding API, no network, no dependencies — it runs identically on the
// server route and in a plain `node`/`tsx` test, which is what makes the
// grounding proof (lib/ai/test-questions.ts) work even at zero LLM quota.
//
// Sources are ingested from three real origins:
//   1. content/faq.json          — 14 grounded Q&A (highest-signal)
//   2. content/projects/*.mdx     — case studies, chunked by ## h2 section
//   3. profile / resume / skills  — bio, roles, education, skill groups
// -----------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import path from "node:path";

import faqData from "@/content/faq.json";
import profileData from "@/content/profile.json";
import resumeData from "@/content/resume.json";
import skillsData from "@/content/skills.json";
import projectsData from "@/content/projects.json";

/** A single retrievable unit of real site content. */
export type Passage = {
  /** stable id, e.g. "faq-2" or "cs-dbwhisper-architecture" */
  id: string;
  /** the retrievable body text (question+answer, or a case-study section) */
  text: string;
  /** human-readable origin, e.g. "DBWhisper case study — Architecture" */
  source: string;
  /** coarse kind, useful for weighting / debugging */
  kind: "faq" | "case-study" | "profile" | "resume" | "skills";
};

export type RetrievedPassage = Passage & { score: number };

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

/**
 * A tiny, self-contained set of very common English words. Dropping these
 * keeps BM25 focused on content terms (e.g. "validator", "tenancy", "Kelly")
 * rather than glue words. Intentionally small — over-stemming hurts recall.
 */
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does",
  "for", "from", "has", "have", "he", "her", "him", "his", "how", "i", "in",
  "is", "it", "its", "of", "on", "or", "that", "the", "their", "them", "they",
  "this", "to", "was", "were", "what", "when", "which", "who", "why", "will",
  "with", "you", "your", "about", "into", "over", "than", "then", "there",
  "these", "those", "we", "us", "our",
]);

/** Lowercase, split on non-alphanumerics, drop stopwords + 1-char tokens. */
function tokenize(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ");
  const out: string[] = [];
  for (const t of raw) {
    if (t.length < 2) continue;
    if (STOPWORDS.has(t)) continue;
    out.push(t);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Corpus construction (runs once, at module load)
// ---------------------------------------------------------------------------

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

/** Split a case-study MDX body into `{ heading, body }` chunks by ## h2. */
function chunkMdxByH2(source: string): { heading: string; body: string }[] {
  // Drop YAML frontmatter.
  const withoutFm = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const chunks: { heading: string; body: string }[] = [];
  const re = /^##\s+(.+?)\s*$/gm;
  const matches: { heading: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(withoutFm)) !== null) {
    matches.push({ heading: m[1].trim(), start: m.index, end: re.lastIndex });
  }
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const bodyStart = cur.end;
    const bodyEnd = next ? next.start : withoutFm.length;
    const body = withoutFm.slice(bodyStart, bodyEnd).trim();
    if (body) chunks.push({ heading: cur.heading, body });
  }
  return chunks;
}

/** Strip MDX/markdown noise so the retrieval text is clean prose. */
function stripMarkdown(md: string): string {
  return md
    // fenced code blocks → keep inner text (schematics carry table/keyword names)
    .replace(/```[a-z]*\n?/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>|]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function buildCorpus(): Passage[] {
  const passages: Passage[] = [];

  // 1) FAQ — the highest-signal source. Each item is one passage.
  faqData.faq.forEach((item, i) => {
    passages.push({
      id: `faq-${i}`,
      text: `${item.question}\n${item.answer}`,
      // The FAQ already carries a precise, human-readable source string.
      source: `FAQ — ${item.source}`,
      kind: "faq",
    });
  });

  // 2) Case studies — chunk each MDX by ## h2 section.
  const projectMeta = projectsData.projects;
  for (const proj of projectMeta) {
    let source: string;
    try {
      source = readFileSync(path.join(PROJECTS_DIR, `${proj.slug}.mdx`), "utf8");
    } catch {
      continue; // if an MDX file is missing, skip it rather than crash
    }
    const sections = chunkMdxByH2(source);
    for (const sec of sections) {
      const clean = stripMarkdown(sec.body);
      if (!clean) continue;
      passages.push({
        id: `cs-${proj.slug}-${sec.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        // Prefix with project + heading so those terms weigh in retrieval.
        text: `${proj.name} — ${sec.heading}\n${clean}`,
        source: `${proj.name} case study — ${sec.heading}`,
        kind: "case-study",
      });
    }
  }

  // 3) Profile / summary / ethos.
  passages.push({
    id: "profile-summary",
    text: [
      profileData.name,
      profileData.role,
      profileData.focus,
      profileData.tagline,
      profileData.ethos,
      profileData.summary,
      `Based in ${profileData.location}.`,
    ].join("\n"),
    source: "Profile — summary & ethos",
    kind: "profile",
  });

  // 4) Résumé — one passage per role, plus education.
  for (const exp of resumeData.experience) {
    passages.push({
      id: `resume-${exp.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      text: [
        `${exp.role} at ${exp.company} (${exp.period}), ${exp.place}.`,
        ...exp.points,
      ].join("\n"),
      source: `Résumé — ${exp.company} (${exp.role})`,
      kind: "resume",
    });
  }
  passages.push({
    id: "resume-education",
    text: `${resumeData.education.degree}, ${resumeData.education.school} (${resumeData.education.year}). Education and academic background.`,
    source: "Résumé — Education",
    kind: "resume",
  });

  // 5) Skills — one passage per group so a skill query hits the right group.
  for (const group of skillsData.skills) {
    passages.push({
      id: `skills-${group.group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      text: `Skills — ${group.group}: ${group.items.join(", ")}.`,
      source: `Skills — ${group.group}`,
      kind: "skills",
    });
  }

  return passages;
}

// ---------------------------------------------------------------------------
// BM25 index (built once, at module load)
// ---------------------------------------------------------------------------

const K1 = 1.5; // term-frequency saturation
const B = 0.75; // length normalization

type Index = {
  passages: Passage[];
  tokens: string[][]; // tokenized text per passage
  df: Map<string, number>; // document frequency per term
  docLen: number[]; // token count per passage
  avgDocLen: number;
  N: number;
};

function buildIndex(passages: Passage[]): Index {
  const tokens = passages.map((p) => tokenize(p.text));
  const df = new Map<string, number>();
  for (const toks of tokens) {
    for (const term of new Set(toks)) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  const docLen = tokens.map((t) => t.length);
  const totalLen = docLen.reduce((a, b) => a + b, 0);
  const N = passages.length;
  return {
    passages,
    tokens,
    df,
    docLen,
    avgDocLen: N > 0 ? totalLen / N : 0,
    N,
  };
}

// Idempotent module-level singletons.
const CORPUS: Passage[] = buildCorpus();
const INDEX: Index = buildIndex(CORPUS);

/** BM25 idf with the standard +0.5 smoothing (clamped non-negative). */
function idf(term: string): number {
  const n = INDEX.df.get(term) ?? 0;
  if (n === 0) return 0;
  return Math.max(0, Math.log(1 + (INDEX.N - n + 0.5) / (n + 0.5)));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Empirically-tuned BM25 relevance floor. A passage must clear this score to be
 * considered a real match; below it the query is treated as off-topic and we
 * return [] so the route can honestly say "that's not on the site" instead of
 * streaming a weakly-related FAQ.
 *
 * Tuned against the grounding proof set (lib/ai/test-questions.ts): every one of
 * the 10 on-topic questions still clears this floor (the weakest — the education
 * question — scores ~4.9), while clearly off-topic queries (salary, security
 * clearance, weather, visa/relocation, …) all fall below it and return []. See
 * test/retrieval.test.mts for the on-topic-pass / off-topic-refuse assertions.
 */
export const RELEVANCE_MIN_SCORE = 4.5;

export type RetrieveOptions = {
  /** how many passages to return (default 4) */
  k?: number;
  /**
   * Minimum BM25 score to include a passage. Defaults to RELEVANCE_MIN_SCORE so
   * off-topic queries return [] rather than a weakly-related best-effort hit.
   * Pass 0 explicitly to disable the floor (e.g. diagnostics).
   */
  minScore?: number;
};

/**
 * Retrieve the top-k real passages for a query, ranked by BM25.
 * Deterministic and network-free. Returns [] when the corpus is empty OR when
 * nothing clears the relevance floor (an off-topic query).
 */
export function retrieve(query: string, opts: RetrieveOptions = {}): RetrievedPassage[] {
  const k = opts.k ?? 4;
  const minScore = opts.minScore ?? RELEVANCE_MIN_SCORE;

  const qTerms = tokenize(query);
  if (qTerms.length === 0 || INDEX.N === 0) return [];

  // Score every passage.
  const scored: RetrievedPassage[] = INDEX.passages.map((p, i) => {
    const toks = INDEX.tokens[i];
    if (toks.length === 0) return { ...p, score: 0 };

    // term frequency map for this passage
    const tf = new Map<string, number>();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    const dl = INDEX.docLen[i];
    const norm = K1 * (1 - B + B * (dl / (INDEX.avgDocLen || 1)));
    // Only score each distinct query term once per document.
    for (const term of new Set(qTerms)) {
      const f = tf.get(term);
      if (!f) continue;
      score += idf(term) * ((f * (K1 + 1)) / (f + norm));
    }
    return { ...p, score };
  });

  return scored
    .filter((s) => s.score > minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/** The single best-matching passage, or null. Used by the graceful fallback. */
export function retrieveBest(query: string): RetrievedPassage | null {
  return retrieve(query, { k: 1 })[0] ?? null;
}

/**
 * The best-matching FAQ passage specifically — the fallback prefers a real FAQ
 * answer. Applies the SAME relevance floor as retrieve(), so an off-topic query
 * yields null here too and the fallback refuses cleanly instead of emitting a
 * weakly-related FAQ.
 */
export function retrieveBestFaq(query: string): RetrievedPassage | null {
  const hits = retrieve(query, { k: 8, minScore: RELEVANCE_MIN_SCORE });
  return hits.find((h) => h.kind === "faq") ?? hits[0] ?? null;
}

/** A graceful-fallback answer: a real FAQ answer verbatim + its citation. */
export type FallbackAnswer = { answer: string; citation: string };

/**
 * Resolve the single best grounded answer to stream when the LLM is
 * unavailable. Prefers a verbatim FAQ answer (its `answer` field, not the
 * question-prefixed retrieval text); otherwise falls back to the best passage.
 * Returns null only when the corpus can't match at all.
 */
export function fallbackAnswer(query: string): FallbackAnswer | null {
  const best = retrieveBestFaq(query);
  if (!best) return null;

  // If it's a FAQ passage, recover the clean answer + source from faq.json.
  const m = best.id.match(/^faq-(\d+)$/);
  if (m) {
    const item = faqData.faq[Number(m[1])];
    if (item) {
      return { answer: item.answer, citation: `FAQ — ${item.source}` };
    }
  }

  // Non-FAQ passage: strip the "Name — Heading\n" label line we prepended.
  const nl = best.text.indexOf("\n");
  const body = nl >= 0 ? best.text.slice(nl + 1).trim() : best.text.trim();
  return { answer: body, citation: best.source };
}

/** Total passages in the corpus — exposed for the grounding test / diagnostics. */
export function corpusSize(): number {
  return CORPUS.length;
}

/** All passages (read-only) — exposed for diagnostics / tests. */
export function allPassages(): readonly Passage[] {
  return CORPUS;
}
