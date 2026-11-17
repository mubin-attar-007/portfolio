import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";
import { mdxComponents } from "@/components/mdx/mdx-components";

const FILE = path.join(process.cwd(), "content/now.mdx");
const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
const SECTION = /^## (.+)$/m;

export type NowEntry = { id: string; title: string; content: ReactElement };

const slug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * The /now body as changelog entries: one per `## ` section of content/now.mdx,
 * each compiled with the site's MDX components. The file stays one hand-edited
 * document (its front-matter is read and validated by `loadNow`); this only
 * splits the body where its author already did.
 */
export async function loadNowEntries(): Promise<NowEntry[]> {
  const body = fs.readFileSync(FILE, "utf8").replace(FRONT_MATTER, "");
  const parts = body.split(/^(?=## )/m).filter((part) => SECTION.test(part));
  return Promise.all(
    parts.map(async (part) => {
      const title = SECTION.exec(part)![1]!.trim();
      const { content } = await compileMDX({
        source: part.replace(SECTION, ""),
        components: mdxComponents,
      });
      return { id: slug(title), title, content };
    }),
  );
}
