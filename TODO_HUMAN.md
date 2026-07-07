# TODO — human required (Mubin only)

Items that need a real human decision, real proof, or off-site access I don't have.
Nothing here is faked or invented (inventing proof is a hard failure per the run rules).
Each item is copy-paste-ready.

## Awaiting real proof / content (V3 · human proof)
- [ ] **Testimonials/quotes** — the "Human proof" section (Phase 2 #8) needs 2–3 real short
      quotes from colleagues / a Sevina manager / product users. I will NOT invent these.
      Until provided, that slot renders a **real track-record row** instead (no placeholder
      quotes). Paste quotes here when available: name · role · one-sentence quote.

## Off-site surfaces to update (V9 — I can't edit these from here) — EXACT CHANGES

**1. GitHub profile "Website" field** (github.com/settings/profile → Website)
- Current: `https://mubinattar.netlify.app`  ← OLD, dead-ish
- Change to: `https://mubin-attar.vercel.app`
- (Your bio text is fine as-is: "AI/ML Engineer | GenAI, LLMs, Agents, MLOps | Building &
  shipping production AI products @Sevina Technologies".)

**2. TradePulse GitHub README** (`mubin-attar-007/tradepulse` → README.md) — the demo badges
point at `tradepulse.vercel.app`, but the canonical live URL used on the site (and verified up)
is `tradepulse-live.vercel.app`. Find/replace in the README:
- `https://tradepulse.vercel.app` → `https://tradepulse-live.vercel.app`  (the "Live Demo" badge)
- `https://tradepulse.vercel.app/methodology` → `https://tradepulse-live.vercel.app/methodology`
  (the "Methodology" badge)

**3. LinkedIn** — set the featured/contact website link to `https://mubin-attar.vercel.app`
(replace any netlify/old link).

## Decisions for Mubin
- [ ] Custom domain `mubinattar.com` (Phase 6 recommendation) — purchase + point DNS at Vercel.
- [ ] **(Optional) Shorter hero headline** — the current one wraps to ~4 lines at the big hero
      size; the plan prefers ≤2. Kept your copy + the punchy type. If you want it tighter, a
      2-line option (edit `home.headline` in `content/site.ts`), e.g.:
      "I build grounded AI systems — and show how they work." (drop "actually") — or your own.
      Left as-is because it's your voice; only you should change the headline copy.
