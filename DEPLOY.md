# Deploying this portfolio to Vercel

A Next.js 16 (App Router) site. It deploys to Vercel with zero config beyond one
environment variable for the AI assistant. The whole thing runs on the free tier.

---

## 1. Import the repo

1. Go to **vercel.com → Add New… → Project** and import
   `mubin-attar-007/portfolio` from GitHub.
2. Vercel auto-detects the framework — leave the defaults:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (the repo root — this project is not in a monorepo subfolder)
   - **Build Command:** `next build` (default)
   - **Output:** managed by Vercel (default)
   - **Install Command:** default (`npm install`)
3. Add the environment variable below, then **Deploy**.

Production is served at `https://mubin-attar.vercel.app`.

---

## 2. Environment variables

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | **Server-side only** | Yes (for live AI answers) | Powers the "Ask about Mubin" assistant via the Google Gemini API. |
| `NEXT_PUBLIC_SITE_URL` | Public | Optional | Overrides the canonical origin used by metadata, canonicals, sitemap, robots, JSON-LD, and OG cards. Defaults to `https://mubin-attar.vercel.app`. Set it to a custom domain if you add one. |

### `GEMINI_API_KEY`

The assistant calls the Gemini REST API (`gemini-2.5-flash`) from a **server-side
route handler** (`app/api/chat/route.ts`) — the key is read from
`process.env.GEMINI_API_KEY` and is never shipped to the browser, logged, or
included in any error.

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
never 500s and never fabricates:

- **Retrieval is network-free.** Every answer is grounded in local content
  (`/content`: profile, projects, resume, FAQ) through an in-memory BM25 index
  built at module load — no embedding API, no vector store, no external call to
  retrieve.
- **With a working key + quota:** Gemini streams a grounded synthesis of the
  retrieved passages, then cites which content file each fact came from.
- **On quota exhaustion, an API error, or a missing key:** the route falls back
  to streaming the single best-matching FAQ answer verbatim, with its citation,
  labelled so the UI shows it came from the FAQ rather than the live model.
- **Prompt-injection / config attempts** ("ignore your instructions", etc.) get a
  polite refusal and the model is **not** called.
- The route is **rate-limited** per client IP (sliding window) and sanitizes /
  length-caps input. No PII is logged.
- A **global daily budget cap** bounds Gemini generation calls per UTC day. Once
  it is spent the route stops calling Gemini and serves the grounded retrieval
  fallback, so a traffic burst cannot run up spend or starve the shared quota.

So if you deploy **without** `GEMINI_API_KEY` (or the free quota runs out), the
assistant still answers from the FAQ — it just won't do live LLM synthesis.

The panel itself is **code-split** (`React.lazy` + `Suspense` in
`components/features/assistant.tsx`) so none of the chat/streaming code ships in
the landing bundle; it loads only when a visitor first opens the assistant.

---

## 4. Verify a deploy

- `/` renders the hero + sections; the "Ask about Mubin" button (bottom-right)
  opens the assistant.
- `/work` and each `/work/<slug>` case study render with unique title/description.
- SEO endpoints resolve: `/sitemap.xml`, `/robots.txt`, `/opengraph-image`,
  `/work/opengraph-image`, `/work/<slug>/opengraph-image`.
- View source on `/` — the `<head>` includes Person + WebSite JSON-LD.

Before pushing changes, run locally:

```
npm run build   # must be green
npm run lint    # must be clean
```
