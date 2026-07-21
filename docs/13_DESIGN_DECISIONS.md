# Design Decisions

Why the codebase looks the way it does. Each entry states the decision, the
reason, and what it costs. Open questions are marked.

---

## Typeface: Geist Sans + Geist Mono + Newsreader — not Inter

**Decision.** Geist Sans for UI and body, Geist Mono for code and metadata,
Newsreader (italic only) for essay titles and pull-quotes.

**Why.** Geist has a taller x-height and tighter default tracking than Inter, so
long technical prose stays readable at 16px without loosening leading. Geist Mono
is metrically related to Geist Sans, which keeps mono metadata lines aligned with
surrounding sans text — Inter has no matching mono. Newsreader appears in italic
only, as a single editorial accent against two grotesques; one serif used sparingly
signals "written" without turning the site into a magazine.

**Cost.** Three families instead of one. Mitigated by self-hosting: Geist ships
from the `geist` package and Newsreader through `next/font/google`, both inlined
at build, so no font request leaves the origin at runtime.

---

## Tailwind v4 with CSS-first tokens

**Decision.** Tailwind v4, configured entirely through `@theme` in
`styles/tokens.css`. No `tailwind.config.js`.

**Why.** In v4 the design tokens *are* CSS custom properties. One file declares
`--color-*`, `--text-*`, `--space-section-*`, `--radius-*`, `--motion-*`, and
Tailwind generates the utilities from them. That means a token is simultaneously
usable as `bg-surface` in a component and as `var(--color-surface)` in raw CSS —
there is no JS config that can drift from the stylesheet. Setting
`--default-transition-duration` and `--default-transition-timing-function` also
makes every bare `transition` utility in the codebase land on the same curve
without per-element easing.

**Cost.** v4's CSS-first config is newer and less documented than the v3 JS
config. Accepted: a single source of truth is worth more than familiarity.

---

## No animation library

**Decision.** Motion is CSS transitions and keyframes, plus exactly one
`IntersectionObserver` in `components/features/reveal-observer.tsx` that adds a
`.reveal-in` class. There is no framer-motion, no GSAP, no motion library of any
kind in `package.json`.

**Why.** Every motion this site actually needs — hover states, a fade-and-rise on
scroll, a disclosure expand, a dashed diagram edge — is expressible in CSS. A
motion library would add runtime JS to every page that uses it, for effects the
platform already does on the compositor. The observer approach also degrades
correctly: the hidden start state is gated behind `html.js`, so crawlers and
no-JS visitors get fully visible content.

**Reduced motion is structural, not a patch.** `globals.css` collapses all
animation and transition durations under `prefers-reduced-motion: reduce`, and
the reveal and hero-rise rules are wrapped in `prefers-reduced-motion:
no-preference` so reduced-motion users never receive a hidden start state that
could fail to un-hide.

**Cost.** Complex sequencing and interruptible spring physics are off the table.
Nothing on this site needs them.

---

## Static generation over a CMS

**Decision.** All content lives in `content/` as MDX and typed `.ts`/`.json`,
validated by Zod at module load. Everything except `/api/chat` is statically
generated.

**Why.** The content is the portfolio's argument, so it should be reviewable the
way code is — in a diff, in a branch, in a commit. A Zod `.parse()` at module load
means bad content **fails the build** instead of rendering wrong in production:
`MetricSchema.method` is `z.string().min(1)`, so a metric without a stated method
is a build error. No CMS gives that guarantee. It also removes a network hop, an
auth surface, a vendor, and a recurring bill.

**Cost.** Publishing needs a commit and a deploy. For a single author this is a
feature, not friction.

---

## BM25 over a vector database

**Decision.** The assistant retrieves with an in-memory BM25 index built over
`content/` at module load (`lib/ai/retrieval.ts`). No embeddings, no pgvector, no
hosted vector store.

**Why.** The corpus is a few dozen passages — FAQ entries, case-study sections
chunked by `##`, résumé roles, skill groups. It fits comfortably in memory, so the
entire premise of an approximate-nearest-neighbour index (a corpus too large to
scan) does not apply. Given that, BM25 wins on every axis that matters here:

| | BM25, in memory | Embeddings + vector DB |
| --- | --- | --- |
| Retrieval-time network calls | none | one embedding call per query |
| Determinism | exact same ranking every run | model- and version-dependent |
| Testability | `test/retrieval.test.mts` runs in plain `node` | needs a live API or fixtures |
| Cost | zero | per-query + hosting |
| Failure modes | none at retrieval | quota, latency, index drift |
| Debuggability | scores are inspectable term math | opaque distances |

Determinism is the decisive one. Because retrieval is exact and offline, the
relevance floor (`RELEVANCE_MIN_SCORE`) can be **tuned against a fixed proof set
and asserted in CI**: on-topic questions must clear it, off-topic questions
(salary, visa, weather) must fall below it and return `[]`. That is a testable
grounding guarantee. With a hosted embedding model, the same threshold would be
at the mercy of a version bump.

**Cost.** BM25 is lexical, so a question phrased with entirely different
vocabulary than the source can miss. Mitigated by chunking case studies under
their own headings and prefixing each passage with its project and section name,
so domain terms are present in the index. If the corpus grows past the point where
a full scan is cheap, revisit.

---

## Light page with dark bands — *not* dark-first, and not OS-driven

**Decision.** The brand is a **light page punctuated by dark section bands**
(`.tone-invert` in `globals.css`, driven by the `tone` prop on
`components/layout/section.tsx`). Full-dark is an explicit opt-in via the theme
toggle, stored in `localStorage` and applied as `[data-theme="dark"]`.
**`prefers-color-scheme` is deliberately ignored.**

**Why.** The light-with-dark-bands rhythm *is* the identity, not a light variant
of it — the bands create the page's vertical structure and mark where the
argument changes register. Auto-switching on OS preference would hand half of
visitors a layout whose structural device (the contrast between band and page)
has been flattened away, and they would never see the intended composition. So
the default renders identically for everyone, and dark is a remembered choice a
visitor makes for themselves.

Because `.tone-invert` re-scopes the colour tokens *locally*, any component
dropped into a dark band adapts without knowing it is in one — including the
status colours, which are overridden in the band so a `Metric` delta cannot
render below AA on a dark surface.

**Cost.** Visitors with a system dark preference get a light page until they
toggle. Accepted deliberately; the toggle is in the header and the choice
persists.

**Implementation note.** The theme is applied pre-paint by an inline script in
`app/layout.tsx`, so there is no flash. That script is why the CSP needs
`script-src 'unsafe-inline'`.

---

## Minimal, per-icon iconography

**Decision.** `lucide-react`, imported one icon at a time, used only where an
icon carries meaning (external link, copy, close, theme).

**Why.** Per-icon imports tree-shake to just the glyphs used. Restricting icons to
functional roles keeps them reading as interface affordances rather than
decoration — decorative icon sets are one of the fastest ways to make an
engineering site look like a template.

---

## Generous, fluid section spacing

**Decision.** Three fluid section-rhythm tokens (`--space-section-sm/md/lg`), each
a `clamp()` that scales with viewport width.

**Why.** Whitespace is the main hierarchy signal on a typography-first site with a
single accent colour. Fluid `clamp()` values mean the rhythm scales continuously
rather than jumping at breakpoints, so the composition holds at every width
instead of only at the ones that got tested.

---

## Why the Clerk-derived palette? (RESOLVED)

`--color-accent` is `#6c47ff` — Clerk's brand purple — with the dark-mode and
band variants derived from it.

This was raised as a conflict with CLAUDE.md's *"never copy designs directly —
understand the design principles and create an original implementation."* The
owner reviewed it and **chose to keep it**, explicitly, along with the wider
Clerk vocabulary: *"follow the clerk's color, style, effect, animation etc… i
like it."*

Where the originality line actually sits, given that decision:

- **Shared:** the craft vocabulary — palette, elevation model, the light page
  punctuated by dark bands, motion curves, type density.
- **Ours:** every layout, all copy, the diagrams, the product surfaces, the
  evidence model. Nothing on the site uses Clerk's logo, wordmark,
  illustrations, or copy, and nothing implies affiliation.

The structural rules are what carry the design and they are unchanged: one
accent, at most two accent elements per viewport, hierarchy carried by type and
space. A hue swap would remain cheap if that decision is ever revisited — which
is the point of consuming token names rather than literals.

**A hue swap is not a one-line change.** The value is currently hardcoded in two
places outside `styles/tokens.css`, and both must change with it or the site will
ship mismatched purple:

- `lib/og.tsx:20` — `const ACCENT = "#6c47ff"` (Satori cannot read CSS custom
  properties, so the OG renderer needs a literal)
- `styles/globals.css:184` — the `.tone-invert` accent override (`#9a7fff`)
