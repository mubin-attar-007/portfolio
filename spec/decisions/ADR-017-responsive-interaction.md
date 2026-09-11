# ADR-017 — Make interaction feel responsive

Status: accepted, 11 September 2026. Refines ADR-016 at the user's request.

The user asked us to inspect https://clerk.com/ and adapt its animation and hover
principles to make the portfolio feel more alive. Live browser inspection found
soft navigation surfaces, a moving component-selection panel, and interactive
framework tiles with directional icon feedback. The portfolio keeps its own
typography, palette, content, and layout; no Clerk assets or implementation are
copied.

The homepage inspector now uses a gliding selection surface. Its illustrated
SQL, checks, and outcome update synchronously with native radio input. Only
changed checks receive a short emphasis; read-query to missing-schema selection
preserves the unchanged SQL node. Rapid selection resolves to the latest input.
No timer delays an outcome and no request or artificial processing state is added.

Project previews are ordinary case-study links with a permanent destination label.
Only the clipped image zooms gently on hover and keyboard focus; the row, frame,
caption, and explanatory text remain stationary. Writing and navigation links
receive soft surfaces and directional feedback. Shared control styles provide
arrow movement, underlines, a finite button sheen, and a guarded 1px press.

The hero settles upward by 8px once, at full opacity throughout. No whole-section
scroll reveals, looping ambient animation, parallax, tilt, cursor effects, or
hidden-on-hover content are introduced. The existing case-study walkthrough keeps
its explicit playback behavior.

Reduced motion removes nonessential movement and preserves the selected state,
visible destinations, and focus rings. All motion uses CSS and existing tokens;
no dependency or remote service is added. `scripts/motion-audit.mjs` observes
transitions in flight as well as settled states, and checks keyboard, touch,
rapid selection, unchanged content, and reduced-motion behavior.

This refines earlier no-scale language only for the image inside an actual link.
Static cards and complete project rows remain flat and stationary. User content,
measured evidence, routes, and functional features retain their existing sources.
