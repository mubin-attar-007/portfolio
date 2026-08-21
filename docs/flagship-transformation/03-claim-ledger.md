# Claim Ledger v2 — P0-R2

## Methodology

- Evidence first: every claim entry is tied to a repository source file, route, or component.
- Scope-first labeling: each record is classified as factual, positioning, or unresolved.
- Verification status is sourced only from local repository artifacts in this packet unless explicit live checks were available from previous verified packets.
- Live behavior is explicitly tracked under `source_state` when known to differ from local source.
- Repeated claims are grouped with `duplication_cluster` and `contradicts_claim_id` pointers.
- This ledger is evidence-planning only; no public copy or behavior changes were made.

## Status definitions

| Status | Meaning |
| --- | --- |
| OWNER_APPROVED_POSITIONING | Statement is approved positioning and not a public fact claim. |
| REPOSITORY_VERIFIED_FACT | Verified from repository source of truth files. |
| EXTERNALLY_VERIFIED_FACT | Confirmed from a trusted outside source already in repository evidence (e.g., public API/test metadata). |
| PARTIALLY_VERIFIED | Partial evidence exists, scope or date is incomplete. |
| PENDING_OWNER_CONFIRMATION | Owner review required for publication-safe wording. |
| PENDING_OPERATIONAL_VERIFICATION | Content claim exists but live operability is not confirmed locally. |
| CONTRADICTED | Contradicted by another repository or route claim. |
| UNSUPPORTED | No source anchor supports the claim in current repo evidence. |
| STALE | Evidence appears dated or tied to historical context not in current source. |
| CONFIDENTIAL_NOT_PUBLIC | Fact likely true but not suitable for public publication. |
| REMOVE_OR_REWRITE_CANDIDATE | Likely should be removed or rewritten in Phase 1. |

## Executive summary

- This packet mapped high-signal public claims and separated positioning from factual claims.
- Main strengths: role and AI-work narratives are already centralized in multiple content files and reused via shared metadata.
- Main risk: role/title fragmentation (AI Software Engineer vs AI/ML Engineer vs Applied AI Engineer context).
- Main route mismatch risk: `/contact` is absent from current source while `/hire` remains navigationally promoted.
- Main product-risk pattern: several claims imply production-readiness and live operational behavior without explicit proof of public deployability in the same source.
- No product behavior changes were made; this is a pure evidence/documentation packet.

## Contradiction clusters

| Cluster | Variants | Current approved source | Conflict | Highest risk |
| --- | --- | --- | --- | --- |
| Role labels | AI Software Engineer, AI/ML Engineer, Applied AI Engineer, LLM Engineer, GenAI Engineer, Full-stack labels | OWNER_APPROVED branding is Applied AI Engineer, factual employment title remains AI/ML Engineer at Sevina | Multiple public strings appear in metadata, nav copy, and content; role string in `config/site.ts` still says AI Software Engineer | Persona consistency and hiring interpretation |
| Experience statement | “3+ years…since 2024” vs “shipping production AI since 2022” | Canonical approved statement: 3+ years software engineering, production-AI since 2024 | resume and site facts are older/inconsistent in one location | Resume accuracy and recruiter trust |
| Production status | “production AI since 2024,” “4 live products,” “productionized,” “publicly testable” | Evidence in content/projects + FAQ + timeline are mixed and not uniformly operationally verified | “live” and “production” often inferred without deployment checks in this packet | Overstated operational readiness |
| Security posture claims | “no writes,” “fail-closed,” “tenant-safe,” “fully isolated” | Some claims are present in prompt-level and architecture text | No route-level operational proof attached to every claim | Security/trust misstatements |
| Conversion route | `/hire` contact CTA; `/contact` expected future canonical route | Decision logs approve `/contact` as future canonical route | `/contact` is source-absent; `/hire` is active | Conversion continuity and user journey |
| API endpoint | `/api/chat` canonical vs `/api/ask` retained as legacy examples | Packet A owner-approved: /api/chat canonical | `/api/ask` still appears in dev UI examples | External integration confusion |
| Evidence completeness | “live,” “production,” “actively maintained” with no operational proof | some claims have metrics and docs evidence | operational status often missing or split across local/live | Trust and credibility |

## High-risk claims

| Risk level | Claim | Evidence status | Why high-risk |
| --- | --- | --- | --- |
| High | “4 live products” across pages and home evidence blocks | PARTIALLY_VERIFIED | Requires deployment URL and workflow availability evidence per product to support “live” claim. |
| High | “Production AI since 2024” in some blocks while other text references “shipping production AI since 2022” | PARTIALLY_VERIFIED / CONTRADICTED | Internal consistency issue affecting trust and timeline accuracy. |
| High | “zero writes” architectural guarantee in product claims | STALE / PENDING_OPERATIONAL_VERIFICATION | Needs boundary mapping from policy, DB/API controls, and runtime tests. |
| High | “fully private,” “fully safe,” and “production-ready” language in trust/assistant text | PARTIALLY_VERIFIED | Security and reliability claims not always supported by explicit evidence in code paths. |
| High | `$0 free-tier stack` | REPOSITORY_VERIFIED_FACT for site copy and README/LLM metadata, but scope missing | Unclear what exact workloads/resources it excludes. |

## Owner-input register

| Item | Current status |
| --- | --- |
| Confirm canonical role phrasing on public surfaces | APPROVED for positioning only (`Applied AI Engineer`) and factual title (`AI/ML Engineer at Sevina`) |
| Confirm public scope of “live/production” claims for each named project | PENDING_OWNER_CONFIRMATION |
| Confirm health and reliability guarantees in security copy | PENDING_OWNER_CONFIRMATION |
| Confirm employment status/tenure wording (exact start dates) and any overlap period | PENDING_OWNER_CONFIRMATION |
| Confirm healthcare impact metrics (if any) suitable for publication | PENDING_OWNER_CONFIRMATION |

## Claim summary counts

- Total claims in machine-readable CSV: 72
- Distinct contradiction clusters: 15
- Claims requiring owner confirmation: 18
- Unsupported or unresolved claims: 9
- Repeated phrase clusters requiring consolidation: 14
- High-risk claims marked in this packet: 17

## Detailed claim index mapping

| Column | Source file |
| --- | --- |
| claim_id | Internal UUID-like ID used to group and de-duplicate claims |
| exact_current_wording | Exact repository wording before rewrite |
| normalized_claim | Normalized canonical text used for comparison |
| claim_category | Role / experience / security / project / availability / conversion / trust / metrics / metadata / process / demo |
| source_file | File path in repository |
| source_anchor | Function, object, slug, component, or heading location |
| route_or_component | Route/component surface using this claim |
| source_state | Source-only / source+live / tests-only / historical / unverified live |
| factual_or_positioning | Factual | Positioning |
| verification_status | Controlled enum from packet definition |
| evidence | Repository links, anchors, tests, metadata references |
| scope | Personal, company, project, public, internal, demo |
| limitations | Missing deployment evidence, stale copy, partial tests, etc. |
| contradicts_claim_id | Cross-row reference when conflict exists |
| duplication_cluster | Link to repetition cluster ID |
| risk_level | Low / Medium / High |
| safe_direction | Keep / Rewrite / Remove / Clarify |
| owner_approval_status | Approved / Pending |
| date_validated | Date this claim evidence was captured |
| revalidation_trigger | Change in source, deployment checks, ownership refresh |
| future_phase | P0-R3 / P1 / P2 |
| notes | Additional constraints and caveats |

For the machine-readable version, see [claim-ledger.csv](./evidence/claims/claim-ledger.csv).

## Cross-route claim clusters reviewed in this pass

- Home and work-intro surfaces (role, products, availability, “live” status)
- About and resume surfaces (employment, skills, project timeline)
- Evals and trust surfaces (quality posture and safeguards)
- Notes and writing surfaces (author authority and chronology)
- Metadata and developer surfaces (title/description/og, sitemap/feed)
- Assistant surfaces (scope, citation behavior, limitations)

## P0-R2 completion status

- All required claim categories were captured and classified.
- Contradictions are explicit and grouped.
- This ledger is intentionally conservative: anything with operational scope is tagged `PENDING_OPERATIONAL_VERIFICATION` unless source+live evidence exists in this packet.
## Explicit contradiction clusters requested in P0-R2

### Cluster 1 — Primary role labels

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| Applied AI Engineer | 07 decision log | Approved for positioning | None | Low if consistently scoped | P1 |
| AI Software Engineer | config/site.ts, header, metadata | Not owner-approved as canonical brand phrase | Route-level sync and scope | Medium | P1 |
| AI/ML Engineer | resume and timeline | Factual for Sevina role | Whether to keep globally in all surfaces | Medium | P1 |
| GenAI/LLM Engineer labels | content/site.ts and trust text | Not approved as sole canonical title | Standardization | Medium | P1 |

### Cluster 2 — Experience duration

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| 3+ years software engineering, production-AI since 2024 | content/resume.ts, content/site.ts | Approved | None if bounded to 2024+ production AI | Medium | P1 |
| production AI since 2022 | content/resume.ts alternate phrasing | Not approved globally | Exact tenure scope across claim locations | Medium | P1 |
| shipping for over 4 years / 6 years | multiple pages | Unverified
| Cross-source consistency only | Medium | P1 |

### Cluster 3 — Production-AI tenure language

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| production AI since 2024 | content/site.ts, resume | Approved as canonical experience statement | Keep with exact wording and boundaries | Low | P1 |
| production AI since 2022 | older resume-derived phrasing | Not approved | Temporal consistency | Medium | P1 |
| production AI since present | project descriptions | Scope ambiguity | Clarify per project | High | P0-R4 |

### Cluster 4 — Current employment

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| AI/ML Engineer at Sevina Technologies | content/resume.ts, timeline | Approved factual title | Exact title display in all surfaces | Medium | P1 |
| AI Software Engineer and LLM labels in headline metadata | config/site.ts, metadata, home | Not approved as factual replacement | Role drift | Medium | P1 |

### Cluster 5 — Number of projects

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| 4 live projects | content/site.ts, home claims | Needs operational proof | Individual project availability | High | P0-R4 |
| four projects listed in work dataset | content/projects.ts | Source-supported count | whether all are productionized | Medium | P1 |
| exactly 4 live projects in route tests | test suite mentions exactly 4 live projects | Partially verified for existence, not runtime health | Medium | P0-R4 |

### Cluster 6 — Product deployment status

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| production / live / active | content/site.ts, projects, trust | Not verified per route execution in this packet | Cold-start, auth, uptime, degrades | High | P0-R4 |
| publicly testable | project metadata | Not approved | User access path and credentials | High | P0-R4 |
| in active development | resume/project cards | Factual for some projects | deployment continuity | Medium | P1 |

### Cluster 7 — Demo availability

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| demo URLs present | content/projects.ts | Yes, as links | Runtime responsiveness | High | P0-R4 |
| accessible without auth | not established | no support | Auth requirements | High | P0-R4 |
| fast cold start and stable uptime | not established | no support | Deployment readiness claims | High | P0-R4 |

### Cluster 8 — Live versus sleeping/degraded deployments

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| live response in working examples | project entries, prior tests | Not operator-level proof | runtime behavior per project endpoint | High | P0-R4 |
| potentially sleeping in inactivity | no sources | unverified | Need cold-start confirmation | High | P0-R4 |

### Cluster 9 — Security and write-protection guarantees

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| no writes / zero writes | project and trust copy | Not approved as universal | enforcement boundaries and audit logs | High | P1 |
| fail-closed / fully isolated | components/trust | Not approved | Threat model and test evidence mapping | High | P1 |
| secure and private | trust/metadata pages | Not approved as unqualified | policy-to-control alignment | Medium | P1 |

### Cluster 10 — Provider fallback guarantees

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| multi-provider resilient behavior | projects/evals | Partially supported by metrics | failover outcomes and latency | Medium | P0-R4 |
| fallback always available | assistant copy | No proof | Reliability claims | High | P1 |

### Cluster 11 — $0 or free-tier claims

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| $0 free-tier stack | content/site.ts, uses, llms.txt | Not approved as absolute | cost caps and workload constraints | Medium | P1 |
| zero infrastructure cost | docs and metadata | Not approved | operational cost evidence | Medium | P1 |

### Cluster 12 — Theme and brand claims in public content

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| calm, reliable, production-first | site and about | partially approved | repeated without fresh evidence | Low | P1 |
| anti-fake/honesty framing | trust and writing | not a factual claim | perceived defensiveness | Medium | P1 |

### Cluster 13 — Availability and target-role language

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| open to work / roles | config/site.ts, hire, about | Approved for conversion context | no response SLA | Medium | P1 |
| location and remote preference | availability line, now page | Approved | update cadence and constraints | Medium | P1 |

### Cluster 14 — Contact versus Hire conversion language

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| /hire active | route source and nav | current operational path | canonical decision for /contact migration | Medium | P1 |
| /contact future canonical | decisions and docs | approved as future-only | missing source surface and behavior | Medium | P1 |

### Cluster 15 — /api/chat versus /api/ask

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| canonical /api/chat | route and decision log | Approved | Ensure all examples and docs aligned | Medium | P1 |
| legacy /api/ask mentions | dev example surfaces | Not approved | stale integration expectation | Medium | P1 |

### Cluster 16 — Personal voice versus third-person metadata

| Variants | Sources | Owner-approved | Unverified items | Risk | Phase |
| --- | --- | --- | --- | --- | --- |
| first-person tone in writing | notes/writing | Approved as narrative style | consistency across metadata and legal copy | Low | P1 |
| third-person factual tone in resume/about | metadata, resume, site | Approved factual style | keep consistency between perspectives | Low | P1 |
