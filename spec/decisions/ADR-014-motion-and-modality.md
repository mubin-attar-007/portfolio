# ADR-014 — Motion, disclosure, and the modal boundary

Status: **Accepted**. Extends ADR-011 (identity), ADR-012 (Clerk fidelity) and
ADR-013 (palette). Nothing here changes routes, content, hierarchy, the claim
ledger, or the structured data — this is a behaviour pass on top of a settled
visual system.

## Context

The brief was explicit that this is **not a rebuild**: a focused pass worth
perhaps 20–30% perceived improvement, at 80/20 cost, with a hard ceiling of
30–40KB added JS and an explicit ban on the usual offenders (scroll-jacking,
custom cursors, WebGL/GSAP/Lenis/Lottie/Three.js, typewriter effects, magnetic
buttons).

The audit that opened the pass found the visual system was already where it
needed to be, and that the gap was **behavioural**:

- Zero animation dependencies — everything is CSS plus one `IntersectionObserver`.
  Nothing to remove, and nothing to add either.
- The motion tokens were already measured off the reference (ADR-012).
- Case studies already had reading progress.
- But: the page arrived all at once with no sense of sequence; the flagship
  product specimen was a static picture of a pipeline that *describes itself as
  a sequence*; and the evaluation registry printed every methodology note in
  full, so the page read as a wall rather than a registry.

Three things, then. Plus one defect the work uncovered.

## Decisions

### 1. The section reveal is inverted: only below-fold elements are ever hidden

This is the third implementation. The first two are worth recording because
they failed *identically* and the failure is not obvious:

1. An `IntersectionObserver` that hid every section up front and revealed on
   intersection.
2. A CSS `animation-timeline: view()` version — same behaviour, declarative,
   and now without even a JS escape hatch.

Both shipped a **blank page body** into full-page captures. They share one
structure: *content is hidden until an engine drives it visible*, so every
context where that engine has not run — or does not exist — is a context with
no page. A print, a capture, a crawler, a scroll restoration, a slow hydration.

The fix is not a better observer. It is inverting who decides:

```
if (reduced motion)              return;  // never arms
if (no IntersectionObserver)     return;  // never arms
if (already on screen)           return;  // never arms  <- the important one
el.setAttribute("data-reveal");           // only NOW is anything hidden
setTimeout(reveal, 1600);                 // and it unhides regardless
```

Nothing is hidden unless JS has already demonstrated, in that same tick, that
it can unhide it. A reveal that never fires now costs an animation, never
content. `SAFETY_MS = 1600` is the fourth guard and it is unconditional — it
does not check whether the observer fired, because the whole point is that we
cannot know.

`Reveal` is a client component whose `children` are server-rendered and passed
through, so wrapping a section does **not** drag it across the client boundary.
The markup is in the initial HTML either way. (A violation of exactly that rule
cost 290KB once — see ADR-011 § Consequences.)

`scripts/interaction-audit.mjs` asserts all of this, including a run with
`IntersectionObserver` replaced by a no-op stub.

### 2. The flagship specimen runs; the transport is real, not decorative

"Five stages. One guarantee." was a static accordion describing a pipeline. It
now plays through the five stages on arrival at 2800ms dwell, with a progress
line under the active row.

Three constraints made it acceptable rather than annoying:

- **Any manual selection stops the run permanently.** Not "pauses and resumes"
  — a visitor who clicked *Validate* wants to read *Validate*.
- **The terminal state is derived, not assigned.** The advance effect reads
  `if (!playing || reduced || last) return;` rather than calling `setPlaying`
  from inside the effect. This is what `react-hooks/set-state-in-effect` is
  warning about, and the derived form is genuinely simpler.
- **The transport renders only when motion is allowed.** A Play button that
  cannot play is worse than no button.

The run also pauses on `visibilitychange`, so a backgrounded tab does not
finish the sequence unwatched.

### 3. Methodology is collapsed, never hidden — in a native `<details>`

The evaluation registry's whole claim is that every number carries a method.
Truncating that would be a content decision disguised as a design one. So the
summary carries **the first sentence of the method** plus a "Full method"
affordance: a closed row still says what was measured.

`<details>` rather than a custom disclosure, because the platform version is
keyboard-operable, announced correctly, openable by find-in-page, and prints
expanded — with no JavaScript. The link label also changed from "method" to
"evidence", since the method is now on the page and the link goes to the proof.

### 4. A modal makes the page behind it `inert`

This is the defect the pass uncovered, and it arrived as a contrast failure:
four reproducible `color-contrast` violations, all of the form
`[light|dark] [tablet|mobile] / — assistant panel open`, on 11px mono chrome
labels behind the panel. The 20% scrim (`--scrim: rgb(3 8 10 / 0.2)`) drags
them from 4.96:1 to 4.34:1.

The tempting fix is to recolour those labels so they survive being dimmed. That
is the wrong fix, and it is wrong in an instructive way: **content behind a
modal is not meant to be read.** Passing the audit by making the background
more legible would be optimising for the checker against the user.

The real defect is that both dialogs trapped `Tab` but left the rest of the
document in the accessibility tree. A screen-reader user could walk out of the
dialog by virtual cursor; the audit was, correctly, still evaluating content the
modal had visually dismissed. `inert` is the platform's answer — it removes a
subtree from the accessibility tree, from focus order, and from pointer events
in one attribute, and it is what turns a scrim from a dark rectangle into a
modal boundary.

`lib/use-inert-background.ts` applies it to the layout's own landmarks
(`body > header|main|footer`) rather than "every body child", so the portalled
dialog — a sibling appended to `<body>` — is never inerted by accident. Engines
without `inert` fall back to `aria-hidden`, which covers the screen-reader half;
those engines keep the focus trap both dialogs already implement.

**This has a sharp edge, and it bit immediately.** Both launchers live in the
header, i.e. *inside the subtree the open dialog inerts*. `Assistant.close()`
restored focus synchronously in the same tick as `setOpen(false)` — at which
point the panel has not unmounted, the header is still inert, and `.focus()` is
a silent no-op that strands focus on `<body>`. A WCAG 2.4.3 failure introduced
by an accessibility fix. Focus restoration is now deferred one frame, with a
single retry, and there is a contract asserting focus lands on a live launcher
for both dialogs.

`MobileNav` needs no such deferral: its inert effect and its focus-restoring
effect are in the same component, and React runs cleanups in declaration order,
so the un-inert provably precedes the `.focus()`. The contract asserts it
anyway — ordering that holds by construction is still worth pinning down.

## The gates this added

Two of the four defects in this pass were invisible to every gate we had. That
is the argument for both new scripts.

**`npm run test:hue`** (`scripts/theme-audit.mjs`) — walks 14 routes per theme
and fails on any computed colour outside that theme's accent family. axe checks
contrast, the screens sweep checks overflow, and neither notices that one
section is violet inside a lime theme. That defect shipped once and the owner
found it, which is the gate's whole justification.

One implementation note worth keeping: the first version tested HSL
**saturation** and flagged every dark panel. At near-black, HSL inflates
saturation — our `#0d1214` surface computes `s=0.21` while being visually pure
grey. It now tests **chroma** (`max − min` across RGB, floor 28), which is
luminance-independent: 7 is neutral, 72 is a colour.

**`npm run test:interaction`** (`scripts/interaction-audit.mjs`) — 26 contracts.
The a11y gate proves the DOM is accessible and the screens sweep proves nothing
overflows; neither can tell you that a reveal actually revealed, that the
specimen still advances, that reduced motion yields a *useful* static state
rather than a blank one, or that a modal released its boundary on close.

One of these tests was itself wrong first: `textContent` returns collapsed
`<details>` content too, so "expanding reveals more" passed trivially. It
measures `isVisible()` now.

## Consequences

- **Measured cost: +3.8KB raw / +1.1KB gzipped client JS**, against a 30–40KB
  budget. Measured by building `HEAD` in a throwaway worktree and comparing
  gzipped totals across `.next/static/chunks` — 745.3KB → 749.1KB raw,
  231.3KB → 232.4KB gzipped. Not estimated.
- Zero new dependencies. Everything here is CSS transitions, one
  `IntersectionObserver`, and one platform attribute.
- **Reduced motion gets a designed still pose, not a disabled animation.** The
  reveal never arms (so nothing is ever hidden), the specimen does not
  self-advance but stays fully selectable, and the transport is not rendered at
  all. Three contracts assert exactly this.
- CLS stays **0.000** on all three sampled routes: the specimen's output panel
  is fixed-height, so advancing a stage cannot reflow the page.
- Gates at time of writing: a11y **0 violations** (18 routes × 2 themes × 3
  viewports, plus both dialog states and the keyboard pass), hue clean in both
  themes across 14 routes, **26/26** interaction contracts, 34/34 unit tests,
  print gate, metadata gate, 144 screenshots with no horizontal overflow and no
  console errors at six widths.
- Local Lighthouse still reports performance 71–79 / LCP 5.3–7.0s. Those numbers
  are **not** load-bearing and never have been — ADR-011 records the same
  machine reporting 74/82/80 while CI measured 98/99/99 with LCP 2018–2373ms.
  Accessibility, best-practices and SEO are 100/100/100 locally, TBT is 47–95ms,
  and CLS is 0.000; those are the signals that transfer.
- `--motion-section` (560ms) and `--ease-enter` are new tokens rather than
  inline values. `--ease-out` is tuned for 130–300ms interaction feedback and
  reads abrupt over half a second; an entrance wants a long decelerating tail.
  They are separate because they are answering different questions.
