# Redesign prototype

The approved static prototype for the redesign, kept as the visual reference while the Next.js site is rebuilt to match it. It is not part of the site build: Next.js serves only `app/` and `public/`.

## View it

```bash
node spec/prototype/serve.cjs
```

Then open <http://localhost:4321/>. There are five pages: Home, About (dark), Writing, Hire me and Contact. The nav's About menu is the dropdown pattern the rest of the menus follow.

## What the implementation takes from it

- **Colour:**
  - canvas `#f7f7f8`, surface `#ffffff`
  - ink `#131316`; secondary text `#5e5f6e`; tertiary text `#6e6f7e` (meets AA on both the canvas and white)
  - accent violet `#6b4bff`; success `#15803d`
  - dark plates `#131316`, with cards in `#1b1b1f`
- **Type:** Geist and Geist Mono.
  - Page titles are 64/72 at weight 700 (40px on phones).
  - Section titles 40, card titles 20, list rows 15.
  - Mono labels are 11 with 0.1em tracking.
- **Grid:** content is 1200px wide and starts at 120px on a 1440px screen, under a floating pill nav.
- **Patterns:** the tabbed showcase, dark notched plates, bento cards, the page header (kicker, title, lead), blueprint frame lines, the dropdown menus and the five-column footer.
- **Honesty:**
  - Showcase screens carry "Illustrative sample · synthetic data" inside the frame.
  - Every figure matches the site's content and its method page.
  - The field work names no organisation, product or customer.

## Checked

- **Accessibility:** axe-core reports no WCAG 2.1 AA violations at 1440px or 390px.
- **Keyboard:** menus open with Enter and close with Escape, returning focus to the trigger, and the showcase tabs move with the arrow keys.

## Lifetime

Delete this folder once the live site matches it.
