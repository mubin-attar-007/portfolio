# SPRINT 4 — Flagship case study

> **Paste to Claude Code:**
> Read spec/CONTENT_MODEL.md §1 (the template is the contract) and spec/DESIGN.md §3.
> This sprint is content-led: T1 is authored WITH the user, not invented. Never fabricate
> a metric, date, or event. If information is missing, ask — do not fill gaps.

**Goal:** one exceptional, complete case study — the single strongest hiring artifact on the site.
**Exit demo:** /work/<flagship> read end-to-end feels like a senior engineer's system doc.

## Tasks

### T1 — Author the study (pair with user; ~60% of sprint effort)
Pick the flagship from BRAND_POSITIONING §3. Draft all 10 sections in order. For every
metric: value + method sentence + footnote. Compliance pass per CONTENT_MODEL §1.3
(aggregate only, synthetic screenshots, no PHI/facility-identifiable figures).
Interview the user for: 3–6 DecisionLog entries (with rejected alternatives + accepted
costs) and at least ONE genuine FailureLog arc with the before/after numbers.
**AC:** every template section present and substantive; zero unexplained numbers; zero
banned words (CONTENT_MODEL §7); reads in 8–12 minutes.

### T2 — Diagram
Author the diagram data file + per-node descriptions; narration paragraphs double as the
text alternative. 6–12 nodes; if the system needs more, split into overview + one subsystem diagram.
**AC:** hover/keyboard reveal correct descriptions; narration matches diagram exactly.

### T3 — Terminal recording
Record a real run with synthetic data (asciinema, ≤ 90 s, trimmed): invocation → progress
→ result summary with timing. Poster frame chosen. Caption states what's shown + that data is synthetic.
**AC:** lazy-loads only on interaction; legible at mobile width.

### T4 — Case-study layout
Study page: PageHeader (title, summary, status, role, timeline, MetricsRow), quiet sticky
TOC ≥ 1280px (xs, muted, active section), thin reading-progress bar (2px, ink at 20%,
reduced-motion honored), prev/next footer, per-page OG via satori.
**AC:** TOC keyboard operable; progress bar not distracting; axe clean; route JS ≤ 90 KB gz
(diagram + recording lazy where below fold).

### T5 — Read-depth analytics + second project stub
Fire case_study_read_depth at 25/50/75/100. Add second project as a compact row with
honest "full write-up in progress" status.
**AC:** events visible in analytics; stub doesn't pretend to be more than it is.

## Definition of Done
[ ] Template complied with 100%  [ ] User has fact-checked every claim (sign-off in PR)
[ ] Compliance pass done  [ ] Diagram + recording integrated  [ ] OG renders correctly in
a share preview  [ ] Budgets + axe clean  [ ] Featured on home + /work automatically
