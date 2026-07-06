import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { WritingSchema, type WritingMeta } from "@/content/schema";
import { mdxComponents } from "@/components/mdx/mdx-components";

const DIR = path.join(process.cwd(), "content/writing");

function files(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
}

export function writingSlugs(): string[] {
  return files().map((f) => f.replace(/\.mdx$/, ""));
}

async function frontmatterOf(slug: string): Promise<WritingMeta> {
  const source = fs.readFileSync(path.join(DIR, `${slug}.mdx`), "utf8");
  const { frontmatter } = await compileMDX({ source, options: { parseFrontmatter: true } });
  return WritingSchema.parse({ ...(frontmatter as Record<string, unknown>), slug });
}

/** Published writing, newest first. Zod validates each — build fails on bad frontmatter. */
export async function allWriting(): Promise<WritingMeta[]> {
  const metas = await Promise.all(writingSlugs().map(frontmatterOf));
  return metas
    .filter((m) => !m.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function loadWriting(slug: string) {
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const source = fs.readFileSync(file, "utf8");
  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });
  const meta = WritingSchema.parse({ ...(frontmatter as Record<string, unknown>), slug });
  return { meta, content };
}
