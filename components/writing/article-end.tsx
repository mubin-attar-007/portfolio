import { articlePage } from "@/content/pages/writing";
import type { Project } from "@/content/schema";
import { CopyButton } from "@/components/features/copy-button";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";

/**
 * ArticleEnd — what follows the body of a post: the share row (copy link), the
 * related case study when the post links one, and the invitation to get in
 * touch. Previous/next sits after it (ArticleFooter).
 *
 * A11y: the share row is a labelled group; the related project and the CTA are
 * sections with their own headings. Performance: server-rendered; the copy
 * button is the only client code.
 */
export function ArticleEnd({ path, related }: { path: string; related: Project | null }) {
  return (
    <div className="mt-16 flex max-w-[var(--width-prose)] flex-col gap-10">
      <div role="group" aria-label={articlePage.share.label} className="flex items-center justify-between gap-4 border-y border-dashed border-dots py-4">
        <span className="text-sm text-ink-secondary">{articlePage.share.label}</span>
        <CopyButton text={path} label={articlePage.share.copy} copiedLabel={articlePage.share.copied} icon="link" variant="pill" />
      </div>

      {related ? (
        <section aria-labelledby="related-title" className="rounded-[var(--radius-lg)] bg-surface p-6 shadow-[var(--shadow-card)]">
          <h2 id="related-title" className="text-[0.8125rem] font-semibold text-accent">
            {articlePage.related}
          </h2>
          <p className="mt-2 text-title text-ink">{related.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{related.summary}</p>
          <CaretLink href={`/work/${related.slug}`} className="mt-4">
            {`Read the ${related.title} case study`}
          </CaretLink>
        </section>
      ) : null}

      <section aria-labelledby="article-cta-title" className="flex flex-col items-start gap-4 rounded-[var(--radius-lg)] bg-plate p-6 text-plate-ink sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <h2 id="article-cta-title" className="text-title">
            {articlePage.cta.title}
          </h2>
          <p className="mt-1 text-sm text-plate-ink-secondary">{articlePage.cta.body}</p>
        </div>
        <Button href={articlePage.cta.href} variant="light" caret className="shrink-0">
          {articlePage.cta.label}
        </Button>
      </section>
    </div>
  );
}
