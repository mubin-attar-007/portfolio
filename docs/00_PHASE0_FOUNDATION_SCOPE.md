# Phase 0 Foundation Scope Audit (approved baseline)

**Date:** 2026-07-23  
**Status:** Complete (implementation only for Foundation scope lock)  
**Source of truth:** `config/site.ts` export `FOUNDATION_SCOPE`

## 1) Route matrix

| Route | Label | Class | Intent | Header | Footer | Source | Parity status | Risk |
|---|---|---|---|---|---|---|---|---|
| `/` | Home | page | primary | no | yes | content | aligned | low |
| `/about` | About | page | identity | yes | yes | content | aligned | low |
| `/work` | Projects | page | primary | yes | yes | content | mapped-alias | low |
| `/work/[slug]` | Project detail | page | primary | no | yes | content | aligned | low |
| `/writing` | Blog index | page | editorial | yes | yes | content | mapped-alias | low |
| `/writing/[slug]` | Blog detail | page | editorial | no | yes | content | aligned | low |
| `/notes` | Notes index | page | editorial | yes | yes | content | aligned | low |
| `/notes/[slug]` | Notes detail | page | editorial | no | yes | content | aligned | low |
| `/resume` | Experience | page | experience | no | yes | content | mapped-alias | low |
| `/skills` | Skills | page | identity | no | yes | content | aligned | low |
| `/hire` | Contact / Hire | page | utility | yes | yes | content | mapped-alias | low |
| `/trust` | Trust | page | identity | yes | yes | content | aligned | low |
| `/now` | Now | page | identity | no | yes | content | aligned | low |
| `/timeline` | Timeline | page | experience | no | yes | content | aligned | low |
| `/uses` | Uses | page | identity | no | yes | content | aligned | low |
| `/evals` | Evals | page | identity | no | yes | content | aligned | low |
| `/talks` | Talks | page | identity | no | yes | content | aligned | low |
| `/changelog` | Changelog | page | identity | yes | yes | content | aligned | low |
| `/not-found.tsx` | 404 fallback | special | support | no | yes | static-page | aligned | low |
| `/privacy` | Privacy | page | support | no | yes | content | aligned | low |
| `/api/chat` | Assistant API | system | utility | no | no | system-route | aligned | low |
| `/rss.xml` | RSS feed | system | utility | no | no | system-route | aligned | low |
| `/writing/feed.xml` | Writing feed | system | utility | no | no | system-route | aligned | low |
| `/sitemap.xml` | Sitemap | system | utility | no | no | system-route | aligned | low |
| `/robots.txt` | Robots | system | utility | no | no | system-route | aligned | low |
| `/opengraph-image.tsx` routes | OG images | system | utility | no | no | system-route | aligned | low |

### Requested-page mapping

| Requested page | Current route |
|---|---|
| Home | `/` |
| About | `/about` |
| Projects | `/work` |
| Experience | `/resume` |
| Skills | `/skills` |
| Blog | `/writing` |
| Contact | `/hire` |
| 404 | `/not-found` |
| Privacy | `/privacy` |

## 2) Risk log

| ID | Title | Severity | Impact | Mitigation |
|---|---|---|---|---|
| R-002 | Privacy page now implemented | low | `/privacy` route exists and is now discoverable in footer | Keep disclosure text current as integrations evolve |
| R-003 | Route naming mismatch vs requested naming | low | Route slugs are mapped aliases | Keep manifest mapping explicit and convert only after copy/design decision |

## 3) Scope notes for Phase 0

- This phase only locks foundation scope and route parity baseline.
- No UI behavior, styling, or feature implementation changed.
- `app/layout.tsx` carries `data-scope` for deterministic scope traceability.
- Route baseline is a single object in `config/site.ts` and this document is the audit render.
