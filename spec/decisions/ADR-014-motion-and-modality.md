# ADR-014 — Motion, disclosure, and the modal boundary

Status: **Accepted; §1 superseded.** Extends ADR-012 (Clerk fidelity) and ADR-013
(palette). §1's section reveal was removed by ADR-015 — the `Reveal` component no
longer exists and homepage content is always visible — but its failure analysis is why
no content is ever hidden behind an engine. The walkthrough in §2 moved to the DBWhisper
case study (ADR-016). Facts checked against the code on 2026-11-13; point-in-time gate
counts and local measurements were removed (git history, commit `8949fdf`).

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

### 1. The section reveal is inverted: only below-fold elements are ever hidden (superseded)

*Superseded by ADR-015:* the homepage no longer reveals sections, and interior pages
use CSS-only `.reveal` entrance styles whose hidden start exists only inside
`prefers-reduced-motion: no-preference` (`styles/globals.css`). The analysis below
remains the rule.

This was the third implementation. The first two are worth recording because
they failed *identically* and the failure is not obvious:

1. An `IntersectionObserver` that hid every section up front and revealed on
   intersection.
2. A CSS `animation-timeline: view()` version — same behaviour, declarative,
   and now without even a JS escape hatch.

Both shipped a **blank page body** into full-page captures. They share one
structure: *content is hidden until an engine drives it visible*, so every
context where that engine has not run — or does not exist — is a context with
no page. A print, a capture, a crawler, a scroll restoration, a slow hydration.

The fix was not a better observer. It was inverting who decides: nothing is hidden
unless JS has already demonstrated, in that same tick, that it can unhide it, with an
unconditional safety timeout. A reveal that never fires costs an animation, never
content.

### 2. The flagship specimen runs; the transport is real, not decorative

"Five stages. One guarantee." was a static accordion describing a pipeline. It
now plays through the five stages on arrival at 2800ms dwell, with a progress
line under the active row (`components/case-studies/walkthrough.tsx`, now on
`/work/dbwhisper#request-walkthrough`).

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

`lib/use-inert-background.ts` applies it to every direct child of `<body>` except
elements marked `data-modal-root` (the portalled dialog and its scrim) and
`script`/`style`/`link`, so page chrome such as the skip link and the availability
bar is covered and the dialog is never inerted by accident. It also locks background
scrolling. Engines without `inert` fall back to `aria-hidden`, which covers the
screen-reader half; those engines keep the focus trap both dialogs already implement.

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

**`npm run test:interaction`** (`scripts/interaction-audit.mjs`, now run together
with the walkthrough input, boundary-inspector, and walkthrough disclosure audits).
The a11y gate proves the DOM is accessible and the screens sweep proves nothing
overflows; neither can tell you that the specimen still advances, that reduced
motion yields a *useful* static state rather than a blank one, or that a modal
released its boundary on close.

One of these tests was itself wrong first: `textContent` returns collapsed
`<details>` content too, so "expanding reveals more" passed trivially. It
measures `isVisible()` now.

## Consequences

- At the time, measured cost was +3.8KB raw / +1.1KB gzipped client JS against a
  30–40KB budget, measured by building `HEAD` in a throwaway worktree and comparing
  gzipped totals across `.next/static/chunks`.
- Zero new dependencies. Everything here is CSS transitions, one
  `IntersectionObserver`, and one platform attribute.
- **Reduced motion gets a designed still pose, not a disabled animation.** The
  specimen does not self-advance but stays fully selectable, and the transport is
  not rendered at all.
- The specimen's output panel reserves a minimum height (21rem; 23rem from 768px),
  so switching stages does not collapse the layout around it.
- `--motion-section` (560ms) and `--ease-enter` are new tokens rather than
  inline values. `--ease-out` is tuned for 130–300ms interaction feedback and
  reads abrupt over half a second; an entrance wants a long decelerating tail.
  They are separate because they are answering different questions.
