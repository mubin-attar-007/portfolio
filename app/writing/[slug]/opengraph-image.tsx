import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { routableWritingSlugs, loadWriting } from "@/lib/writing";

export const alt = "Writing — Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** One OG image per post (static, at build time). */
export async function generateStaticParams() {
  return (await routableWritingSlugs()).map((slug) => ({ slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await loadWriting(slug);
  return renderOg({
    eyebrow: `writing · ${w?.meta.category ?? ""}`,
    title: w?.meta.title ?? "Writing",
    footerRight: `/writing/${slug}`,
  });
}
