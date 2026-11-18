# ADR-019 — Named flagship case studies

Status: **Accepted**, 17 November 2026. Supersedes the field-report parts of ADR-018
(the `/work/field/[slug]` row of decision 6 and the field-report sentence of
decision 7), as its dated amendment records. `spec/CONTENT_MODEL.md` §1.5 specifies
the content model this record chooses; design-system.md §7.1 the page and §7.2 the
content law.

**Amended 18 November 2026: a third flagship, SignFlow.** The owner reports the
employer's permission for "all things", and SignFlow, Sevina's in-house e-signature
platform, joins under every rule below: the approved usage figure word for word
("50+ users"), the owner's credit sentence, captures and a recording of the real app on
dummy data (run locally from a private copy), curated code excerpts, no production
repository, URL or client name. Its record tells no incident, because none is on
record, and the page shows no "What broke" section rather than invent one.

## Context

Bench Discovery and CareLTC are the strongest production work on the site: two
products in use, built at Sevina Technologies, where Mubin's job title is AI/ML
Engineer. Until 17 November 2026 they appeared as two anonymous field reports
(`/work/field/records-triage` and `/work/field/nfc-room-rounds`): drafts behind a
`published` flag and `noindex`, naming no organisation, product or customer, and
publishing no usage figure. A report nobody can check reads as an unattributed claim,
so the site's best evidence worked against the charter's first principle, "evidence
over claims".

On 17 November 2026 the company's CTO gave written approval to publish both products
by name, with:

- the names Sevina Technologies, Bench Discovery and CareLTC;
- the usage figures, in the owner's wording;
- screenshots and screen recordings of the real apps, running on dummy data;
- curated code excerpts;
- the AWS services the products run on.

The approval does not cover the production code, repositories or URLs, client or
facility names, customer data or security details. Two facts shaped the wording: the
git history does not show who wrote which code (the owner, 17 November 2026), and no
record supports a usage frequency.

## Decision

1. **Named case studies.** `/work/bench-discovery` and `/work/careltc` replace the
   field reports. One template (`components/flagship/`) renders both from typed
   records (`content/flagship/`), and the old URLs answer 308 (`next.config.ts`).
   Each case study publishes:
   - the approved usage figure, word for word: `USAGE` in `content/flagship/shared.ts`,
     which every page, card, the résumé and the assistant read, so nothing restates
     it, and which `test/llms-txt.test.mts` holds the hand-written `public/llms.txt`
     to. Beside it stand test counts whose method is on the page, and an explicit
     "Not measured" list;
   - captures and recordings of the real apps on dummy data, each frame labelled
     "Real app · dummy data" inside it;
   - five curated, sanitised code excerpts per product, under generic file labels, each
     with a two-sentence story;
   - the AWS service names (typed `AwsService`), never an account, a region or a
     resource.

   The products are named across the site: the home page, the Work menu, `/work`,
   `/about`, `/hire`, `/trust`, `/now`, the "Used in" evidence on `/skills` and `/uses`,
   the résumé, `public/llms.txt` and the assistant.
2. **What stays private.** Production repositories, production URLs and hostnames,
   account and resource identifiers, regions, real client and facility names, customer
   data, keys and secrets, and security incidents (the incident lists hold none). Each
   page carries "Private repository · walkthrough on request", and its walkthrough card
   lists what a call covers and what stays private.
3. **Credit that never relies on git attribution.** The only attribution is the
   owner's own sentence, in the present tense (`credit.role`), shown as "My role"
   beside "How I build", the approved line on directing AI coding agents. No colleague
   is named or described anywhere (a page, an excerpt, the résumé, the assistant's
   index), and no part of the code is attributed to anyone from git history.
4. **"In use", never a frequency.** The status pill says "In use"
   (`STATUS_PILL["in-use"]`). No page says "daily", or any other frequency the records
   do not support.

## Disclosure machinery

- **A local denylist.** The private names and identifiers that must never appear
  (clients, facilities, people, hostnames and the like) live in one local file,
  `.local/showcase/denylist.txt`. The `.local/` folder is ignored by git
  (`.gitignore`) and by Vercel uploads (`.vercelignore`). The list is never committed,
  quoted or copied into the repository, and no document repeats its entries.
- **Scanned before every change and on the built output.**
  `rg -i -F -f .local/showcase/denylist.txt` over the source folders (`app`,
  `components`, `content`, `config`, `lib`, `public`, `styles`, `scripts`, `test`,
  `next.config.ts`) and the docs must return nothing before a change lands, and over
  the built output (`.next/static` and the prerendered HTML and RSC) before a release.
  Every scan runs with a positive control: one line of the list, copied into a scratch
  file outside the repository, must match, so an empty result means clean rather than
  a broken scan.
- **The assistant's evaluation** (`npm run eval:assistant`) loads the list at run time
  when it is present and reports a hit by line number only (AI_ASSISTANT.md §8).
- **Tests hold what can be checked without the list:** the usage figures and the
  credit word for word, no "daily" and no superseded figure
  (`test/flagship-content.test.mts`); the usage wording in `public/llms.txt`
  (`test/llms-txt.test.mts`); no colleague line in the assistant's index
  (`test/retrieval.test.mts`); and the résumé's approved facts
  (`test/resume-pdf.test.mts`).

## The media pipeline

- **Captures and posters:** WebP, at most 300 KB each, under `public/showcase/<slug>/`,
  at the pixel size their record declares.
- **Recordings:** WebM, at most 7.5 MB each and silent, each with a WebP poster and a
  WebVTT caption track whose cues match the page's scene list, the recording's text
  alternative. A page fetches no video until it is played (`preload="none"`, a lazy
  poster laid over it), and nothing autoplays.
- **Looked at before publishing:** every capture and poster at full size, and every
  recording, show dummy data only, and nothing that reads as a secret, not even a dummy
  one.
- `test/flagship-content.test.mts` checks that every file exists at its declared size
  and that each caption track says what the scene list says, at the same times. The
  byte budgets are held by review.

## Consequences

- The strongest work can be checked: a reader sees the real products and the approved
  figures, and can ask for a walkthrough of the rest.
- Every change to the flagship content carries a disclosure duty: the denylist scan,
  the approved wording, and new captures on dummy data when a product's screens change.
- A new figure, name or kind of media needs new approval. The records in
  `content/flagship/` hold only what was approved, and the usage figures and the media
  are read from them wherever they appear. Other surfaces carry some wording of their own
  about the products (the home page's cards, the menu lines, the résumé bullets, `/now`,
  the FAQ, the assistant's starters and `public/llms.txt`), so narrowing the approval
  later means the records plus a search for the product names.
- The pages are long, about 20,000px at 1440px; on phones `ShowMore` holds back the
  long secondary lists (design-system.md §5).

## Alternatives considered

- **Anonymous field reports** (the state before this record): no disclosure risk, but
  no evidence anyone could check. The names were withheld, no usage figure was
  published, the reports stayed `noindex` drafts, and `/hire` and `/trust` had to say
  so.
- **Named, text only:** the names and figures without captures, recordings or code.
  Rejected: the approval covers the media, and a case study without the product on
  screen reads as a claim.
- **Publishing the production code or a production link:** not approved, and it would
  expose client data and infrastructure. Code is shown as curated excerpts, and the rest
  on a walkthrough call.
