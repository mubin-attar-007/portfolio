# AI_ASSISTANT.md — Engineering Assistant

Not "chat with my portfolio." A grounded assistant that answers a hiring manager's
questions about the work — and is itself a demonstration piece: its retrieval, its
guardrails and its evaluation are part of the portfolio's evidence.

## 1. Scope

The rules live in the system prompt (`lib/ai/system-prompt.ts`).

CAN: explain the flagship products (Bench Discovery, CareLTC, SignFlow) and the public projects —
what they do, who uses them, his role, the architecture, decisions, what broke and how it is
verified; answer résumé, skills, experience, hiring, contact and availability questions;
report published evaluation results with their scope, and say when a result was retired;
point to the page that covers the question; say plainly that something is not on the site
and offer what is; compare a pasted job description with his published work, requirement by
requirement (Shown, Partly, Not on the site), with no match score or verdict.
CANNOT: general-purpose chat, opinions on other people or companies, coding help, his
private life (hobbies included), or anything not grounded in site content. A hiring term the
site does not publish — salary or rates, relocation, a specific start date, a visa, his
certifications (the résumé lists none; a test fails if one is added) — is answered "ask Mubin
directly", with what the site does say and the ways to reach him. His notice period is
published (`STATUS.noticePeriod` in `config/site.ts`, the one value every page reads): it is
answered like any hiring fact, and a start-date question gets it too ("His notice period is
<notice period>; for a specific start date, ask Mubin directly."). It never invents
experience, metrics, employers, customers, dates or numbers.
His role is **Applied AI Engineer** (`SITE.role`); it never gives him, or a role he
wants, a retired title (rule 4 of the system prompt names the banned ones, and the
golden set's global forbidden list holds them, §8).

## 2. Retrieval (ADR-006)

### Corpus — `lib/ai/corpus.ts`

Built once, at module load, from the sources the pages render, so a fact changed on a page
changes in the index with it. Nothing is written for the assistant except the FAQ
(`content/faq.json`) and the public case-study write-ups (`content/projects/*.mdx`).

- **FAQ** — one passage per Q&A (16), including two about the assistant itself (what it
  does with a question; where answers come from), which cite `/privacy`. Those two are found
  by their question and words about the assistant and privacy (`ABOUT_THE_ASSISTANT`), not
  by their answers: an answer that lists "the hiring and contact pages" once put a Privacy
  citation on every hiring answer. A FAQ answer never restates a usage figure: figures have
  one source.
- **Work index** — what he has shipped, flagships first with their usage in the approved
  wording (`USAGE`), then the public projects; found by what it is ("what has he
  shipped/built"), not by the names it lists.
- **Flagships** (`content/flagship/*`, Bench Discovery, CareLTC and SignFlow), cited at the section's
  anchor on `/work/<slug>`:
  - an overview: definition, summary, "Built at Sevina Technologies", who it is for, the
    usage figure and the approval line, his credit **verbatim** ("His role, in his words:
    …"), what it does, the test figures, the stack, the AWS services, the private-repository
    notice;
  - the problem; the constraints; what he built, **one passage per surface** (the desktop
    app, the web platform, the mobile app, the API, the portal…); the architecture (sketches
    in words and the boundary ledger); how it works (the trace); deployment (with the AWS
    services); decisions; verification (suites, checks, what is not measured); the outcome;
    the walkthrough offer;
  - **one passage per incident, per engineering highlight and per code excerpt** (its title
    and story, never the code), each opening with its title, so a verbatim fallback keeps
    the point;
  - the product tour and recordings by name only. Their captions describe one run on dummy
    data, not the product's figures, so they are not indexed.
  - No colleague is credited anywhere (owner, 2026-11-17): a flagship's credit is
    `credit.role` alone, quoted verbatim, an excerpt carries no credit, and a test asserts
    the index holds no colleague line.
  - Why not `flagshipSections()` (`content/flagship/sections.ts`, the same records as plain
    page-order text, which only a test reads today): retrieval needs finer passages than
    page bands. One passage per incident, highlight and excerpt is what lets "What went
    wrong with iPhone scans?" find the iOS incident first, and lets the fallback serve one
    crisp passage. Both read the same typed records, so no fact is written twice.
- **Public projects** — one overview per project from `content/projects.ts` and its résumé
  entry (definition, summary, stack, metrics with their methods, status, demo link or "no
  demo link while offline", source link), and its case study chunked by `##` heading.
- **His profile** (`profile-summary`) — role and 3.5+ years (the résumé summary's first
  sentence), his job title and previous role, the flagships with their usage and his credit
  in his words, the line on directing AI coding agents, "both hosted on AWS", the public
  projects, the roles he is open to, his notice period and where he works, location, email,
  education. It is
  also the **background of every live answer** (§3).
- **Hiring** (`content/pages/hire.ts`) — availability and the notice period (from
  `STATUS.noticePeriod`, stated once, under a title in visitors' words: "his notice period and
  when he can join"), the roles he is open to with their terms, where he works, his note to
  hiring teams (quoted), the "Working with me" grid and the glance stats. A notice question
  retrieves it first, and its no-key fallback leads with the notice period.
- **Contact** (`content/pages/contact.ts`, `config/site.ts`) — availability, email, hiring
  terms (ending with the notice period) and freelance terms, the booking link, location,
  profiles.
- **Résumé** (`content/resume.ts`) — one passage per role, education, and the résumé
  itself (the page and the PDF); **skills**, one per group, plus **AWS** (the services each
  flagship is hosted on).
- **About** (`content/pages/about.ts`, `content/site.ts`) — his background in his words,
  where he has worked, the tools he ships with, the quote, and the three principles.
- **/now** (`content/now.mdx`, its frontmatter included), **/uses** (one passage per group,
  with each tool's note, and how the projects are hosted), **/trust** (the evidence rows
  except the evaluation rows, which are their own passages; principles; practices).
- **Evaluations** (`content/evals.ts`) — one passage per row, plus the reading guide. A
  complete row states what it measures and on which test set before its figure; a retired
  row is stated as retired, with the date, the reason and the audit, never with a figure.
  Each row cites `/evals#<row>` and the project's case study.
- **Writing** — published essays (intro plus each `##` section) and notes, dated in the
  title and the source label; drafts are not indexed; a writing index lists them all.

The first line of each passage is a title in the words visitors ask with. Titles describe;
they never add a fact. First-person page copy is quoted as his words ("In his words: …"),
so a verbatim fallback never reads as the assistant speaking as Mubin. Every passage carries
the pages a reader can open to check it, each with a readable label ("CareLTC", "Hiring",
"Résumé"), built from content and never from model output.

### Reading a question — `lib/ai/retrieval.ts`

Tokenizing folds accents (`résumé` → `resume`), lowercases, splits on non-alphanumerics,
drops one-character words and stopwords — English glue, conversational and recruiter filler
("tell me", "a quick rundown"), the task words of a comparison ("compare", "difference",
"between") and Hinglish glue ("kya", "hain", "kaunse") — and applies a small suffix stemmer
(`deployed`/`deployment`, `using`/`use`). Web addresses are not indexed. BM25 uses k1 = 1.5,
b = 0.75.

- **Spelling.** A word the index does not know is corrected to the site's spelling when one
  candidate is within Damerau–Levenshtein distance 1 (5–8 letters) or 2 (9+ letters).
  Candidates are names (products, projects, his name; as words and joined: `careltc`,
  `benchdiscovery`), the words of every passage title and the tools the skills, stacks and
  /uses list — never every word on the site, so "married" never becomes "carried" and
  "relocation" never "allocation". Closest first, then names, then the commoner word:
  `dbwisper` → `dbwhisper`, `CareLCT` → `careltc`, `skils` → `skills`.
- **Aliases** — a small, content-backed map (each target is a product or words the index
  holds; tested). An alias adds recall, never a fact. A phrase matches in order, in the
  question or in the question without its filler ("people are using it").
  - products the site names differently: "the NFC app", "NFC rounds", "nurse rounds",
    "rounding app" → CareLTC; "document discovery", "desktop app", "redaction app",
    "Ask Bench" → Bench Discovery. The phrase then reads like the product's name;
  - what a word means here, replacing it when no product is named: "CV" → résumé,
    "tech stack"/"stack"/"technologies" → skills, "kaam" → work, "banaye" → built;
    "forward deployed"/"FDE" → roles, customer sites (the site never gives him that title, so
    the roles he is open to answer it, never a deployment section); "my data", "what I type" →
    the assistant's privacy answer (not a case study's "what stays private");
  - more words to search for: "available", "open to", "hire", "hiring" → availability,
    hiring, roles; "remote" → hybrid, on-site; "leadership"/"led" → lead (his roles say "I
    lead"); "his GitHub"/"his LinkedIn" → profiles; and,
    even when a product is named, "people use"/"user base" → users, usage; "video" →
    recording; "screenshots" → screens; "tap" → tag; "did he build", "his contribution" →
    role, owns.
- **Words that refer to the named product** ("app", "project", "system", "work"…) are not
  topic words beside its name: "tell me about the Bench Discovery app" asks for its summary.

### Relevance

Judged relative to the question, never against a fixed score:

1. A question that only names a product gets its overview and the opening of its case study;
   one that only asks about him gets his profile.
2. **A topic word the site never uses is the most specific word in the question**, so a
   question with one retrieves nothing — unless a product's name anchors it. "What is
   FooCorp and how many people use it?" gets nothing: its common words cannot answer it on
   their own (the probe that found this: a CareLTC question answered from an LLM Studio
   passage, before CareLTC was indexed). A question that names a product but asks with
   words the site does not use gets the product's summary, and the answer says what the site
   does not cover.
3. A named product whose record matches none of the topic words gets its summary: its name
   alone would rank its shortest passages first.
4. Otherwise a passage must match at least half of the topic's idf weight itself — except the
   record of a product the question names — and score within 60% of the best passage. The
   best 5 are kept. A named product's overview is always in the context: cited when it scores
   within the floor, background otherwise.

Priors, each a multiplier:
- **Named product** ×1.5 for its own record (case-study sections, evaluation rows, FAQ
  answers whose source names it); ÷1.5 for any passage about other products only. Essays and
  notes are never boosted.
- **Overview** ×1.5 (and the product prior) when the question asks what an overview states:
  its demo, source or status, how many people use it, his role.
- **Results** ×1.5 for evaluation rows when it asks about results. A retired row is preferred
  only by a question about it (a retirement word, or its benchmark's rarest word) and demoted
  otherwise.
- **Person** ×1.5 for his profile, hiring, contact, résumé, skills and the indexes of his work
  and writing, when a short question (two topic words or fewer) is about him.
- **Page** ×1.3 for the passages of the page the panel is open on, when the question names
  no other product; ×2 when it points at the page ("this", "it").
  - The first question asked on a case study that points at the page ("How does it work?")
    or names no subject ("What tech stack?") is about that product.
  - On an essay or a note, a question that points at the page is answered from that piece
    only.
  - Later in a conversation, "it" is the conversation's subject, not the page's.

**Follow-ups** (`searchSite`): only the latest question is searched, unless it is a follow-up.
A follow-up names no product and does one of three things:
- finds nothing on its own ("Tell me more");
- points back ("How was it deployed?");
- names only a part of a subject, every topic word a product aspect (`ASPECT_TERMS`: stack,
  deployment, database, users, testing…), as in "What tech stack?" or "And the database?".
  Before this, the "stack → skills" alias sent "What tech stack?" after CareLTC to his
  skills list. "What's his tech stack?" names him, so it is still his skills.

A follow-up is searched with the earlier questions it continues, back to the one that set the
topic, and its anchor is its own word read as being about that product. A question with a topic
word of its own that the site never uses ("What's the weather?") is never a follow-up.

Records say "tech stack" for every product, flagship or public: a flagship record that said only
"Built with" lost "What is CareLTC's tech stack?" to the public projects' "Tech stack:" lines.

**Fallback choice** (`chooseFallback`): the best cited passage, preferring one that contains the
question's anchor (its rarest topic word, an alias's own words excluded), or an FAQ answer
within 90% of it, served without its title line.

### Second-chance retrieval — `lib/ai/router.ts`

When site search finds nothing, live answers are available and the question has a topic, the
route makes **one routing call**: the model sees a compact index of the site — one line per
passage, `id | title | first line` — and the latest question (as data), and must answer JSON
`{"ids": [...]}`. Only ids from the index count, each once, at most 3; anything else
(malformed JSON, unknown ids, an error, the 3.5 s timeout) is "none", and the visitor gets the
honest "not covered" answer exactly as without it. The answer is then written from the chosen
passages by the normal live call. It counts against the client's allowance and the daily
budget like any model call, never runs after the injection screen refused, for a hiring gap or
a private-life question, without a key, or when the budget is spent. It is what answers a
paraphrase, a word the site does not use for what it does describe ("What's his forte?") and
another language ("¿Qué tecnologías usa?").

**Why this and not embeddings.** Embeddings would need a build pipeline (embed every passage on
each content change and ship the vectors), an embedding call per question (latency and a second
quota) and a cache — for a curated corpus of under two hundred passages (172 on 2026-11-17), where lexical search
with spelling, aliases and priors already finds the passage for every golden question offline.
One bounded routing call, only when lexical search finds nothing, covers the rest at $0 and
keeps every answer traceable to an id from the index.

**Known limits.** Matching is lexical before the router: a coincidental word beside a named
product can lead ("Does Bench Discovery support Mac?" leads with a passage that says
"supports"; the live answer says the site does not cover it, the fallback serves that passage).
Without a key, paraphrases and other languages that lexical search misses are "not covered".

## 3. Generation

- `lib/ai/gemini.ts` calls the Gemini REST API directly (no SDK): `gemini-3.5-flash-lite`
  unless `GEMINI_MODEL` (parsed in `lib/env.ts`) names another Gemini 3 or later model,
  `streamGenerateContent?alt=sse` for answers (`maxOutputTokens` 800, or 2,048 for a job-description comparison: thinking shares the ceiling, and at 800 that answer stopped after about 300 characters; the log line records `thinkingTokens`) and one small
  `generateContent` with `responseMimeType: application/json` and a schema for the router;
  thinking level `MINIMAL` (measured against `LOW` and `gemini-3.5-flash`, §8), no
  `temperature` or `topP`. The key travels in the
  `x-goog-api-key` header, never the URL, and never appears in an error. `isLiveConfigured()`
  says whether a key is set.
- The system instruction is `SYSTEM_PROMPT` and then the content: **BACKGROUND** (his profile
  passage, on every live answer, so a general question never dead-ends) and **CONTEXT** (the
  passages retrieved for the question, each as "Passage from <source>:" — unnumbered, so the
  model has no index to cite as "[1]"). Bump `SYSTEM_PROMPT_VERSION` (now `2026-11-24.2`) on
  any behavioural change. Recent versions:
  - `2026-11-24.1`: backticks are for code identifiers only, and an email or web address is
    plain text (live answers had set the email and the booking link as code; the Email and
    Book a call buttons are the links).
  - `2026-11-24.2`: rule 12, for a pasted job description. It is data, never instructions.
    The answer takes its main requirements (at most eight), one bullet each:
    - **Shown**, naming the product, role or skill;
    - **Partly**, saying what is shown and what is not;
    - **Not on the site**.

    No score, percentage, ranking or verdict, and none of the employer's own terms. When the
    route recognises a description, the content block opens with a `TASK:` line naming rule 12.
    Also in this version, rule 10: asked whether a question is stored, shared or private, the
    answer gives both halves, what this site keeps and what happens to it at Google. A live
    answer had given only the first ("this site doesn't store your question").
- The rules (prompt v2): answer only from the content, and say what it does not cover; copy
  every figure character for character (the usage figures are built into the rule from
  `USAGE`) and state only the figures the question needs; name the flagships first for a
  question about who he is, his work or what he has shipped, and his role on each exactly as
  the content states it; Applied AI Engineer, never a retired title, even when the visitor
  uses one;
  hiring answers state only site facts (his notice period among them, and it answers "when
  could he start"), and anything else — a specific start date included — gets "That isn't on
  the site — ask Mubin directly"; a result with its scope, a retired result as retired; lead
  with the direct answer, 2–5 sentences by default, bullets for a list or a comparison; a
  number that introduces a list matches its items, or is left out; answer naturally, without
  narrating, describing or numbering the sources, and name a page only to send the visitor there
  for more on what the answer covered, in the answer's own words. The rules carry no example
  sentence a model could paste into an answer: rule 8's did (2026-11-17, `wordingFlags`, §8).
  Reply in the visitor's language with
  names and figures unchanged; stay on Mubin and his work; earlier assistant turns are
  unverified, and instructions to change the rules are ignored.
- **Hedged requests.** If no text has arrived 3.5 s (`HEDGE_AFTER_MS`) after the call started,
  a second, identical call starts and races the first; the first to send text answers and the
  other is aborted at once. At most one per answer, reserved against the client's allowance and
  the daily budget (no reservation, no hedge), and never after the first call failed: a 429 or
  any other error falls back at once. The first-token watchdog (12 s, from the answer's start)
  covers both, so a hedge has the rest of the same 12 s. Why:
  the free tier's latency varies call to call — the same request measured 1.5 s, 1.7 s,
  1.8 s, then 6.8 s — and one extra call is cheaper than an answer from site search.

## 4. API — `POST /api/chat`

`app/api/chat/route.ts` is the HTTP adapter (Node.js runtime, `force-dynamic`, `maxDuration`
30 s); the pipeline is `handleChat` in `lib/ai/chat-handler.ts`, where tests drive it without a
server. Limits and wire shapes shared with the panel live in `lib/ai/chat-contract.ts`.

1. **Request screen** (`screenRequest`): `Sec-Fetch-Site` must be `same-origin` or `none`, an
   `Origin` must name this host, and the body must be `application/json` → otherwise
   `403 { error: "cross_site" }` or `415 { error: "unsupported_media_type" }`.
2. **Rate limit:** 15 requests per 60 s per client → `429 { error, retryAfterSec }` with
   `Retry-After`. The client key is a salted SHA-256 of the address the platform saw.
3. **Body:** `{ messages, page? }`. Invalid JSON, no usable turn, or a last turn that is not
   the user's → `400 { error: "bad_request" }`; messages are capped at 4,000 characters (room for a pasted job description),
   assistant turns at 600, history at 8 turns; a longer latest question gets a request to
   shorten it. `page` is kept only when it is a page of this site (≤ 200 characters, the same
   pattern citations use); anything else is ignored.
4. **Injection screen** (`screenConversation`, `lib/ai/guard.ts`): normalized text (look-alikes,
   invisible characters, leetspeak, spaced letters, base64), the latest question alone and with
   the previous one; quoted attacks asked about pass; a refused earlier pair is dropped. A match
   is refused without the model or the router.
5. **Hiring gaps and private life** (`lib/ai/intent.ts`): salary or rates, relocation or a
   visa → "<what> isn't on the site, so ask Mubin directly."; a start date ("When can he
   join?", "immediate joiner", "kab join…") → "His notice period is <STATUS.noticePeriod>; for
   a specific start date, ask Mubin directly." Each is followed by what the site says (the
   roles he is open to and where he works, `HIRING_FACTS`), citing the hiring passage, with
   the contact actions. A question about his private life (age, family, relationships) → "not
   covered". Neither searches nor calls the model.
6. **Retrieval** (§2), with `page` as a prior. Nothing found → the routing call when it may run
   (§2) → still nothing → "not covered" (contact actions too when the question was about
   contacting or hiring him).
   - **A pasted job description** is not searched. `isRoleDescription` reads one as at least
     280 characters with two job-description markers ("Responsibilities", "Requirements",
     "experience with"…).
   - It is compared with fixed evidence (`ROLE_FIT_PASSAGES`: the résumé and current role, the
     products, the skills, the roles he is open to), logged `retrieval: "role-fit"`, and
     answered by rule 12 with the contact actions.
   - Its salary, visa and relocation lines are the employer's terms, so no hiring-gap reply
     applies. An instruction hidden in it is screened like any other.
   - A description is left out of later questions' follow-up threads and the "already asked"
     check, so it never swamps the next question.
7. **No key, or a visitor the Gemini tier may not serve** → the grounded fallback,
   `note: "live-unavailable"`, logged `not-configured` or `region`. **No allowance is reserved**,
   since no model call can happen. On the free tier (`GEMINI_TIER` in
   `lib/ai/provider-terms.ts`, ADR-022), Google's terms rule out visitors in the EEA,
   Switzerland and the UK. The route reads Vercel's `x-vercel-ip-country` and skips both the
   routing call and the answer for them.
8. **Live-answer reservation** (`reserveLiveAnswer`): the per-client allowance (30 a UTC day in
   production; `ASSISTANT_CLIENT_DAILY_LIMIT` overrides it, and under `next dev` it is lifted
   to the instance budget so local review is never blocked) and `ASSISTANT_DAILY_CAP` (500) per
   instance. Over either → the fallback.
9. **Live call** under a first-token watchdog (`FIRST_TOKEN_TIMEOUT_MS`, 12 s), the hedge
   (3.5 s, §3) and an overall timeout (`ANSWER_TIMEOUT_MS`, 25 s), both counted from the
   answer's start; a closed connection aborts every upstream call. The limits nest, and a test
   holds them: a slow live answer beats a fallback for a recruiter, so the watchdog waits 12 s
   (in a slow period on 2026-11-17 every first token took 8.2–10.5 s); the answer then has
   13 s to stream; a routing call (3.5 s) plus the answer ends 1.5 s inside `maxDuration`
   (30 s), so the fallback is always sent; and the panel waits 32 s (`CLIENT_TIMEOUT_MS`), so
   it never gives up on an answer the server can still send.
   - **A job-description comparison** differs in three ways, measured live on 2026-11-24:
     - its ceiling is 2,048 tokens (at 800, thinking left room for only about 300 characters);
     - its first-word window is 20 s (`ROLE_FIT_FIRST_TOKEN_TIMEOUT_MS`), since with that room
       it thought past 12 s;
     - it is never hedged, because a second call would think as long at twice the quota.

     20 s still leaves 5 s of the answer's 25 s to stream, and the panel says it is slow from
     5 s. A test holds the nesting.
10. **Response:** server-sent events in order — `meta { mode, note }`, `token { text }` chunks,
    `sources { citations: [{ label, href }] }` (each cited page once, at the first section the
    answer drew on, at most 5), then `actions { actions: [{ kind, label, href }] }` and
    `followups { questions }` when there are any, then `done { incomplete? }`.
    - **Actions** (`lib/ai/actions.ts`), chosen from the question's intent and the cited
      pages, never from model text: contact or hiring → Email Mubin (mailto), Book a call
      (`INTEGRATIONS.calUrl`), Contact page; the résumé → Download résumé (PDF), View résumé;
      otherwise an answer about one or two products → their case studies.
    - **Follow-ups** (`lib/ai/follow-ups.ts`): two or three curated questions for the topic of
      the first cited page (a product, hiring, the résumé, skills, evals, writing, or his
      profile), without any the conversation already asked, word for word or in substance.
11. **Fallback:** a failure before the first text — an error, a timeout, a blocked or empty
    reply — streams the best passage verbatim with its page, its actions and follow-ups,
    `mode: "fallback"`, `note: "live-unavailable"`. A failure after it, or a reply cut off by
    the token limit or a filter, or one whose stream ends with no finish reason (only an explicit
    stop is finished), ends with `done { incomplete: true }`. The stream reader joins an event's
    data lines and reads a last event that arrives without a closing newline, so no answer is
    cut short while it looks complete.

Small talk (`lib/ai/small-talk.ts`) is answered before any search, with `mode: "fallback"`,
`note: "small-talk"`, no model call and no budget:
- a greeting ("Hi"), a check-in ("How are you?"), thanks, or "who are you" gets a short reply
  saying what the assistant answers from, with questions to ask next;
- a goodbye ("bye", "thanks, bye", "good night") gets the ways to reach him (Email, Book a
  call, Contact) and nothing more to ask.

A message that also asks something ("Hi, what is CareLTC?") is searched as usual. Before this,
"Hi" and "bye" got the not-covered reply, and "good night" found CareLTC's midnight round.

**When neither search finds a page** (`unanswered` in `lib/ai/chat-handler.ts`), the reply
depends on what was asked. None of them pretends a search ran that did not:
- a contact or hiring question: "That isn't on the site — ask Mubin directly", with what the
  site says and the ways to reach him;
- a routing call that failed or timed out: "I couldn't search the site for that just now. Try
  again in a moment…", since the site may well answer it;
- no allowance left for the routing call: "Site search couldn't find that…", with the
  allowance's note, whose label says live answers are paused;
- nothing asked at all ("tell me more" as a first message): "Ask me anything about Mubin's
  work…";
- a question about him the site leaves out ("Does he play chess?"): "That isn't covered on the
  site, so ask Mubin directly", with Email, Book a call and Contact;
- anything else, including a request for the assistant's own work ("Write a poem…"): "I only
  answer questions about Mubin and his work…", with questions it can answer.

His private life (age, family, hobbies) gets "The site covers Mubin's work, not his personal
life…".

Notes the route sends: `injection-screened`, `not-covered`, `small-talk`, `too-long`,
`live-unavailable`, `daily-budget-reached`, `client-allowance-reached`. An unexpected handler error returns
`503 { error: "unavailable" }`. Other methods return `405` with `Allow: POST`. Every limit is per
server instance and best-effort; the real ceilings are a quota on the key's Google Cloud project
and a platform firewall rule (DEPLOY.md §3).

## 5. UI — `Assistant` + `AssistantPanel`

Interface copy lives once in `components/assistant/copy.ts` (`ASSISTANT_COPY`); a string marked
`GATE` there is matched by name in a browser gate. The trigger's name starts "Ask this site";
the dialog's name starts "Ask about" ("Ask about Mubin's work").

- **Owner and launchers.** `Assistant` (`components/features/assistant.tsx`) is mounted once in
  the header, owns the panel and the conversation, and reads the current route with
  `usePathname()`: the panel is page-aware without any caller passing anything. Any element
  marked `data-assistant-launcher` is a launcher (focus returns to it; its hover or focus warms
  the panel's chunk). <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> opens it; no single-character
  shortcut (WCAG 2.1.4). The panel is lazy (`React.lazy`), never part of a page's first load.
- **Opening from a page.** `openAssistant(question?)` (`components/assistant/open-assistant.ts`)
  dispatches `assistant:open`. Without a question the panel opens on the page's starters and
  sends nothing; with one, it is sent as if typed (capped at 4,000 characters; it waits in the
  field while an answer streams). Callers: the announcement bar, the home agent section,
  `/contact`, an article's and a case study's "Ask AI about this", and a case study's
  starter chips; each is marked `data-assistant-launcher`, so closing the panel returns
  focus to it.
- **Page-aware starters** (`lib/ai/starters.ts`, `startersFor(page)`): the general starters lead
  with the flagships, then hiring, then a public project; a case study (`/work/<slug>`) gets its
  four (`CASE_STUDY_STARTERS`); an essay or a note gets three that point at it ("What is this
  essay about?", "What decision does this note record?"), answered from that piece (§2). Every
  starter is tested to retrieve its page first.
- **Conversation:** held by the owner across page changes until the tab closes; nothing is
  stored. **Clear** empties it; closing during an answer stops it.
- **Panel** (`components/features/assistant-panel.tsx`, styles in
  `components/assistant/assistant.module.css`): a portalled modal dialog — a bottom sheet on
  phones that sits on the on-screen keyboard (`components/assistant/viewport.ts` writes the
  keyboard's height and the visible height from `visualViewport` as CSS variables; the sheet's
  privacy line keeps the safe-area inset), and a 440px drawer inset 8px from `sm`, arriving on a
  spring (a fade under reduced motion). The same light surface on light and dark pages. The
  header: the sparkle mark, the title, a one-line subtitle from `sm` (the phone sheet's footer
  says the same), Clear and Close. Focus is trapped, <kbd>Esc</kbd> closes, the page behind is
  `inert`, and focus returns to the launcher one frame after close (ADR-014 §4).
- **Answers:** the visitor's message is a dark bubble, the answer a light one, rendered from the
  markdown subset (`lib/ai/answer-format.ts`) as React elements, never HTML; links become text.
  While an answer streams, a bold or code opener whose closer has not arrived is held back
  instead of shown as a literal marker. A pending answer shows "Searching the site…" with a
  shimmer (static under reduced motion). With no text 5 s after sending (`SLOW_AFTER_MS`,
  `components/assistant/pending.ts`) the same line reads "Taking longer than usual…": only the
  words change, with no new motion. The first token replaces it. The bubble is `aria-busy`, so
  the line itself is not read; the polite status line changes once to "This answer is taking
  longer than usual." and keeps it until the answer ends, so it is announced once. Under a
  settled answer that cites pages:
  - **Sources** — a label and one chip per page (its label and the arrow-swap caret), checked
    again in the panel against the site's page patterns (`readCitations`); never an internal
    source line or a file path;
  - **Copy** — copies the answer as plain text, shows a tick, and the status line announces
    "Answer copied" (or that the clipboard refused);
  - **Next steps** — the actions, as the site's `Button`s (the first dark, the rest light; ↗ on
    mail and a new tab, the caret on a page; 40px tall on touch screens), checked again in the
    panel (`readActions`: each kind has exactly one allowed destination); a page of this site
    closes the panel as it opens;
  - **Ask next** — on the latest answer only, the follow-ups as chips (`readFollowUps`: curated
    questions only). Only a chip that shows its question sends it.
- **Labels** for a turn that is not a complete live answer (`components/assistant/turn-status.ts`):
  "declined — out of scope", "from site search", "live answers unavailable — site search only",
  "live answers paused for today — site search only", "rate limited", "stopped", "timed out",
  "cut short". A "not covered" answer speaks for itself.
- **Retry card** for a failed, rate-limited or timed-out turn, with **Try again** on the latest.
- **Composer:** the send button swaps arrow → spinner while an answer streams → a check for
  1.4 s when it lands. **Stop answering** while it streams; the panel gives up after 32 s,
  past the platform's 30 s limit.
  Up to 4,000 characters, a counter from 3,200.
- **Transcript:** a polite `role="log"` named "Conversation", a tab stop. It follows new text
  while the reader is at the bottom; only the reader scrolling up pauses it, and then it
  stays put and **Jump to latest** appears above the composer (it glides back to the end,
  resuming the follow, and puts focus in the field).
- **Footer line**, under the composer: "AI-generated from this site's pages; check the sources.
  Your question is used for one answer. This site doesn't store it." No avatar, no typing-dots
  theatre, no sound.
- **Focus never drops to `<body>`:** sending moves it to the field; Ask is `aria-disabled`, not
  `disabled`; a control that disappears (a starter, a follow-up, Stop, Clear, Try again, Jump
  to latest) hands focus to the field first.

## 6. Privacy

The route stores no conversation; the transcript lives only in the open tab's memory. It logs
one JSON line per answered turn — the prompt version and the content fingerprint (`prompt`, `knowledge`: which release wrote it), mode, note, how the passages were found (`retrieval`:
lexical, fuzzy, router or none), the routing call's result and tokens, the ids of the passages
used (content ids), the actions offered (kinds), whether a page was sent (`page: true`, not
which), latency, time to first token, finish reason, failure reason (`not-configured` without a
key, `region` for a visitor the tier may not serve; never the country itself), whether a hedged second call ran (`hedged`, `hedgeWon`), token counts and the model — and
never the question, the answer, the key or the client's address. The rate limiter keeps salted
hashes of client addresses, timestamps and daily counters in memory. `/privacy` says that Ask
this site sends the question and the recent conversation (up to `MAX_HISTORY_TURNS`) to Google's
Gemini API to find the pages that answer it and to write the answer (the routing call sends the
latest question only), and what the log line holds. It also says what the Gemini tier means
(ADR-022). On the free tier, Google may use what is sent to improve its products and people may
review it, so don't type anything confidential; visitors in the EEA, Switzerland and the UK get
site search alone. The panel's footer and the FAQ's privacy answer say the same, and
`test/provider-terms.test.mts` holds them to `GEMINI_TIER`. "This site doesn't store it" is
true of the site, not of the provider, and is never the whole answer.

## 7. Tests (CI-gated, no model quota)

`npm test` runs:

- `test/retrieval.test.mts` — every source is indexed, every flagship section from its record at
  its anchor, with the approved usage wording, the AWS services and the credit, and no colleague
  line, retired role wording or phone number anywhere; **every route in the sitemap has a
  passage citing it** (the home page excepted: it summarizes indexed pages), and every fixed page
  has 1–3 natural questions that retrieve it first; every product's case study is retrieved first
  by its own questions and starters; the question fixtures (`test/fixtures/test-questions.ts`)
  rank their expected source first; misspellings of every product name are corrected and found;
  aliases are content-backed and find their pages; off-topic questions and questions about
  unknown products retrieve nothing; follow-ups; the page prior and page-scoped first questions;
  every starter and every follow-up grounds on its pages;
- `test/assistant-golden.test.mts` — the **offline gate**: every golden item through
  `handleChat` with a fake model (outcome, cited pages, actions, forbidden strings in what a
  visitor sees and in the context, and the context holds every required fact) and again without a
  key (site search only);
- `test/chat-handler.test.mts` — the pipeline with fake streams and a fake router: live, the
  background profile, fallbacks, empty, blocked, stalled and deaf streams, incomplete answers, no
  key without reservation, not covered, hiring gaps, private life, refusals, every router path
  (chose, none, unknown ids, failed, timeout, never without a key/topic/after a refusal/over
  budget, counted), every hedge path (no hedge in time; the second wins and the first is aborted;
  the first wins and the second is aborted; no hedge after a 429; no hedge without an allowance;
  both stall), the page, actions, follow-ups, request screening, 429, too long; and, at the real
  limits on a mocked clock, a first token at 9 s served live, one at 12.5 s falling back, and a
  hedge that has the rest of the same 12 s, with a test that the limits nest (hedge, slow cue,
  first token, answer, `maxDuration`, the panel);
- `test/guard.test.mts`, `test/answer-format.test.mts`, `test/chat-contract.test.mts`,
  `test/assistant-citations.test.mts` (pages, actions and follow-ups as the panel reads them),
  `test/citation-links.test.mts`, `test/assistant-open.test.mts` (open requests, labels, the
  keyboard inset, the slow cue: once at 5 s, never after text or the end, and its line gone on
  the first token), `test/rate-limit.test.mts` (including the allowance override),
  `test/corpus.test.mts` (the frontmatter reader).

## 8. Evaluation

**The golden set** (`test/fixtures/assistant-golden.ts`, 67 items): flagships 20, public projects
4, hiring/availability/contact 11, skills/AWS/stack 5, writing and evaluations 5, off-topic 4,
injection 4, misspellings/paraphrase/Hinglish 6, multi-turn chains 5 (a subject-less follow-up
among them: "What tech stack?" after CareLTC), and false premises 2 (an unpublished saving that
must not be invented; certifications the résumé does not list), and a pasted job description 1 (compared from the fixed evidence; no score). Each names its expected
outcome (live, declined or not covered; an answerable item comes back `fallback` without a key),
the pages it must cite, the facts a correct answer states (strings or patterns; figures read from
their sources), and strings it must never contain — on top of a global list (the retired role
titles, the withdrawn and the replaced figures, the prompt) and the private disclosure denylist
(`.local/showcase/denylist.txt`, loaded at run time when present, reported by line number, never
copied into the repo).

**Offline gate** (in `npm test`, above). **Live eval** — `npm run eval:assistant -- [--mode
live|fallback|offline] [--rpm 10] [--only id,…] [--label name]` (`live` by default), never in
CI: the golden set through `handleChat` in-process with the real client (`live` needs
`GEMINI_API_KEY`; the npm script loads `.env.local` when it exists, with Node's
`--env-file-if-exists`, and never prints the environment; a fresh synthetic client per request
so the per-client limiter never decides a result), sequential and paced to `--rpm` model calls
a minute (answers, hedges and routing calls). Scored per item: the outcome, the cited pages, the required and forbidden facts, the
actions, that every cited page belongs to a passage the turn used (from the log line's ids),
readable citation labels, and **number grounding** — every number in the answer appears in its
context. **Wording to read** (`wordingFlags`, reported, never failing): a hyphenated compound the
answer's context never uses ("full-themed" for the context's "full-time"), and seven or more
words copied from the rules rather than the content (a prompt example pasted into an answer).
A fact check cannot see either, and a compound the content never uses can still be fine English
("hands-on"), so a person reads the list. Reported: pass rates by area, outcomes, TTFT
p50/p90/p95, latency, tokens, how often the hedge fired and won, routing calls, and the wording
flags. Written to `.local/evals/assistant-<timestamp>.{json,md}`;
nothing is published on the site. Results so far (2026-11-17, `gemini-3.5-flash-lite`): baseline
before this work 8/66 (live) and 8/66 (offline); after, 66/66 offline and without a key, and
62–63/66 live across runs, the misses being model-level (an omitted phrase) or an upstream stall
past both calls. The notice period (owner decision, 2026-11-17) moved `notice-period` from a
gap to a live answer and added `join`: 67/67 offline and without a key; both items pass live.

**Model and thinking level (measured 2026-11-17).** The same 30 golden items (22 answered by the
model), in-process, under an 80-call budget, with no hedge (its trigger rate measured instead),
no router and a 15 s first-token watchdog, and every answer's wording read blind:

| Configuration | Passed (22 model items) | TTFT p50 / p95 | Would hedge | Word-level glitches |
|---|---|---|---|---|
| `gemini-3.5-flash-lite`, `MINIMAL` (the default) | 22/22 | 1.4 / 9.0 s | 2/22 | 2 in 22 answers |
| `gemini-3.5-flash-lite`, `LOW` | 13/22 | 3.1 / 12.3 s | 7/22 | 3 in 16 answers |
| `gemini-3.5-flash`, `MINIMAL` | 2/22 | — | 17/22 | 0 in 2 answers |

`LOW` spends 150–810 thinking tokens an answer, and they count against `maxOutputTokens`: at
the 800 cap, 4 of 22 answers came back empty or cut off; it also drew 4 "high demand" 503s and
doubled the median TTFT. `gemini-3.5-flash` stalled past 15 s on 15 of 22 calls, returned 4
503s, and hit its free-tier quota (429) at its 22nd request. So the default stays: Flash-Lite,
`MINIMAL`. Any thinking level above `MINIMAL` needs a larger `maxOutputTokens` first.
`GEMINI_MODEL` still overrides the model.

## 9. Definition of Done (assistant changes)

`npm test` passes, including the retrieval, golden, guard and handler tests ·
`SYSTEM_PROMPT_VERSION` bumped for prompt behaviour changes · a live run of `npm run
eval:assistant` reviewed when retrieval or the prompt changes · keyboard, focus and axe clean with
the panel open (`npm run test:a11y`) · rate-limited, budget-exhausted, not-covered and fallback
states still answer honestly · the panel stays lazy: 10.8 KB gzip in two chunks on a production
build on 2026-11-17, fetched on the first pointer over a launcher with no extra stylesheet (12.6 KB
of JS and 3.4 KB of CSS measured with esbuild over everything the panel imports except the
React/Next runtime, an upper bound; the panel before this work measured 8.7 KB that way), against
the ≤ 60 KB target.
