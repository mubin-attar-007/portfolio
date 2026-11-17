import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { splitFrontmatter } from "@/lib/ai/corpus";

/**
 * The case-study frontmatter the product pages display: the tagline (the hero's
 * headline) and the stack. Read from content/projects/<slug>.mdx — the file
 * the assistant also indexes — so the headline and the stack are written once.
 * Server-only and synchronous: the routes are statically generated.
 */
const FrontmatterSchema = z.object({
  tagline: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
});
export type ProjectFrontmatter = z.infer<typeof FrontmatterSchema>;

export function projectFrontmatter(slug: string): ProjectFrontmatter {
  const file = path.join(process.cwd(), "content", "projects", `${slug}.mdx`);
  const { data } = splitFrontmatter(readFileSync(file, "utf8").replace(/\r\n?/g, "\n"), file);
  return FrontmatterSchema.parse(data);
}
