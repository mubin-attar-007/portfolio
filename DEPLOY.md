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

All are read in `lib/env.ts`, `lib/ai/gemini.ts`, `app/hire/page.tsx`, and
`components/features/newsletter-form.tsx`. `.env.example` lists all six; the last two
are commented out.

| Variable | Scope | Default | Purpose |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | **Server-side only** | unset | Enables live model answers in the assistant. Without it the assistant serves grounded site-search answers. |
| `GEMINI_MODEL` | Server-side | `gemini-3.5-flash-lite` | The Gemini model the assistant calls. It must be a Gemini 3 or later model that accepts the `MINIMAL` thinking level. A value that is not a bare model id falls back to the default. |
| `NEXT_PUBLIC_SITE_URL` | Public | `https://mubin-attar.vercel.app` | Canonical origin for metadata, canonicals, sitemap, robots, JSON-LD, and OG cards. Normalized to an origin; an invalid value falls back to the default. Set it if you add a custom domain. |
| `ASSISTANT_DAILY_CAP` | Server-side | `500` | Gemini calls allowed per UTC day, per server instance. Clamped to 1–20,000; an invalid value falls back to 500. |
| `NEXT_PUBLIC_CAL_URL` | Public | the Cal.com URL in `config/site.ts` | Overrides the booking link on `/hire`. Anything other than an absolute http(s) URL, including an empty value, hides it. |
| `NEXT_PUBLIC_BUTTONDOWN_USERNAME` | Public | unset — the form is hidden | Shows the newsletter form on `/writing`, `/notes` and their articles, posting to this Buttondown handle. Unset, empty, or anything other than a plain handle (letters, digits, `-` and `_`) hides it. Set it only once the list is confirmed to deliver. |

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

`.env.local` is gitignored — never commit a key.

---

## 3. How the assistant degrades gracefully

The assistant is designed to stay useful and honest at **zero LLM quota** — it
does not fail a visitor with a 500 and does not fabricate:

- **Retrieval is network-free.** Every answer is grounded in local content
  (`content/`: FAQ, project overviews and write-ups, essays, notes, evaluation
  results, profile, contact details, résumé and skills) through an in-memory BM25
  index built at module load — no embedding API, no vector store, no external call
  to retrieve. A question the site does not cover gets an honest "not covered"
  answer without calling the model or spending budget.
- **With a working key and quota:** Gemini streams a grounded synthesis of the
  retrieved passages, then the route sends the sources it used; the panel links
  each one to the matching page on the site.
- **On quota exhaustion, an API error, a missing key, a timeout (no text after
  8 s, or 20 s in all), or an empty or blocked reply:** the route streams the
  best-matching passage verbatim (an FAQ answer when one is as good) with its
  citation, labelled in the panel as site search rather than the live model. An
  answer that fails part-way is marked as cut short rather than shown as complete.
- **Prompt-injection and configuration attempts** ("ignore your instructions",
  etc.) get a polite refusal and the model is **not** called. A refusal does not
  carry over to the visitor's next question.
- **Cross-site requests are refused** (`403`), and so is any body not sent as JSON
  (`415`): another site cannot make visitors' browsers spend this site's budget.

### Limits, and where the real ceiling is

The limits in the code are **best-effort and per server instance**: every warm
instance keeps its own counters in memory, and a restart clears them. They bound
what one client can do to one instance:

- 15 requests per minute per client (a salted hash of its address, never the
  address itself);
- 30 live answers per client per UTC day, after which that client gets site-search
  answers only;
- `ASSISTANT_DAILY_CAP` (default 500) live answers per instance per UTC day, after
  which every visitor on that instance gets site-search answers.

With several instances the true total is a multiple of these, so they are not a
spending ceiling. Set the real ceilings outside the function:

- a quota or budget cap on the key's Google Cloud project (§2, step 4);
- a **Vercel Firewall** rate-limit rule on `POST /api/chat` (Project → Firewall →
  Rules), with a per-address window that suits the traffic you expect.

### Logs

The route writes one JSON line per answered turn, shaped like
`{"evt":"assistant","mode":"live","note":null,"hits":4,"latencyMs":<ms>,"model":"gemini-3.5-flash-lite","firstTokenMs":<ms>,"finish":"stop","promptTokens":<n>,"outputTokens":<n>}`.
It records the mode, the note, the passages retrieved, timings, the finish or
failure reason and token counts — never the question, the answer, the key or the
visitor's address. Without a key every turn logs `"failure":"not-configured"`; an
`upstream-<status>` failure is a status Gemini actually returned. It also warns with the model id and HTTP status when Gemini
rejects a request (check this after changing `GEMINI_MODEL`), and warns
`[assistant] content/<dir> is not readable` if a content collection is missing
from the deployed function.

So if you deploy **without** `GEMINI_API_KEY` (or the free quota runs out), the
assistant still answers from the site's content — it just won't do live LLM
synthesis.

The panel itself is **code-split** (`React.lazy` + `Suspense` in
`components/features/assistant.tsx`) so none of the chat/streaming code ships in
the landing bundle; it loads only when a visitor first opens the assistant.

---

## 4. Verify a deploy

- `/` renders the hero and the homepage sections; the header's **Ask this site**
  button (or <kbd>Ctrl+K</kbd>, <kbd>⌘K</kbd> on a Mac) opens the assistant.
- The assistant answers from every collection: ask "What does DBWhisper do?" and
  "What has he written?" — each answer cites a page (a case study, then an essay or
  the writing index). An answer without sources, or the warning
  `[assistant] content/<dir> is not readable` in the function logs, means the
  content files were not bundled with `/api/chat`.
- A cross-site request is refused:
  `curl -i -X POST https://<deployment-host>/api/chat -H 'Content-Type: text/plain' -d '{}'`
  returns `415`, and the same request with `-H 'Origin: https://example.com' -H 'Content-Type: application/json'` returns `403`.
- `/work` and each `/work/<slug>` case study render with unique title/description.
- SEO endpoints resolve: `/sitemap.xml`, `/robots.txt`, `/rss.xml`,
  `/opengraph-image`, `/work/opengraph-image`, `/work/<slug>/opengraph-image`,
  `/manifest.webmanifest`, `/favicon.ico` (the site's [✓] mark, not Vercel's) and
  `/apple-icon.png`.
- Run the metadata gate against the deployment:
  `LIGHTHOUSE_BASE_URL=https://<deployment-host> npm run test:metadata` (every
  sitemap URL's canonical, social card and title/description limits; the 404 and
  `/dev/components` unindexed; `/contact`, `/cv` and the other redirects).
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
