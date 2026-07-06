# SPRINT 5 — Engineering assistant

> **Paste to Claude Code:**
> Read spec/AI_ASSISTANT.md fully — it is the complete contract — plus ARCHITECTURE §6–7.
> Build the eval harness BEFORE the panel UI: retrieval quality is provable before pixels.

**Goal:** grounded, evaluated, cost-capped assistant that is itself portfolio evidence.

## Tasks

### T1 — Embedding build script
`scripts/build-embeddings.ts` per AI_ASSISTANT §2 (heading-aware chunking, never split a
DecisionLog entry). Output `src/generated/search-index.json` with url/title/heading
metadata. Wire into `pnpm content` + build.
**AC:** deterministic output for unchanged content; index size logged; unit tests for the chunker.

### T2 — Retrieval lib + golden evals (retrieval half)
`lib/search.ts`: embed query, cosine top-k, threshold. `evals/assistant.golden.json`
with ≥ 20 cases per AI_ASSISTANT §7. `pnpm eval:assistant --retrieval-only` asserts the
right doc ids surface.
**AC:** retrieval evals green; a deliberately-broken chunker fails them (prove, revert).

### T3 — /api/ask edge route
Streaming, system prompt from `src/config/assistant-prompt.ts`, citation contract,
rate limit (10/10min hashed IP), daily cap env, 429/503 responses, anonymized logging.
**AC:** injection suite passes (context-embedded and user-embedded attempts); over-cap
returns 503 with correct body; no key exposure.

### T4 — Full generation evals in CI
Extend harness to generation: must-include, must-not-include, citation present,
out-of-scope declines. CI job triggers on changes to content/, prompt, lib/search.
**AC:** all green; regression blocks merge (prove once).

### T5 — AssistantPanel
Per AI_ASSISTANT §5: lazy slide-over/bottom-sheet, `/` opens, focus trap + return,
starter questions, streaming prose, source chips, honest footer (model + scope + privacy
note), 429/503 degraded states → client-side keyword search over same index.
**AC:** chunk ≤ 60 KB gz loaded only on open; keyboard + axe clean; JS-off = trigger
becomes link to /work.

### T6 — Publish the harness note
Short guide post: "How I evaluate my portfolio's assistant" (goldens, injection suite,
CI gate) — mined from this sprint. Counts toward Sprint 6's writing minimum.

## Definition of Done
[ ] All AI_ASSISTANT §8 items  [ ] Evals in CI and green  [ ] Cost cap tested
[ ] Privacy note visible in panel  [ ] Starter questions answer correctly with citations
