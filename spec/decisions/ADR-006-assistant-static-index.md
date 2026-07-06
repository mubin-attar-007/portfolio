# ADR-006 — Assistant: build-time embeddings + static index (no vector DB)

Status: Accepted

## Context
Grounded RAG over site content. Corpus is small: well under 1,000 chunks even at
10 case studies + 30 posts.

## Decision
Chunk + embed at build (`scripts/build-embeddings.ts`) → static JSON index bundled with
the edge function → cosine similarity in memory → Claude with a strict grounding +
citation contract. Rebuild index on every deploy (content is the only source).

## Alternatives considered
- **Qdrant/Pinecone/pgvector** — operational surface, cost, and latency for a corpus
  that fits in memory ~100× over. Classic overengineering; rejected — and the rejection
  is documented in the flagship-adjacent essay, because knowing when NOT to use a vector
  DB is stronger hiring signal than using one.
- **Fully client-side embeddings** — model download cost on visitors; rejected.

## Consequences
Index size must be watched (float32 → consider int8 quantization if > ~2 MB). Migration
path to a real store is trivial if the corpus ever 100×s.
