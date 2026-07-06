# BRAND POSITIONING — fill this in before Sprint 3

This file is the content bottleneck for the entire site. Code cannot compensate for a
weak positioning statement or an empty proof inventory. Budget half a day here.

## 1. Positioning statement (formula)

> I build **{category of systems}** for **{who / domain}** — **{proof clause}**.

Rules: no adjectives ("passionate", "innovative"), no buzzwords, one domain, one claim
the rest of the page will prove.

### Recommended positioning (based on your actual work — edit freely)

Your differentiator against typical 2026 AI/ML applicants is not "I know RAG."
It's **operator + builder in a regulated industry**: you design, ship, and *operate*
production AI systems inside healthcare businesses you run, where compliance and
reimbursement are unforgiving. Almost nobody applying to AI/ML roles can say that.

Headline candidates:

1. "I build production AI systems for regulated healthcare."
2. "AI systems for healthcare reimbursement and compliance — designed, shipped, and operated."
3. "I turn clinical and billing data into audited, revenue-grade AI systems."

Supporting paragraph pattern (2 sentences max):

> "{Domain systems} — {system type 1}, {system type 2}, {system type 3} — running daily
> in production across facilities I operate. Everything on this page is real: every
> metric links to how it was measured."

Example draft:

> "Reimbursement optimization, clinical-compliance validation, and billing-audit
> engines running daily across skilled-nursing facilities I operate. Everything on
> this page is real — every metric links to its method."

## 2. Proof inventory (fill every row — this becomes the site's evidence)

| Claim to prove | Artifact | Metric + method | Status |
|---|---|---|---|
| Can design LLM systems | Flagship case study #1 | e.g. accuracy/recall vs. baseline, eval set size | ☐ |
| Can build deterministic + AI hybrids | Case study #2 | rules count, false-positive rate, $ API cost avoided | ☐ |
| Can run systems in production | Ops section of each study | uptime, daily run cadence, incident notes | ☐ |
| Understands evaluation | Eval harness writeup | golden-set size, regression gates | ☐ |
| Makes real trade-offs | DecisionLog entries | latency/cost/quality comparisons | ☐ |
| Learns from failure | FailureLog entries | v1 → v2 metric deltas + cause | ☐ |
| Writes maintainable code | Public repo / excerpt | CI badge, test coverage on core lib | ☐ |
| Communicates clearly | 3 published pieces | — | ☐ |

## 3. Candidate flagship case studies (from your existing systems)

These map your real work to the case-study template in `CONTENT_MODEL.md`. Pick ONE
for Sprint 4; the others follow.

| Candidate | Why it's strong | Evidence hooks |
|---|---|---|
| **PDPM/MDS optimization pipeline** (deterministic Python engine + audit dashboards, multi-facility daily runs) | End-to-end production AI-adjacent system with money on the line; deterministic core + LLM assist is a sophisticated architecture story | Daily cadence, per-diem impact modeling, SCSA delta-engine design, dashboard rendering constraints |
| **Clinical assessment validation engine** (291 rules, pure C#, zero API cost) | Beautiful "boring tech wins" narrative: why rules beat an LLM here — the exact judgment hiring managers screen for | Rule count, latency, $0 inference cost vs. projected LLM cost, false-positive tuning |
| **DME billing compliance audit engine** (ruleset revisions, payer-specific logic, five-sheet outputs) | Shows iterative ruleset evolution (Rev 1→4), payer edge-case handling, real operational output | Rules evolved per revision, claims scanned/day, correction rates |
| **Quality-measure projection engine** (CMS scoring tables, report parsing) | Forecasting + parsing messy regulatory data — classic applied-ML-adjacent problem | Scoring-table implementation, parser robustness cases |

**Compliance guardrail (non-negotiable):** case studies show *methodology and aggregate
metrics only*. No PHI, no resident-level data, no facility-identifiable claims figures,
no payer-contract terms. Recreate dashboard screenshots with synthetic data. When in
doubt, describe the mechanism and omit the number.

## 4. Bios (write all three)

- **One-liner (nav/footer/OG):** {{FULL_NAME}} — {{ROLE_HEADLINE}}.
- **Short (about teaser, ~50 words):** who you are, what you build, one proof point, location.
- **Long (about page, ~150 words):** operator+builder arc → why this domain → how you
  work (principles, not adjectives) → what you're looking for → one human line.

## 5. Voice

Plain, precise, first person singular. Short sentences. Numbers over adjectives.
"Why" before "what." Sentence case everywhere. Banned words: passionate, innovative,
cutting-edge, seamless, leverage, revolutionize, world-class, ninja/guru/wizard, 10x.

## 6. Final values (fill, then find/replace across repo)

```
{{FULL_NAME}}      =
{{ROLE_HEADLINE}}  =   (headline candidate chosen above)
{{DOMAIN}}         =   (e.g. yourname.com — prefer firstlast.com; short, no hyphens)
{{EMAIL}}          =
{{GITHUB_URL}}     =
{{LINKEDIN_URL}}   =
{{LOCATION}}       =
```

## 7. Off-site alignment checklist (do at launch)

- LinkedIn headline = site headline (verbatim). Featured section links to flagship case study.
- GitHub profile README: 3 pinned repos matching the case studies; each README opens
  with the same problem→architecture→result structure.
- Resume PDF (linked from site) uses identical metrics — any mismatch destroys trust.
- OG images render the headline correctly when the site is shared.
