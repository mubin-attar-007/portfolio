# ADR-006 — Assistant: an in-memory index over site content (no vector DB)

Status: Accepted. Amended 2026-11-13 to record the implementation. The original
decision — build-time embeddings in a static JSON index, cosine similarity, an edge
function, and Claude — was never what shipped; the code builds a lexical BM25 index at
module load and calls Gemini from a Node.js route. The no-vector-DB decision stands.
Amended 2026-11-16: the corpus covers every published collection, and relevance is
judged per question instead of by a fixed score floor (see the amendment below).

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
