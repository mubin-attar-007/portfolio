# ADR-022 — The assistant follows the Gemini API's free-tier terms

Status: **Accepted**, 24 November 2026. Amends `spec/AI_ASSISTANT.md` (live answers) and the
privacy page.

## Context

The assistant's key runs on the Gemini API's free tier ("Unpaid Services"). A review of the
assistant against current practice (an external AI review, checked against Google's terms)
found two duties the site did not meet:

- **Where the free tier may be offered.** Google's Gemini API Additional Terms say: "You may
  use only Paid Services when making API Clients available to users in the European Economic
  Area, Switzerland, or the United Kingdom." This wording appears in every archived version
  checked (25 September, 7 October and 20 November 2025). The site served live answers to
  every visitor.
- **What visitors are told.** On the free tier, Google may use what is sent to improve its
  products, and people may review it. The privacy page, the panel's footer and the FAQ
  answer said only that this site stores no transcript, which is true but leaves that out.

## Decision

1. **`lib/ai/provider-terms.ts` holds the tier** (`GEMINI_TIER`, now `"free"`) and the
   countries the free tier may not serve: the 27 EU states, Iceland, Liechtenstein, Norway,
   Switzerland and the UK.
2. **On the free tier, a visitor in those countries gets no model call.**
   - The route checks `liveAllowed` before the routing call and the answer.
   - The visitor gets the grounded site-search answer, labelled "live answers unavailable —
     site search only", as when no key is set.
   - The country is Vercel's `x-vercel-ip-country` header, set at its edge, which a client
     cannot supply. A request with no reported country (local development) is served.
   - The log line records `failure: "region"`. It never records the country.
3. **The privacy page, the panel's footer and the FAQ answer say what the tier means.** On
   the free tier: Google may use what is sent and people may review it, so don't type
   anything confidential; visitors in the EEA, Switzerland and the UK get site search alone.
   `test/provider-terms.test.mts` fails if the FAQ answer or the footer disagrees with
   `GEMINI_TIER`.

## Consequences

- Visitors in the EEA, Switzerland and the UK get site-search answers, not written ones,
  until the tier changes. Every page, citation and contact action still works for them.
- **The recommended next step is the paid tier.** It needs billing enabled on the key's
  Google Cloud project (an owner action, DEPLOY.md §3). Three changes then ship together:
  - `GEMINI_TIER` becomes `"paid"`;
  - the FAQ answer drops the free-tier sentences;
  - the privacy page's paid-tier sentence takes over automatically.

  On the paid tier, Google does not use prompts or responses to improve its products, and
  the regional rule no longer applies. The site's own daily caps and the Google Cloud quota
  still bound the cost.
- Google's terms change. Recheck them when the model or the tier changes, and record the
  check here.

## Owner decision (24 November 2026)

Stay on the free tier: billing stays off, so the regional rule and the free-tier wording stand.
The site also stays on Vercel's Hobby plan. That plan is for personal, non-commercial use,
which a job-search portfolio is; move to Pro if the site starts selling services. Revisit
both if either changes.
