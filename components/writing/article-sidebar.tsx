import { ArrowUpRight, Globe } from "lucide-react";
import { articlePage } from "@/content/pages/writing";
import { Toc, type TocItem } from "@/components/ui/toc";
import { AskAssistantButton } from "./ask-assistant-button";

const HEADING = "text-[0.8125rem] font-semibold text-ink";

/**
 * ArticleSidebar — the Clerk blog post sidebar: the category pill, "Jump to"
 * (the body's headings, with the active indicator) and "Ask AI about this".
 *
 * From `xl` it is a sticky right column. Below `xl` it sits under the header as
 * a compact block (category and the ask links); the table of contents is
 * dropped there, since a short article on a phone reads straight through.
 *
 * A11y: a complementary landmark named "About this post"; the external links
 * open a new tab and say so; their icons are generic and decorative.
 * Performance: server-rendered except the Toc and the assistant button.
 */
export function ArticleSidebar({
  category,
  title,
  url,
  headings,
}: {
  category: string;
  title: string;
  url: string;
  headings: TocItem[];
}) {
  const prompt = encodeURIComponent(articlePage.externalPrompt(url));
  return (
    <aside aria-label="About this post" className="flex flex-col gap-5 xl:sticky xl:top-[var(--sticky-top)] xl:gap-10">
      <span className="w-fit rounded-[var(--radius-pill)] bg-ink px-2.5 py-1 text-[0.8125rem] font-semibold text-white">
        {category}
      </span>

      {headings.length > 0 ? (
        <Toc items={headings} title={articlePage.jumpTo} className="static hidden max-h-none xl:block" />
      ) : null}

      <section aria-labelledby="ask-ai-title">
        <h2 id="ask-ai-title" className={HEADING}>
          {articlePage.askTitle}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2 xl:grid xl:gap-1">
          <li>
            <AskAssistantButton label={articlePage.askAssistant} question={articlePage.askQuestion(title)} />
          </li>
          {articlePage.external.map((service) => (
            <li key={service.name}>
              <a
                href={service.href(prompt)}
                target="_blank"
                rel="noopener"
                className="group flex min-h-8 items-center gap-2.5 rounded-[var(--radius-pill)] bg-surface px-3 text-sm text-ink-secondary shadow-[var(--shadow-card)] transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink xl:min-h-9 xl:rounded-none xl:bg-transparent xl:px-0 xl:shadow-none"
              >
                <span aria-hidden="true" className="hidden size-6 xl:grid place-items-center rounded-[var(--radius-sm)] bg-surface text-ink shadow-[var(--shadow-card)]">
                  <Globe size={13} strokeWidth={1.6} />
                </span>
                <span className="xl:flex-1">
                  {articlePage.openIn(service.name)}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  size={14}
                  strokeWidth={1.6}
                  className="hidden text-ink-tertiary transition-transform xl:block duration-base ease-[var(--spring)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
