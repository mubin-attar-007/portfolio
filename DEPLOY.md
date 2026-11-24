# Deploying this portfolio to Vercel

A Next.js 16 (App Router) site. It deploys to Vercel with the framework defaults;
every environment variable is optional. It is designed to stay within free-tier
limits. Vercel is the complete runtime: the static bundle that `npm run build:sites`
stages in `dist/` has no `/api/chat` route, so the assistant needs this deployment.

---

## 1. Import the repo

1. Go to **vercel.com → Add New… → Project** and import
   `mubin-attar-007/portfolio` from GitHub.
2. Vercel auto-detects the framework — leave the defaults:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (the repo root — this project is not in a monorepo subfolder)
   - **Build Command:** default (`next build`)
   - **Output:** managed by Vercel (default)
   - **Install Command:** default (`npm install`)
3. Add any environment variables below, then **Deploy**.

Production is served at `https://mubin-attar.vercel.app`.

---

## 2. Environment variables

They are read in `lib/env.ts` (the site URL, the model and the daily cap),
`lib/ai/gemini.ts` (the key), `lib/ai/rate-limit.ts` (the per-visitor limit) and
`components/features/newsletter-form.tsx` (the newsletter). `.env.example` lists
seven; the last three are commented out, and one of those, `NEXT_PUBLIC_CAL_URL`, is
read by nothing (its row says why).

| Variable | Scope | Default | Purpose |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | **Server-side only** | unset | Enables live model answers in the assistant. Without it the assistant serves grounded site-search answers and makes no model call at all. |
| `GEMINI_MODEL` | Server-side | `gemini-3.5-flash-lite` | The Gemini model the assistant calls. It must be a Gemini 3 or later model that accepts the `MINIMAL` thinking level. A value that is not a bare model id falls back to the default. Measure a change with `npm run eval:assistant` first: on 2026-11-17 `gemini-3.5-flash` stalled or returned 503s on most calls and hit its free-tier quota after 21 requests ([AI_ASSISTANT.md §8](spec/AI_ASSISTANT.md#8-evaluation)). |
| `NEXT_PUBLIC_SITE_URL` | Public | `https://mubin-attar.vercel.app` | Canonical origin for metadata, canonicals, sitemap, robots, JSON-LD, and OG cards. Normalized to an origin; an invalid value falls back to the default. Set it if you add a custom domain. |
| `ASSISTANT_DAILY_CAP` | Server-side | `500` | Gemini calls allowed per UTC day, per server instance. Every call counts: an answer, its hedged second call when the first is slow, and a routing call. Clamped to 1–20,000; an invalid value falls back to 500. |
| `ASSISTANT_CLIENT_DAILY_LIMIT` | Server-side | `30` in production; under `next dev`, the value of `ASSISTANT_DAILY_CAP` | Gemini calls one visitor may cause per UTC day, counted the same way. A whole number from 1 to 20,000 sets it; anything else uses the default. `next dev` lifts the limit because every local request is the same visitor; set it in `.env.local` to test the per-visitor limit locally. |
| `NEXT_PUBLIC_CAL_URL` | Public | not read | Listed in `.env.example`, but no code reads it since the redesign. The booking link is `INTEGRATIONS.calUrl` in `config/site.ts`, used by the "Book a call" links on `/contact`, `/hire` and the flagship walkthrough card and by the assistant's Book-a-call action; change it there. |
| `NEXT_PUBLIC_BUTTONDOWN_USERNAME` | Public | unset — the form is hidden | Shows the newsletter sign-up at the foot of `/writing` and `/notes`, posting to this Buttondown handle; `/privacy` names Buttondown only while it is set. Unset, empty, or anything other than a plain handle (letters, digits, `-` and `_`) hides it. Set it only once the list is confirmed to deliver. |

### `GEMINI_API_KEY`

The assistant calls the Gemini REST API (`gemini-3.5-flash-lite`, or the model
in `GEMINI_MODEL`) from a **server-side route handler** (`app/api/chat/route.ts`,
Node.js runtime). The key is read from `process.env.GEMINI_API_KEY`, sent in the
`x-goog-api-key` header rather than the URL, and is never shipped to the browser,
logged, or included in any error.

The default model changed from `gemini-2.5-flash` because Google shuts that
model down on 2026-12-01 and routes its requests to `gemini-3.5-flash-lite` from
then on. Gemini 3 requests carry a thinking level (`MINIMAL`) instead of a
thinking budget and no `temperature` or `topP`; models before Gemini 3 reject a
thinking level, so `GEMINI_MODEL` cannot point back at a 2.x model.

Get a **fresh** key so it has its own free-tier quota:

1. Open <https://aistudio.google.com/app/apikey>.
2. Create an API key (a new Google Cloud project is fine).
3. **Use a dedicated key for this site** — do not reuse the DBWhisper key, or the
   two apps will share (and exhaust) the same free-tier quota.
4. In the key's Google Cloud project, set a request quota (or a budget alert) on the
   Generative Language API. That is the only ceiling that holds across every server
   instance (§3).
5. In Vercel: **Project → Settings → Environment Variables → Add** — name
   `GEMINI_API_KEY`, paste the value, scope it to **Production** (and Preview if
   you want the assistant live on previews). Redeploy so the variable takes effect.

Set it locally for `npm run dev` in `.env.local`:

```
GEMINI_API_KEY=your_key_here
```

`.env.local` is gitignored — never commit a key. The assistant's live evaluation
(`npm run eval:assistant`, README "Checks") reads the same file and spends the same
quota.

---

## 3. How the assistant degrades gracefully

The assistant is designed to stay useful and honest at **zero LLM quota** — it
does not fail a visitor with a 500 and does not fabricate:

- **Retrieval is local.** Every answer is grounded in the site's own content (the
  flagship case studies, the public projects' records and write-ups, essays and
  notes, evaluation results, the hiring, contact, about, /now, /uses and /trust
  pages, the résumé and skills, and the FAQ) through an in-memory BM25 index built
  at module load — no embedding API and no vector store. Only when lexical search
  finds nothing, a key is set and budget remains does the route make one small
  routing call (`lib/ai/router.ts`) to pick passages from an index of their titles;
  if it picks none, the visitor gets an honest "not covered" answer.
- **With a working key and quota:** Gemini streams a grounded synthesis of the
  retrieved passages. If no text arrives within 3.5 s, one identical second call
  races the first (a hedged request) and the slower one is aborted. Then the route
  sends the pages it cited, next-step actions (email, a call, the résumé, a case
  study) and curated follow-up questions; the panel links each page.
- **On quota exhaustion, an API error, a missing key, a timeout (no text after
  12 s, or 25 s in all), or an empty or blocked reply:** the route streams the
  best-matching passage verbatim (an FAQ answer when one is as good) with its
  citation, labelled in the panel as site search rather than the live model. An
  answer that fails part-way is marked as cut short rather than shown as complete.
  With no text after 5 s the panel says the answer is taking longer than usual, and
  it gives up at 32 s, past the function's 30 s limit.
- **Prompt-injection and configuration attempts** ("ignore your instructions",
  etc.) get a polite refusal and the model is **not** called. A refusal does not
  carry over to the visitor's next question. A hiring term the site does not
  publish (salary, relocation, a start date, a visa) and a question about his
  private life get a fixed, grounded answer without the model too.
- **Cross-site requests are refused** (`403`), and so is any body not sent as JSON
  (`415`): another site cannot make visitors' browsers spend this site's budget.

### Limits, and where the real ceiling is

The limits in the code are **best-effort and per server instance**: every warm
instance keeps its own counters in memory, and a restart clears them. They bound
what one client can do to one instance:

- 15 requests per minute per client (a salted hash of its address, never the
  address itself);
- 30 model calls per client per UTC day in production (`ASSISTANT_CLIENT_DAILY_LIMIT`
  overrides it, and `next dev` lifts it to the instance cap), after which that client
  gets site-search answers only;
- `ASSISTANT_DAILY_CAP` (default 500) model calls per instance per UTC day, after
  which every visitor on that instance gets site-search answers.

Both daily limits count every Gemini call: the answer, a hedged second call and a
routing call. A turn that needs no model (no key, a refusal, a hiring gap) spends
nothing, and a question the site cannot answer spends at most the one routing call.

With several instances the true total is a multiple of these, so they are not a
spending ceiling. Set the real ceilings outside the function:

- a quota or budget cap on the key's Google Cloud project (§2, step 4);
- a **Vercel Firewall** rate-limit rule on `POST /api/chat` (Project → Firewall →
  Rules), with a per-address window that suits the traffic you expect. Its action must
  be **Rate Limit** (answering 429), not Deny: the panel calls the route with `fetch`.
  The production rule is set this way (24 Nov 2026).
- Vercel's own bot protection challenges automated clients on `/api/chat` (curl, Node
  and headless browsers were challenged in a 24 Nov 2026 test; real browsers pass), and
  its DDoS mitigation denies scanner probes such as `/wp-login.php`. So a script cannot
  test the live assistant: `npm run test:smoke` posts "Hi" from a page (small talk, no
  model call), fails on any block, and reports a bot-protection challenge without
  failing.

### Logs

The route writes one JSON line per answered turn, shaped like
`{"evt":"assistant","prompt":"2026-11-24.1","knowledge":"<8 hex>","retrieval":"lexical","mode":"live","note":null,"hits":4,"passages":["<content id>",…],"actions":["case-study"],"latencyMs":<ms>,"model":"gemini-3.5-flash-lite","firstTokenMs":<ms>,"finish":"stop","promptTokens":<n>,"outputTokens":<n>}`.
It records the system prompt's version (`prompt`) and a fingerprint of the site content the question was searched in (`knowledge`), so a line can be tied to the release that wrote it; the mode and the note; how the passages were found (`retrieval`:
`lexical`, `fuzzy` after a spelling correction, `router`, or `none`) and, when a
routing call ran, its result (`router`) and tokens (`routerTokens`); the ids of the
passages used (content ids, never visitor text); the kinds of actions offered;
`page: true` when the request named a page (not which page); timings; the finish or
failure reason; `hedged` and `hedgeWon` when a second call ran; and token counts —
never the question, the answer, the key or the visitor's address. Without a key
every turn logs `"failure":"not-configured"`, and a visitor the Gemini tier may not serve logs `"failure":"region"` (never the country); an
`upstream-<status>` failure is a status Gemini actually returned. It also warns with the model id and HTTP status when Gemini
rejects a request (check this after changing `GEMINI_MODEL`), and warns
`[assistant] content/<dir> is not readable` if a content collection is missing
from the deployed function.

So if you deploy **without** `GEMINI_API_KEY` (or the free quota runs out), the
assistant still answers from the site's content — it just won't do live LLM
synthesis.

### Kill switch

To stop every model call at once:
1. Delete `GEMINI_API_KEY` in Vercel → Settings → Environment Variables.
2. Redeploy.

The assistant then answers from site search alone, with "live answers unavailable — site
search only". Every page, citation, résumé and contact action keeps working. Add the key back
and redeploy to undo.

### The Gemini tier and the regions it may serve (ADR-022)

The key runs on the Gemini API's **free tier** (`GEMINI_TIER` in
`lib/ai/provider-terms.ts`). Google's terms set two conditions:
- The free tier may not serve users in the EEA, Switzerland or the UK. Visitors there get
  site-search answers, and the log line says `"failure":"region"`.
- On the free tier, Google may use what is sent to improve its products. The privacy page,
  the panel's footer and the FAQ say so.

**The paid tier** (not in use: on 24 Nov 2026 the owner chose to stay on the free tier, ADR-022) lifts both conditions, and at portfolio traffic
Flash-Lite costs very little; the site's daily caps and the project quota (§2, step 4) still
bound it.
1. Owner: enable billing on the key's Google Cloud project, and set a budget alert.
2. In a PR, set `GEMINI_TIER` to `"paid"` and remove the free-tier sentences from the privacy
   answer in `content/faq.json`. `test/provider-terms.test.mts` fails until both match.
3. Merge, then recheck Google's terms and record the check in ADR-022.

The panel itself is **code-split** (`React.lazy` + `Suspense` in
`components/features/assistant.tsx`) so none of the chat/streaming code ships in
the landing bundle; it loads when a pointer or focus first reaches a launcher, or at
the latest when a visitor first opens the assistant.

---

## 4. Verify a deploy

- `/` renders the hero and the homepage sections; the header's **Ask this site**
  button (or <kbd>Ctrl+K</kbd>, <kbd>⌘K</kbd> on a Mac) opens the assistant.
- The assistant answers from every collection: ask "What is Bench Discovery?", "What
  does DBWhisper do?" and "What has he written?" — each answer cites a page (a
  flagship case study, a public one, then an essay or the writing index). On a case
  study, "Ask AI about <product>" opens the panel on that page's starters without
  sending anything. An answer without sources, or the warning
  `[assistant] content/<dir> is not readable` in the function logs, means the
  content files were not bundled with `/api/chat`.
- A cross-site request is refused:
  `curl -i -X POST https://<deployment-host>/api/chat -H 'Content-Type: text/plain' -d '{}'`
  returns `415`, and the same request with `-H 'Origin: https://example.com' -H 'Content-Type: application/json'` returns `403`.
- `/work` and each `/work/<slug>` case study render with unique title/description,
  including the flagships `/work/bench-discovery` and `/work/careltc`;
  `/work/field/records-triage` and `/work/field/nfc-room-rounds` answer 308 to them.
- SEO endpoints resolve: `/sitemap.xml`, `/robots.txt`, `/rss.xml`,
  `/opengraph-image`, `/work/opengraph-image`, `/work/<slug>/opengraph-image`,
  `/manifest.webmanifest`, `/favicon.ico` (the site's [✓] mark, not Vercel's) and
  `/apple-icon.png`.
- Run the metadata gate against the deployment:
  `LIGHTHOUSE_BASE_URL=https://<deployment-host> npm run test:metadata` (every
  sitemap URL's canonical, social card and title/description limits; the 404 and
  `/dev/components` unindexed; `/cv`, the old field-report URLs and the other
  redirects).
- View source on `/` — the `<head>` includes Person + WebSite JSON-LD.
- Run the smoke test against the deployment:

```
BASE_URL=https://<deployment-host> npm run test:smoke
```

Before pushing changes, run locally:

```
npx tsc --noEmit   # must be clean
npm run lint       # must be clean
npm test           # must pass
npm run build      # must be green
```
