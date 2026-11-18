# ADR-006 — Assistant: an in-memory index over site content (no vector DB)

Status: Accepted. Amended 2026-11-13 to record the implementation. The original
decision — build-time embeddings in a static JSON index, cosine similarity, an edge
function, and Claude — was never what shipped; the code builds a lexical BM25 index at
module load and calls Gemini from a Node.js route. The no-vector-DB decision stands.
Amended 2026-11-16: the corpus covers every published collection, and relevance is
judged per question instead of by a fixed score floor (see the amendment below).
Amended 2026-11-17: the flagship case studies join the corpus; spelling correction,
aliases and a page prior join the lexical search; and one bounded routing call, not
embeddings, is the second chance when it finds nothing (the second amendment).

## Context
Grounded retrieval over site content. The corpus is small: the FAQ, the project
write-ups chunked by heading, the profile, the résumé, and the skill groups — well under
a thousand passages.

## Decision
`lib/ai/retrieval.ts` reads the corpus from `content/` at module load and builds a BM25
index in memory — no embedding API, no network, no dependencies. `POST /api/chat`
retrieves the top passages above a relevance floor and asks Gemini (`lib/ai/gemini.ts`)
for an answer under a strict grounding and citation contract; without a key or quota it
serves the best FAQ answer verbatim. The index is rebuilt whenever the server starts, so
content is the only source. Detail: AI_ASSISTANT.md.

The code records why lexical retrieval: it runs identically in the route and in a plain
`node --test` run, which is what lets the grounding tests (`test/retrieval.test.mts`)
prove retrieval with zero LLM quota.

## Alternatives considered
- **Qdrant/Pinecone/pgvector** — operational surface, cost, and latency for a corpus
  that fits in memory many times over. Classic overengineering; rejected, because
  knowing when NOT to use a vector DB is stronger hiring signal than using one.
- **Fully client-side embeddings** — model download cost on visitors; rejected.
- **Build-time embeddings with a static index** (the original plan) — adds an embedding
  provider, a key, and a build step; not implemented.

## Consequences
Retrieval quality depends on vocabulary overlap, so case-study write-ups and FAQ answers
must use the terms visitors ask with; `test/fixtures/test-questions.ts` pins the expected
sources. The index lives per server instance. Migrating to embeddings or a real store
stays straightforward if the corpus ever grows by orders of magnitude.

## Amendment — 2026-11-16

- **Corpus.** `lib/ai/corpus.ts` now builds the passages, from the same sources the
  pages render: the FAQ, the project records and write-ups, the profile, contact and
  availability (`config/site.ts`), the résumé's roles, education and skills, every
  evaluation row in `content/evals.ts` (a retired row is stated as retired, with its
  reason and audit, never with a figure), the published essays and notes, and a
  writing index. `lib/ai/retrieval.ts` indexes them. `content/skills.json` was removed.
- **Relevance.** The fixed BM25 floor of 4.6 rejected nearly every short question, so
  relevance is judged per question: at least half of the question's topic weight (its
  content words, weighted by rarity) must be words the site uses, each passage must
  match half of that weight itself and score within 60% of the best, and source priors
  put a named project's own record first. A question that only
  names a project, or Mubin, gets that project's overview or his profile. Nothing
  relevant means an honest "not covered" answer and no model call. The lexical index
  and the no-vector-DB decision are unchanged.
- **Fallback.** Without a key, quota, or a usable model reply, the route serves the best
  cited passage verbatim — an FAQ answer only when it scores within 90% of that
  passage — rather than always the best FAQ answer.
- **Named projects (second review, same day).** A short question naming a project was
  still answered from another project when a rarer shared word ("act", "handle")
  carried its topic weight. The record of a named project is now exempt from the
  per-passage share; essays and notes carry the projects they name, so one about another
  project is demoted; a question about a demo or source prefers the overview; a retired
  row is preferred only by a question about it; a chain of follow-ups keeps the topic
  its first question set; and every essay and note passage is dated. Detail:
  AI_ASSISTANT.md §2.

## Amendment — 2026-11-17

- **Corpus.** The flagship case studies (`content/flagship/`, ADR-019) are indexed in
  finer passages than their page bands: an overview, one passage per section, and one
  per incident, highlight, code excerpt (its story, never the code) and surface built,
  each cited at its anchor on `/work/<slug>`. A work index and the hiring, about, /now,
  /uses and /trust pages join them, and the profile passage is now built from the
  content modules; it is also the background of every live answer. 172 passages in
  all.
- **Reading a question.** Lexical search now corrects a word the index does not know
  to the site's spelling (Damerau–Levenshtein, over names, passage titles and tools
  only), maps a small, tested set of content-backed aliases ("the NFC app" → CareLTC,
  "CV" → résumé), and weighs the page the panel is open on (`page`, a prior). The BM25
  index itself is unchanged.
- **Second-chance retrieval, not embeddings.** When lexical search finds nothing and a
  key, a topic and budget allow, one routing call (`lib/ai/router.ts`) shows the model a
  compact index — one `id | title | first line` row per passage — and accepts at most
  three ids that exist in it; anything else, or its 3.5 s timeout, is "nothing", and the
  visitor gets the same honest "not covered" answer as before. It counts against the
  same limits as an answer. Embeddings were weighed again and rejected: a build step
  and a stored vector per passage, an embedding call with its own quota on every
  question, and a cache, for under two hundred passages that lexical search already
  finds for every golden question offline. The router keeps every answer traceable to
  an id in the index, at $0. The no-vector-DB decision stands.
- **Evidence.** A 67-question golden set holds the retrieval and the answers: offline in
  `npm test`, live with `npm run eval:assistant` (AI_ASSISTANT.md §8).
