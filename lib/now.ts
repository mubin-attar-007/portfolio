import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { NowSchema } from "@/content/schema";
import { mdxComponents } from "@/components/mdx/mdx-components";

const FILE = path.join(process.cwd(), "content/now.mdx");

/**
 * Load the single /now MDX file. Zod validates the front-matter (`updated`,
 * `lede`) at build — a missing `updated` fails the build, so the page's
 * "Last updated" line can never go silently stale.
 */
export async function loadNow() {
  const source = fs.readFileSync(FILE, "utf8");
  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });
  const meta = NowSchema.parse(frontmatter as Record<string, unknown>);
  return { meta, content };
}
