# ADR-006 — Assistant: an in-memory index over site content (no vector DB)

Status: Accepted. Amended 2026-11-13 to record the implementation. The original
decision — build-time embeddings in a static JSON index, cosine similarity, an edge
function, and Claude — was never what shipped; the code builds a lexical BM25 index at
module load and calls Gemini from a Node.js route. The no-vector-DB decision stands.

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
must use the terms visitors ask with; `lib/ai/test-questions.ts` pins the expected
sources. The index lives per server instance. Migrating to embeddings or a real store
stays straightforward if the corpus ever grows by orders of magnitude.
