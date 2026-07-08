import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { noteSlugs, loadNote } from "@/lib/notes";
import { formatDate } from "@/lib/format";
import { SITE } from "@/config/site";
import { ArticleJsonLd } from "@/components/seo/json-ld";
import { NewsletterForm } from "@/components/features/newsletter-form";

export const dynamicParams = false;

export function generateStaticParams() {
  return noteSlugs().map((slug) => ({ slug }));
}

const describe = (tags: string[]) => `A short note on ${tags.join(", ")}.`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = await loadNote(slug);
  if (!n) return {};
  const url = `${SITE.url}/notes/${slug}`;
  const description = describe(n.meta.tags);
  return {
    title: n.meta.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: n.meta.title, description, url },
  };
}

export default async function NotePost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await loadNote(slug);
  if (!n) notFound();
  const { meta, content } = n;
  const url = `${SITE.url}/notes/${slug}`;

  return (
    <Container className="py-16">
      <ArticleJsonLd
        title={meta.title}
        description={describe(meta.tags)}
        url={url}
        datePublished={meta.date}
      />
      <Link href="/notes" className="font-mono text-xs text-ink-tertiary hover:text-ink">
        ← Notes
      </Link>
      <article className="mt-8 max-w-[var(--width-prose)]">
        <p className="font-mono text-xs uppercase text-ink-tertiary">note · {formatDate(meta.date)}</p>
        <h1 className="mt-4 text-3xl text-ink sm:text-4xl">{meta.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex flex-wrap gap-x-2 gap-y-1">
            {meta.tags.map((t) => (
              <span key={t} className="font-mono text-xs text-ink-tertiary">
                #{t}
              </span>
            ))}
          </span>
          {meta.source ? (
            <a
              href={meta.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-ink-tertiary underline decoration-border-strong underline-offset-4 hover:text-accent hover:decoration-accent"
            >
              source <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden />
            </a>
          ) : null}
        </div>
        <div className="mt-8">{content}</div>
      </article>
      <div className="mt-16 max-w-[var(--width-prose)] border-t border-border pt-8">
        <NewsletterForm />
      </div>
      <div className="mt-10 max-w-[var(--width-prose)]">
        <Link href="/notes" className="text-sm font-medium text-accent hover:text-accent-hover">
          ← All notes
        </Link>
      </div>
    </Container>
  );
}
