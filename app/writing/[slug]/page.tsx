import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { writingSlugs, loadWriting } from "@/lib/writing";
import { formatDate } from "@/lib/format";
import { SITE } from "@/config/site";
import { ArticleJsonLd } from "@/components/seo/json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return writingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = await loadWriting(slug);
  if (!w) return {};
  const url = `${SITE.url}/writing/${slug}`;
  return {
    title: w.meta.title,
    description: w.meta.summary,
    alternates: { canonical: url },
    openGraph: { type: "article", title: w.meta.title, description: w.meta.summary, url },
  };
}

export default async function WritingPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await loadWriting(slug);
  if (!w) notFound();
  const { meta, content } = w;
  const url = `${SITE.url}/writing/${slug}`;

  return (
    <Container className="py-16">
      <ArticleJsonLd
        title={meta.title}
        description={meta.summary}
        url={url}
        datePublished={meta.date}
        dateModified={meta.updated}
      />
      <Link href="/writing" className="font-mono text-xs text-ink-tertiary hover:text-ink">
        ← Writing
      </Link>
      <article className="mt-8 max-w-[var(--width-prose)]">
        <p className="font-mono text-xs uppercase text-ink-tertiary">
          {meta.category} · {formatDate(meta.date)}
          {meta.updated ? ` · updated ${formatDate(meta.updated)}` : ""}
        </p>
        <h1 className="mt-4 text-4xl text-ink">{meta.title}</h1>
        <p className="mt-4 text-lg text-ink-secondary">{meta.summary}</p>
        <div className="mt-8">{content}</div>
      </article>
      <div className="mt-16 max-w-[var(--width-prose)] border-t border-border pt-8">
        <Link href="/writing" className="text-sm font-medium text-accent hover:text-accent-hover">
          ← All writing
        </Link>
      </div>
    </Container>
  );
}
