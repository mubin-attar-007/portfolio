import { codeToHtml } from "shiki";
import { CopyButton } from "@/components/features/copy-button";
import { EVIDENCE_FRAME, EVIDENCE_SPACING } from "@/components/mdx/prose";

/**
 * CodeBlock — Shiki-highlighted code, build/render-time (zero client JS for the
 * highlighting). Dual light/dark themes emitted as CSS vars; the dark palette
 * activates under [data-theme="dark"] (see globals.css).
 *
 * The chrome is a real filename bar: it sits on --color-bg-subtle so the bar and
 * the code well are two distinct planes rather than one flat box, with a hairline
 * between them and the figure lifted on --shadow-sm. When a filename is given the
 * language is shown beside it as a quiet monospace tag — information the reader
 * would otherwise have to infer from the extension.
 *
 * A11y: <figure> with the filename as label; Shiki's own `<pre tabindex="0">`
 * makes the horizontal scroller keyboard-reachable, so long lines are not
 * stranded off-screen — this component adds NO second tab stop of its own.
 */
export async function CodeBlock({
  code,
  lang = "text",
  filename,
}: {
  code: string;
  lang?: string;
  filename?: string;
}) {
  const source = code.replace(/\n+$/, "");
  const html = await codeToHtml(source, {
    lang,
    // High-contrast variants: the default github themes ship comment/keyword
    // tokens below WCAG AA (e.g. #6a737d comments ~3.5:1). These meet 4.5:1.
    themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
    defaultColor: "light",
  });

  return (
    <figure
      className={`${EVIDENCE_SPACING} ${EVIDENCE_FRAME}`}
      aria-label={filename ? `Code: ${filename}` : `Code (${lang})`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border bg-bg-subtle px-4 py-2">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <span className="truncate font-mono text-xs text-ink-secondary">{filename ?? lang}</span>
          {filename ? (
            <span className="shrink-0 rounded-[var(--radius-sm)] border border-border px-1.5 font-mono text-xs text-ink-tertiary">
              {lang}
            </span>
          ) : null}
        </div>
        <CopyButton text={source} />
      </div>
      {/* No tabIndex here on purpose: Shiki already emits `<pre tabindex="0">`
          inside, which is the tab stop that makes this scroller reachable (WCAG
          2.1.1) — arrow keys from there scroll the nearest scrollable ancestor,
          i.e. this div. Adding a second one would make every code block two tab
          stops. */}
      <div className="overflow-x-auto px-4 py-3" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
