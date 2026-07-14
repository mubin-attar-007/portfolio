/**
 * PostCover — a deterministic, on-brand "terminal mockup" cover for an essay
 * (the study's engineering-post card, not a stock photo). Pure inline SVG: a
 * ▸ prompt + a filename derived from the category, then a few abstract "code
 * lines" whose widths and the single accent line are seeded from the slug — so
 * every post gets a distinct but stable cover, with zero image assets and no
 * SSR/hydration mismatch (the seed is the slug, never Math.random). Colours are
 * design tokens via fill and stroke utilities, so it adapts to light/dark.
 *
 * @param slug      the post slug (the cover seed)
 * @param category  essay | guide | note — sets the filename label
 * A11y: decorative — the surrounding card title carries the meaning.
 */
const LABEL: Record<string, string> = { essay: "essay.md", guide: "guide.md", note: "note.md" };

export function PostCover({ slug, category }: { slug: string; category: "essay" | "guide" | "note" }) {
  // FNV-1a hash of the slug → an xorshift stream → stable pseudo-random layout.
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const rnd = () => {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };
  const lines = Array.from({ length: 5 }, () => 108 + Math.floor(rnd() * 172)); // 108–280px
  const accentLine = Math.floor(rnd() * 5);

  return (
    <svg
      viewBox="0 0 320 150"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden
    >
      <text x="18" y="30" className="fill-accent font-mono" fontSize="13">
        ▸
      </text>
      <text x="34" y="30" className="fill-ink-tertiary font-mono" fontSize="12" letterSpacing="0.03em">
        {LABEL[category] ?? "post.md"}
      </text>
      <line x1="18" y1="46" x2="302" y2="46" className="stroke-border" strokeWidth="1" />
      {lines.map((w, i) => (
        <rect
          key={i}
          x="18"
          y={62 + i * 17}
          width={w}
          height="6"
          rx="3"
          className={i === accentLine ? "fill-accent" : "fill-border-strong"}
          opacity={i === accentLine ? 0.85 : 0.5}
        />
      ))}
    </svg>
  );
}
