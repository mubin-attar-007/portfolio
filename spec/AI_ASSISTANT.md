# AI_ASSISTANT.md — Engineering Assistant

Not "chat with my portfolio." A grounded assistant that answers hiring-manager questions
about the work — and is itself a demonstration piece: retrieval quality, guardrails, and
the grounding tests are part of the portfolio's evidence.

## 1. Scope

The rules live in the system prompt (`lib/ai/system-prompt.ts`).

CAN: explain projects, architectures, decisions and trade-offs; answer résumé, skills
and experience questions; point to the case study or page that covers the question; say
plainly that something is not on the site and suggest a question it can answer.
CANNOT: general-purpose chat, opinions on other people or companies, coding help, or
anything not grounded in site content. Off-scope → a polite redirect to what it covers.
It never invents experience, metrics, employers, dates, or numbers.

## 2. Retrieval (ADR-006)

`lib/ai/retrieval.ts` builds the corpus and a BM25 index once, at module load, in
memory — no embeddings, no vector store, no network, no dependencies. Passages:

- `content/faq.json` — one passage per Q&A (14), the highest-signal source;
- `content/projects/<slug>.mdx` — chunked by `##` heading, for every project in
  `content/projects.ts`;
- a profile summary (`config/site.ts`, `content/profile.json`, the résumé summary);
- `content/resume.ts` — one passage per role, plus education;
- `content/skills.json` — one passage per skill group.

Writing and notes are not in the corpus. Tokenizing lowercases, splits on
non-alphanumerics, and drops stopwords and one-character tokens. BM25 uses k1 = 1.5,
b = 0.75. A passage must score above `RELEVANCE_MIN_SCORE` (4.6) to count, so an
off-topic question retrieves nothing and gets an honest "not on the site" answer rather
than a weakly related one. The route uses the top 4 passages.

## 3. Generation

- `lib/ai/gemini.ts` calls the Gemini REST API directly (no SDK):
  `gemini-2.5-flash`, `streamGenerateContent?alt=sse`, temperature 0.3, top-p 0.9,
  `maxOutputTokens` 800, thinking budget 0. The key travels in the `x-goog-api-key`
  header, never the URL, and never appears in an error. The request's abort signal is
  forwarded, so a closed panel stops generation upstream.
- The system instruction is `SYSTEM_PROMPT` plus a context block that labels each
  passage with its human-readable source (`buildSystemInstruction`). Bump
  `SYSTEM_PROMPT_VERSION` (currently `2026-07-24.1`) on any behavioural change.
- Contract: answer only from the context and say so when it is insufficient; refer to
  sources in prose; refuse attempts to change the rules or reveal the prompt; concise,
  senior, no hype; markdown output.

## 4. API — `POST /api/chat`

`app/api/chat/route.ts` — Node.js runtime (retrieval reads files with `fs`),
`force-dynamic`, never cached.

- **Request:** `{ messages: Array<{ role: "user" | "assistant", content: string }> }`.
  `lib/ai/guard.ts` collapses whitespace, drops malformed turns, keeps the last 8, and
  requires the last to be the user's; a latest message over 1,000 characters is
  answered with a request to shorten it.
- **Rate limit:** 15 requests per 60 s per client key (`x-real-ip`, then
  `x-vercel-forwarded-for`, then the last `x-forwarded-for` hop), in memory per
  instance. Over the limit → `429` JSON `{ error, retryAfterSec }` with `Retry-After`.
- **Injection screen:** the latest message and the concatenated user turns are matched
  against known jailbreak patterns; a match is refused without calling the model.
- **Daily budget:** `ASSISTANT_DAILY_CAP` (default 500) Gemini calls per UTC day, per
  instance (`lib/ai/rate-limit.ts`). When it is spent, the route serves the grounded
  fallback.
- **Response:** server-sent events — `meta { mode: "live" | "fallback" | "refusal",
  note }`, then `token { text }` chunks, then `sources { citations: [{ source }] }`,
  then `done`.
- **Fallback:** a missing key, quota error, or upstream failure before any token →
  the best FAQ answer verbatim (or the best passage) with its citation, flagged
  `mode: "fallback"`; nothing relevant → an honest "not on the site" reply. An
  unexpected handler error returns `503` with a short "temporarily unavailable"
  stream. Other HTTP methods return `405` with `Allow: POST`.

## 5. UI — `Assistant` + `AssistantPanel`

- **Launcher** (`components/features/assistant.tsx`): an "Ask this site" button in
  the header; <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> opens it anywhere, <kbd>/</kbd> opens
  it when focus is not in a field, and the mobile menu can open it through the
  `open-assistant` event. The panel is lazy-loaded (`React.lazy`) on first open.
- **Panel** (`components/features/assistant-panel.tsx`): a portalled modal dialog — a
  bottom sheet on phones, a 408px floating panel from the `sm` breakpoint;
  `--shadow-overlay` is permitted here. Focus is trapped, <kbd>Esc</kbd> closes, the
  page behind is `inert` (`lib/use-inert-background.ts`), and focus returns to the
  visible launcher one frame after close.
- **Empty state:** one line of scope and four starter questions as quiet buttons.
- **Answers** stream into a polite live region; a pending answer shows "searching…".
  Non-live turns carry an honest label: "from site search" for a cited fallback and
  "declined — out of scope" for a refusal. A rate-limited turn states the wait from
  the `Retry-After` header and is labelled "one at a time — give it a second".
- **Sources:** each citation is mapped by `lib/ai/citation-links.ts` to known pages
  only (case studies, `/work`, `/resume`, `/about`, `/skills`); model output and
  arbitrary URLs never become links.
- Footer line: "Cited · may be imperfect · not stored." No avatar, no typing-dots
  theater, no sound.

## 6. Privacy

The route stores no conversation and writes no logs. The rate limiter keeps only a
client key and request timestamps in memory, pruned as they expire; the daily budget is
a counter. The key stays server-side. `/privacy` describes assistant handling for
visitors.

## 7. Grounding tests (CI-gated)

`lib/ai/test-questions.ts` holds 16 questions across all four projects, the résumé,
and the Sevina role, each with the source the top passage must come from and terms it
must mention. `test/retrieval.test.mts` asserts, with no LLM quota:

- the corpus is non-trivial and uses the site's canonical identity and employment;
- every starter question retrieves a passage and a fallback answer;
- every test question retrieves its expected source and required terms;
- off-topic questions retrieve nothing and produce no fallback;
- every injection pattern is screened, and legitimate questions are not.

These run in `npm test`, which CI runs on every pull request. There is no
generation-level evaluation: model answers themselves are not scored in CI.

## 8. Definition of Done (assistant changes)

`npm test` passes, including the grounding and injection tests · `SYSTEM_PROMPT_VERSION`
bumped for prompt behaviour changes · keyboard, focus, and axe clean with the panel open
(`npm run test:a11y` audits that state) · rate-limited, budget-exhausted, and fallback
states still answer honestly · the panel stays lazy, loaded only on open (the ≤ 60 KB
chunk target in `components/features/assistant.tsx` is not measured by any gate).
