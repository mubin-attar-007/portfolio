import { Globe } from "lucide-react";
import { articlePage } from "@/content/pages/writing";
import { ArrowOut } from "@/components/ui/caret-link";
import { cx } from "@/components/ui/cx";
import { Toc, type TocItem } from "@/components/ui/toc";
import { AskAssistantButton } from "./ask-assistant-button";

const HEADING = "text-[0.8125rem] font-semibold text-ink";

type PostTools = { category: string; url: string };

function CategoryPill({ category }: { category: string }) {
  return (
    <span className="w-fit rounded-[var(--radius-pill)] bg-ink px-2.5 py-1 text-[0.8125rem] font-semibold text-white">
      {category}
    </span>
  );
}

/**
 * "Ask AI about this": the site's assistant, opened on this article's starters
 * (nothing is sent until a starter or a question is chosen), then the article's
 * URL handed to three outside assistants. `layout="rows"` is
 * the sidebar list (icon tile, label, ↗ at the edge); `"chips"` is the compact
 * row under a phone's header. Each outside link opens a new tab, says so, and
 * carries the out-arrow; its icon is generic (no brand logos).
 */
function AskAbout({ url, layout }: { url: string; layout: "rows" | "chips" }) {
  const prompt = encodeURIComponent(articlePage.externalPrompt(url));
  const headingId = `ask-ai-title-${layout}`;
  const rows = layout === "rows";
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className={HEADING}>
        {articlePage.askTitle}
      </h2>
      <ul className={cx("mt-3", rows ? "grid gap-1" : "flex flex-wrap gap-2")}>
        <li>
          <AskAssistantButton label={articlePage.askAssistant} layout={layout} />
        </li>
        {articlePage.external.map((service) => (
          <li key={service.name}>
            <a
              href={service.href(prompt)}
              target="_blank"
              rel="noopener"
              className={cx(
                "group flex items-center text-sm text-ink-secondary transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink",
                rows
                  ? "min-h-9 gap-2.5"
                  : "min-h-8 gap-2 rounded-[var(--radius-pill)] bg-surface px-3 shadow-[var(--shadow-card)]",
              )}
            >
              {rows ? (
                <span aria-hidden="true" className="grid size-6 place-items-center rounded-[var(--radius-sm)] bg-surface text-ink shadow-[var(--shadow-card)]">
                  <Globe size={13} strokeWidth={1.6} />
                </span>
              ) : null}
              <span className={rows ? "flex-1" : undefined}>
                {articlePage.openIn(service.name)}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
              <ArrowOut className="text-ink-tertiary group-hover:text-ink" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * ArticleSidebar — the Clerk blog post sidebar, from `xl`: the category pill,
 * "Jump to" (the body's headings, with the active indicator) and "Ask AI about
 * this", sticky in the right column. It follows the article in the DOM, the
 * order it is read in beside it.
 *
 * A11y: a complementary landmark named "About this post".
 * Performance: server-rendered except the Toc and the assistant button.
 */
export function ArticleSidebar({ category, url, headings }: PostTools & { headings: TocItem[] }) {
  return (
    <aside aria-label="About this post" className="flex flex-col gap-10 xl:sticky xl:top-[var(--sticky-top)]">
      <CategoryPill category={category} />
      {headings.length > 0 ? <Toc items={headings} title={articlePage.jumpTo} className="static max-h-none" /> : null}
      <AskAbout url={url} layout="rows" />
    </aside>
  );
}

/**
 * ArticleTools — the same category and "Ask AI about this" below `xl`, as a
 * compact block at the end of the article's header: where it is seen is where
 * it sits in the DOM, so Tab reaches it after the lead rather than after the
 * whole article. The table of contents is left out there: a short article on a
 * phone reads straight through.
 */
export function ArticleTools({ category, url, className }: PostTools & { className?: string }) {
  return (
    <div className={cx("flex flex-col gap-5", className)}>
      <CategoryPill category={category} />
      <AskAbout url={url} layout="chips" />
    </div>
  );
}
