import { codeToHtml } from "shiki";
import { CopyButton } from "@/components/features/copy-button";

/**
 * CodeBlock — Shiki-highlighted code, build/render-time (zero client JS for the
 * highlighting). Dual light/dark themes emitted as CSS vars; the dark palette
 * activates under [data-theme="dark"] (see globals.css). A filename bar carries
 * a copy button (the one client leaf). A11y: <figure> with the filename as label.
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
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  });

  return (
    <figure
      className="my-6 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
      aria-label={filename ? `Code: ${filename}` : `Code (${lang})`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
        <span className="font-mono text-xs text-ink-tertiary">{filename ?? lang}</span>
        <CopyButton text={source} />
      </div>
      <div className="overflow-x-auto px-4 py-3" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
