import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { noteSlugs, loadNote } from "@/lib/notes";

export const alt = "Note — Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** One OG image per note (static, at build time). */
export function generateStaticParams() {
  return noteSlugs().map((slug) => ({ slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await loadNote(slug);
  return renderOg({
    eyebrow: `note · ${n?.meta.tags.slice(0, 3).join(" · ") ?? ""}`,
    title: n?.meta.title ?? "Note",
    footerRight: `/notes/${slug}`,
  });
}
