/** /now page chrome; the copy itself is content/now.mdx and `nowPage` (content/site.ts). */
export const nowCopy = {
  timeline: "Now, by section",
  /** The category pill for each `## ` section, by its slug; a section without one shows none. */
  categories: {
    "building-now": "Building",
    exploring: "Exploring",
    reading: "Reading",
  } as Record<string, string>,
  exploringId: "exploring",
} as const;
