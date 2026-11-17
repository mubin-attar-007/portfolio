# ADR-016 — Make an engineering decision inspectable

Status: accepted, 11 September 2026. Refines ADR-015. The evaluation counts in
paragraph 3 were superseded, and the DBWhisper recording withdrawn, on 16 November
2026 (see the note at the end).

The homepage repeated DBWhisper's request path in its hero and a second large
walkthrough. Three equal project cards reduced the other systems to screenshots
and isolated labels; tablet inherited a long single-column composition.

The hero now pairs Mubin's identity with a finite boundary inspector. Readers
choose a SELECT query, a SELECT INTO write, or an unavailable schema index and
see the documented policy's illustrated checks and outcome. These are curated
examples, explicitly labeled, with no SQL parser, model call, or database request.
The real 18/22 and 4/4 evaluation counts are supplied separately from the registry.
Native radio controls provide arrow-key selection and one focus stop; status
announcements follow user input only. No-JavaScript readers see the default
illustration and working links, without misleading inactive controls.

The existing five-stage walkthrough moves to the DBWhisper case study, retaining
its playback, focus pause, reduced-motion support, and regression checks. Its
sample query now uses a fixed January–April 2024 window with four sample rows.

Other projects use shared editorial rows: a product sentence, a distinguishing
decision, the existing method, an honestly labeled image, and ordinary links.
Rows use two columns from 768px. Below-the-fold images use native lazy loading,
intrinsic dimensions, and sizes matched to their rendered widths. Hover does
not lift or scale a static project row.

The resulting homepage has five sections: identity and inspector, selected work,
engineer, writing and current interests, contact. Removed sections' factual
content remains in the case studies, evaluation registry, and résumé.

Existing marketing recordings are retained with corrected subtitles and explicit
captions identifying known obsolete on-screen claims. They are not presented as
recordings of the illustrated queries executing. No new dependencies or services.

## Note, 16 November 2026 — the inspector's evidence

This record, like ADR-015 decision 3, assumed the 18/22 and 4/4 golden-set
counts were valid. They are not: DBWhisper's own claim audit
(`docs/v2/CLAIM_AUDIT.md` §4.4 at commit `bca0635`, 24 August 2026 — before this
record was written) withdrew both. The run cannot be reproduced from a clean
checkout, used a prompt retired on 21 August 2026, compared result sets more
loosely than it reported, and never reached the validator with an unsafe prompt.
The charter's "honesty over hype" outranks this record, so:

- The golden-set row is retired in place on `/evals` — muted, with the reason
  and the audit — and its counts are removed from the hero, the walkthrough, the
  case study, the captions, the résumé and PDF, `/now`, the notes, and
  `public/llms.txt`.
- The inspector footer keeps its structure and its in-frame labelling and shows
  the one figure in DBWhisper that a stranger can reproduce: its adversarial
  policy corpus (343/343 deny cases denied; sql_policy@2.0.0), labelled
  "Deterministic policy test, not model accuracy", with its date and a link to
  its registry row. The walkthrough's Evaluate stage pairs it with the Spider
  sample, scoped "generation model only, no retrieval or policy layer".
- The DBWhisper recording is withdrawn rather than kept "with corrected
  subtitles and explicit captions": its frames show the withdrawn counts, "works
  on databases with hundreds of tables" and "the live demo never goes dark" — the
  audit's §4.4(e) and (f) — and a caption cannot take a figure off the screen. The
  case study keeps its card capture, walkthrough, diagram, and demo and source
  links. A replacement is recorded from the current v2 site and checked frame by
  frame against the audit before it is published (CONTENT_MODEL §4). The other
  three recordings stand, as the paragraph on existing recordings describes.

Everything else in this record stands.
