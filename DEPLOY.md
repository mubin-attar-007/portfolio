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
`components/features/newsletter-form.tsx`. `.env.example` lists the first three.

| Variable | Scope | Default | Purpose |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | **Server-side only** | unset | Enables live model answers in the assistant. Without it the assistant serves grounded FAQ answers. |
| `NEXT_PUBLIC_SITE_URL` | Public | `https://mubin-attar.vercel.app` | Canonical origin for metadata, canonicals, sitemap, robots, JSON-LD, and OG cards. Normalized to an origin; an invalid value falls back to the default. Set it if you add a custom domain. |
| `ASSISTANT_DAILY_CAP` | Server-side | `500` | Gemini calls allowed per UTC day, per server instance. Clamped to 1–20,000; an invalid value falls back to 500. |
| `NEXT_PUBLIC_CAL_URL` | Public | the Cal.com URL in `config/site.ts` | Overrides the booking link on `/hire`. Anything other than an absolute http(s) URL, including an empty value, hides it. |
| `NEXT_PUBLIC_BUTTONDOWN_USERNAME` | Public | the handle in `config/site.ts` | Overrides the newsletter account. An empty value hides the form. |

### `GEMINI_API_KEY`

The assistant calls the Gemini REST API (`gemini-2.5-flash`) from a **server-side
route handler** (`app/api/chat/route.ts`, Node.js runtime). The key is read from
`process.env.GEMINI_API_KEY`, sent in the `x-goog-api-key` header rather than the
URL, and is never shipped to the browser, logged, or included in any error.

Get a **fresh** key so it has its own free-tier quota:

1. Open <https://aistudio.google.com/app/apikey>.
2. Create an API key (a new Google Cloud project is fine).
3. **Use a dedicated key for this site** — do not reuse the DBWhisper key, or the
   two apps will share (and exhaust) the same free-tier quota.
4. In Vercel: **Project → Settings → Environment Variables → Add** — name
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
  (`content/`: FAQ, project write-ups, profile, résumé, skills) through an
  in-memory BM25 index built at module load — no embedding API, no vector store,
  no external call to retrieve.
- **With a working key and quota:** Gemini streams a grounded synthesis of the
  retrieved passages, then the route sends the sources it used; the panel links
  each one to the matching page on the site.
- **On quota exhaustion, an API error, or a missing key:** the route streams the
  best-matching FAQ answer verbatim (or the best retrieved passage) with its
  citation, labelled in the panel as coming from site search rather than the
  live model. An off-topic question gets an honest "not on the site" reply.
- **Prompt-injection and configuration attempts** ("ignore your instructions",
  etc.) get a polite refusal and the model is **not** called.
- The route is **rate-limited** per client IP (15 requests per minute, sliding
  window, per instance) and sanitizes and length-caps input. Nothing is logged.
- A **daily budget** (`ASSISTANT_DAILY_CAP`) bounds Gemini calls per UTC day on
  each server instance. Once it is spent, the route stops calling Gemini and
  serves the grounded fallback, so a traffic burst cannot run up spend or starve
  the quota.

So if you deploy **without** `GEMINI_API_KEY` (or the free quota runs out), the
assistant still answers from the FAQ — it just won't do live LLM synthesis.

The panel itself is **code-split** (`React.lazy` + `Suspense` in
`components/features/assistant.tsx`) so none of the chat/streaming code ships in
the landing bundle; it loads only when a visitor first opens the assistant.

---

## 4. Verify a deploy

- `/` renders the hero and the homepage sections; the header's **Ask this site**
  button (or <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>, or <kbd>/</kbd>) opens the assistant.
- `/work` and each `/work/<slug>` case study render with unique title/description.
- SEO endpoints resolve: `/sitemap.xml`, `/robots.txt`, `/rss.xml`,
  `/opengraph-image`, `/work/opengraph-image`, `/work/<slug>/opengraph-image`.
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
